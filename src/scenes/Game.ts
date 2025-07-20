import { Scene } from "phaser";
import { Tomato } from "../unit/Tomato";
import { Bullet } from "../entity/Bullet";
import { Company } from "../unit_group/Company";
import { UnitFactory } from "../unit/UnitFactory";
import { Army } from "../unit_group/Army";
import { Unit } from "../unit/Unit";
import { Smoke } from "../entity/Smoke";
import { GunFireEvent } from "../item_event/GunFireEvent";
import { WeaponFactory } from "../item/WeaponFactory";
import { AudioPool } from "../pool/AudioPool";
import { Gun } from "../item/Gun";
import { Utils } from "../util/Utils";
import { Stats } from "../util/Stats";
import { Settings } from "../util/Settings";
import { BulletTrail } from "../entity/BulletTrail";
import StatsScene from "./subscenes/StatsScene";
import BattleInfoScene from "./subscenes/BattleInfoScene";
import { Melee } from "../item/Melee";
import { MeleeAttackEvent } from "../item_event/MeleeAttackEvent";
import { BulletPool } from "../pool/BulletPool";
import { SmokePool } from "../pool/SmokePool";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;

  private tomatoPlayer: Phaser.GameObjects.Container;

  public readonly MOVE_SPEED = 25;
  private readonly IS_DEBUG_MODE = false;

  //TODO: one set of bullets. friendly fire
  //TODO: test with regular group with regular sprites
  public friendlyBullets: Phaser.Physics.Arcade.Group;
  public enemyBullets: Phaser.Physics.Arcade.Group;

  /**
   * Melee weapons that are actively dangerous. For collision checking.
   */
  public attackingMeleesHitboxes: Phaser.Physics.Arcade.Group;

  /**
   * Melee Containers here will be have update() called for their data.
   */
  public attackingMeleeContainers: Set<Phaser.GameObjects.Container>;

  /**
   * BulletTrail line -> BulletTrail data
   */
  public bulletTrailEntities: Map<Phaser.Geom.Line, BulletTrail>;
  public smokeEntities: Set<Phaser.GameObjects.Sprite>;

  //TODO: static enums
  public static readonly TEAM_A = 1;
  public static readonly TEAM_B = 2;

  private friendlyArmy: Army;
  private enemyArmy: Army;

  /**
   * Entity Enums
   */
  private bulletPool: BulletPool;
  private smokePool: SmokePool;

  /**
   * controls
   */
  private keyW: Phaser.Input.Keyboard.Key;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keyZ: Phaser.Input.Keyboard.Key;
  private keyX: Phaser.Input.Keyboard.Key;

  /**
   * audios
   */
  private audioHitmarker: Phaser.Sound.BaseSound;
  private audioGunClick: Phaser.Sound.BaseSound;
  private bugleCompleteAudioPool: AudioPool;
  private musketFireAudioPool: AudioPool;

  /**
   * environmental
   */
  /**
   * in pixels
   */
  private windMagnitudeX: number;
  private windMagnitudeY: number;

  /**
   * Pixel distance. At this distance from the player is 0% volume.
   * On player is 100%.
   */
  private static readonly VOLUME_DISTANCE = 7500;

  /**
   * Mainly for bullet trails
   */
  private graphics: Phaser.GameObjects.Graphics;

  /**
   * UI
   */
  private statsScene: StatsScene;
  private battleInfoScene: BattleInfoScene;

  /**
   * The amount of time (ms) the game over has been achieved.
   */
  private gameOverDuration: number;

  /**
   * Wait for these many seconds until actually declaring game over.
   */
  private readonly GAME_OVER_WAIT_MAX = 5000;

  /**
   * If this is on, stop update()
   */
  private isStopUpdate: boolean;

  constructor() {
    super("Game");
  }

  create() {
    Settings.setIsDebugMode(this.IS_DEBUG_MODE);

    this.gameOverDuration = 0;
    this.isStopUpdate = false;

    /**
     * camera junk
     */
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x006400);
    this.camera.centerOn(0, 0);
    this.camera.setZoom(0.1);

    this.background = this.add.image(0, 0, "background");
    this.background.setScale(50);
    this.background.setAlpha(0.1);

    /**
     * Entity Pools
     */
    this.bulletPool = new BulletPool(this);
    this.smokePool = new SmokePool(this);

    //pre-create entities
    //should be at least to amount of people with guns.
    const numTomato = 200;

    for (let b = 0; b < numTomato; b++) {
      const bullet = this.bulletPool.getBullet();
      this.bulletPool.addAndResetBullet(bullet);
    }

    for(let s = 0; s < numTomato * 2; s++) {
      const smoke = this.smokePool.getSmoke();
      this.smokePool.addAndResetSmoke(smoke);
    }

    /**
     * entities
     */
    this.friendlyBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.attackingMeleesHitboxes = this.physics.add.group();
    this.attackingMeleeContainers = new Set();

    this.smokeEntities = new Set();
    this.bulletTrailEntities = new Map();

    this.audioHitmarker = this.sound.add("audio-hitmarker-player");
    this.audioGunClick = this.sound.add("audio-gun-click");
    this.musketFireAudioPool = new AudioPool(this, "audio-musket-fire", 25);
    this.bugleCompleteAudioPool = new AudioPool(
      this,
      "audio-bugle-complete",
      10
    );

    this.windMagnitudeX = Utils.rollRandomExclusiveNegative(5);
    this.windMagnitudeY = Utils.rollRandomExclusiveNegative(5);

    this.msg_text = this.add.text(
      400,
      450,
      `Make something fun!\nand share it with us:\nsupport@phaser.io x`,
      {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      }
    );
    this.msg_text.setOrigin(0.5);

    this.initKeyboard();

    this.friendlyArmy = new Army(this, Game.TEAM_A);
    this.enemyArmy = new Army(this, Game.TEAM_B);

    /**
     * Make player tomato
     */
    const pikeContainer = WeaponFactory.makePikeSpriteWithData(this);

    //TODO: add also a rifle then pike
    this.tomatoPlayer = UnitFactory.createTomato(
      this,
      //WeaponFactory.makeRifleSpriteWithData(this)
      pikeContainer
    );
    const tomatoData: Unit = this.tomatoPlayer.getData("data") as Unit;
    tomatoData.setIsPlayerOwned(true);
    const mySelectedItem = tomatoData.getSelectedItem();
    if (mySelectedItem instanceof Gun) {
      mySelectedItem.setCooldownIsOverCallback(() => {
        (this.audioGunClick as Phaser.Sound.HTML5AudioSound).setVolume(
          Settings.getCurrentVolume()
        );
        this.audioGunClick.play();
      });
    }

    const yourCompany = new Company(this, "A-company-player");
    yourCompany.addUnit(tomatoData);

    this.friendlyArmy.addOrganization(yourCompany);

    //note: 10k units = significant lag
    this.makeEnemies(100);

    this.makeFriends(100);

    //move player to center
    this.tomatoPlayer.x += 15200;
    this.tomatoPlayer.y += 1000;

    Stats.incrementStat(
      "friendly-army-units-started",
      this.friendlyArmy.getAliveArmyCount()
    );
    Stats.incrementStat(
      "enemy-army-units-started",
      this.enemyArmy.getAliveArmyCount()
    );

    //for drawing bullet trails, and perhaps other types of shapes
    this.graphics = this.add.graphics();

    /**
     * ui
     */
    //turn on this scene
    this.statsScene = new StatsScene();
    this.battleInfoScene = new BattleInfoScene(this);

    this.scene.add(StatsScene.HANDLE, this.statsScene, false);
    this.scene.add(BattleInfoScene.HANDLE, this.battleInfoScene, true);

    this.input.setDefaultCursor("crosshair");
  }

  private initKeyboard() {
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.keyZ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }

  private makeEnemies(numEnemies: number) {
    const numCompanies = 4;
    for (let c = 0; c < numCompanies; c++) {
      const name = "B-company-" + c;
      const company = new Company(this, name);

      for (let i = 0; i < numEnemies; i++) {
        const tomato = UnitFactory.createTomato(this);
        company.addUnit(tomato.getData("data"));
      }

      this.enemyArmy.addOrganization(company);
    }
    this.enemyArmy.initFormation(-6000, 0, 15, 90);

    //add enemy tint
    const sprites = this.enemyArmy.getUnitHitSprites();
    sprites.getChildren().forEach((gameObj) => {
      const sprite =
        gameObj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      sprite.setTint(0x87ceeb); // sky blue, makes dark red.
    });
  }

  private makeFriends(numUnits: number) {
    const numCompanies = 4;
    for (let c = 0; c < numCompanies; c++) {
      const name = "A-company-" + c;
      const company = new Company(this, name);

      for (let i = 0; i < numUnits; i++) {
        const tomato = UnitFactory.createTomato(this);
        company.addUnit(tomato.getData("data"));
      }
      this.friendlyArmy.addOrganization(company);
    }

    this.friendlyArmy.initFormation(-12000, 10000, 10, -90);
  }

  /**
   * The main game loop.
   * @param _ current time
   * @param delta in milliseconds since last update
   */
  update(_: any, delta: any) {
    //note: if people die first, then remove and stop processing them.

    if (this.isStopUpdate) {
      return;
    }

    this.updateSmokes(delta);
    this.updateBullets(delta);
    this.updateMeleeDrawing();

    this.checkCollisions();

    this.enemyArmy.update(delta);
    this.friendlyArmy.update(delta);

    this.processInput(delta);

    //call only once
    if (this.isGameOver()) {
      //let the game wait a bit after game over before stopping the game
      if (this.gameOverDuration < this.GAME_OVER_WAIT_MAX) {
        this.gameOverDuration += delta;
        return;
      }

      this.isStopUpdate = true;

      console.log("game is over");
      Stats.setStat(
        "friendly-army-units-alive",
        this.friendlyArmy.getAliveArmyCount()
      );
      Stats.setStat(
        "enemy-army-units-alive",
        this.enemyArmy.getAliveArmyCount()
      );

      console.table(Stats.getStatsMap());

      this.scene.launch(StatsScene.HANDLE);
    }
  }

  processInput(_delta: number) {
    /**
     * movement
     */
    if (this.keyW.isDown) {
      //TODO: think later. cannot set velocity on 1 out of 2 sprites. not ez with container
      // let body = this.tomato.getByName(
      //   "body"
      // ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

      // body.setVelocityY(-this.MOVE_SPEED);
      this.tomatoPlayer.setY(this.tomatoPlayer.y - this.MOVE_SPEED);
    }

    if (this.keyS.isDown) {
      this.tomatoPlayer.setY(this.tomatoPlayer.y + this.MOVE_SPEED);
    }

    if (this.keyA.isDown) {
      this.tomatoPlayer.setX(this.tomatoPlayer.x - this.MOVE_SPEED);
    }

    if (this.keyD.isDown) {
      this.tomatoPlayer.setX(this.tomatoPlayer.x + this.MOVE_SPEED);
    }

    if (this.keyZ.isDown) {
      this.cameras.main.zoom += 0.002;
    }
    if (this.keyX.isDown) {
      this.cameras.main.zoom -= 0.002;
    }

    //player's left click
    this.input.on("pointerdown", () => {
      //this.scene.start('GameOver');

      //player shoots
      const tomatoData: Tomato = this.tomatoPlayer.getData("data");
      const event = tomatoData.doAction();

      //TODO: merge this with army doAction() code later.

      //TODO: could use a map of the items so we can have laser guns or even shotguns. (different bullet scheme)
      if (event.name.startsWith("item-gun") && event.name.endsWith("fire")) {
        this.shootBullet(tomatoData, Game.TEAM_A, event as GunFireEvent);
      }

      if (
        event.name.startsWith("item-melee") &&
        event.name.endsWith("attack")
      ) {
        this.beginMelee(tomatoData, Game.TEAM_A, event as MeleeAttackEvent);
      }
    });

    //set player's tomato facing
    this.input.mousePointer.updateWorldPoint(this.camera);
    const playerX = this.tomatoPlayer.x;
    const playerY = this.tomatoPlayer.y;
    const mouseX = this.input.mousePointer.worldX;
    const mouseY = this.input.mousePointer.worldY;
    const angle =
      Phaser.Math.RAD_TO_DEG *
      Phaser.Math.Angle.Between(playerX, playerY, mouseX, mouseY);
    this.tomatoPlayer.setAngle(angle);

    this.camera.centerOn(playerX, playerY);
  }

  /**
   * Move the smokes and make them disappear over time.
   * @param delta 
   */
  private updateSmokes(delta: number): void {
    for (let smokeSprite of this.smokeEntities) {
      let smokeData: Smoke = smokeSprite.getData("data");
      smokeData.update(delta);

      if (smokeData.isExpired()) {
        this.smokeEntities.delete(smokeSprite);

        this.smokePool.addAndResetSmoke(smokeSprite);
      }

      //update apperance
      smokeSprite.x += this.windMagnitudeX;
      smokeSprite.y += this.windMagnitudeY;
      smokeSprite.setAlpha(smokeData.getOpacity());
    }
  }

  /**
   * Call after bullets are updated.
   * @param delta
   */
  private updateBulletTrails(delta: number): void {
    this.graphics.clear();
    this.graphics.setAlpha(0.4); //all bullet trails
    this.graphics.lineStyle(25, 0xffffff); //white

    //TODO: use pool
    for (const [bulletTrail, bulletTrailData] of this.bulletTrailEntities) {
      bulletTrailData.update(delta);

      if (bulletTrailData.isExpired()) {
        this.bulletTrailEntities.delete(bulletTrail);
        //TODO: use pool
        continue;
      }

      //calc trail tail
      const bulletSprite = bulletTrailData.getBulletSprite();
      bulletTrail.x2 = bulletSprite.x;
      bulletTrail.y2 = bulletSprite.y;

      if (!bulletTrailData.shouldGrow()) {
        //stop growing bullet trail
        bulletTrail.x1 = bulletTrailData.getEndX();
        bulletTrail.y1 = bulletTrailData.getEndY();
      }

      this.graphics.strokeLineShape(bulletTrail);
    }
  }

  //TODO: maybe put team number in unit? too much memory?
  public shootBullet(
    unit: Unit,
    teamNumber: number,
    gunFireEvent: GunFireEvent
  ): void {
    const unitContainer = unit.getUnitContainer();

    const bulletSprite = this.bulletPool.getBullet(gunFireEvent.damage);
    bulletSprite.x = unitContainer.x;
    bulletSprite.y = unitContainer.y;

    const bulletData = bulletSprite.getData("data");

    if (unit.getIsPlayerOwned()) {
      bulletData.setIsPlayerOwned(true);
    }

    //note: when adding to group, velocity will be set to 0.
    if (teamNumber == Game.TEAM_A) {
      Stats.incrementStat("friendly-shots-fired"); //and player
      this.friendlyBullets.add(bulletSprite);
    } else if (teamNumber == Game.TEAM_B) {
      Stats.incrementStat("enemy-shots-fired");
      this.enemyBullets.add(bulletSprite);
    }

    if (bulletData.getIsPlayerOwned()) {
      Stats.incrementStat("player-shots-fired");
    }

    //note: velocity allows for collision detection. setX doesn't work like that.
    const randomRotationAdd = gunFireEvent.fireAngle;
    this.physics.velocityFromAngle(
      unitContainer.angle + randomRotationAdd,
      Bullet.BULLET_SPEED,
      bulletSprite.body.velocity
    );

    //make smoke
    const smokeSprite = this.smokePool.getSmoke();
    smokeSprite.x = unitContainer.x;
    smokeSprite.y = unitContainer.y;
    smokeSprite.setScale(3);
    smokeSprite.setAngle(unitContainer.angle);

    this.smokeEntities.add(smokeSprite);

    //TODO: make entity pool
    //make bullet trail
    const bulletTrail = new Phaser.Geom.Line(
      bulletSprite.x,
      bulletSprite.y,
      bulletSprite.x,
      bulletSprite.y
    );
    this.graphics.strokeLineShape(bulletTrail);
    Phaser.Geom.Line.Rotate(bulletTrail, bulletSprite.rotation);
    this.bulletTrailEntities.set(bulletTrail, new BulletTrail(bulletSprite));

    //TODO: bullet trail pool

    // make loud noises
    const volume = this.getVolumeFromPlayer(unitContainer.x, unitContainer.y);
    this.musketFireAudioPool.play(volume);
  }

  /**
   * Start the melee movement and attack process.
   * @param unit -
   * @param teamNumber -
   * @param meleeAttackEvent -
   */
  public beginMelee(
    unit: Unit,
    _: number,
    __: MeleeAttackEvent
  ): void {
    const container = unit.getUnitContainer();
    const weaponContainer: Phaser.GameObjects.Container = container.getByName("weapon");
    const weaponHitbox = weaponContainer.getData("hitbox");
    const weaponData: Melee = weaponContainer.getData("data");

    weaponData.setKillModeIsOffCallback(() => this.attackingMeleesHitboxes.remove(weaponHitbox));
    weaponData.setCooldownIsOverCallback(() =>
      this.attackingMeleeContainers.delete(container)
    );

    this.attackingMeleesHitboxes.add(weaponHitbox);
    this.attackingMeleeContainers.add(weaponContainer);
  }

  public playBugle(x: number, y: number) {
    const volume = this.getVolumeFromPlayer(x, y);
    this.bugleCompleteAudioPool.play(volume);
  }

  /**
   * Far away sounds are quiet relative to the player.
   * @param x
   * @param y
   * @returns A value [0, 1]. 0 is 0%. 1 is 100%.
   */
  private getVolumeFromPlayer(x: number, y: number) {
    const distance = Phaser.Math.Distance.Between(
      x,
      y,
      this.tomatoPlayer.x,
      this.tomatoPlayer.y
    );

    let volume =
      Math.max(0, Game.VOLUME_DISTANCE - distance) / Game.VOLUME_DISTANCE;

    volume = volume * Settings.getCurrentVolume();

    return volume;
  }

  /**
   * Move bullets and interact with other objects.
   * @param delta 
   */
  private updateBullets(delta: number) {
    this.friendlyBullets.getChildren().forEach((bulletSprite) => {
      const physBulletSprite = bulletSprite as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      const bullet: Bullet = bulletSprite.getData("data");

      bullet.update(delta);

      if (bullet.isExpired()) {
        this.bulletPool.addAndResetBullet(physBulletSprite);
        this.friendlyBullets.remove(bulletSprite);
        Stats.incrementStat("friendly-misses");

        if (bullet.getIsPlayerOwned()) {
          Stats.incrementStat("player-misses-enemy");
        }
      }
    });

    this.enemyBullets.getChildren().forEach((bulletSprite) => {
      const physBulletSprite = bulletSprite as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      const bullet: Bullet = bulletSprite.getData("data");

      bullet.update(delta);

      if (bullet.isExpired()) {
        this.bulletPool.addAndResetBullet(physBulletSprite);
        this.enemyBullets.remove(bulletSprite);
        Stats.incrementStat("enemy-misses");
      }
    });

    this.updateBulletTrails(delta); //call this after the bullets are updated
  }

  /**
   * Melee weapons which is attacking are moved forward and back.
   * The weapon data holds movement offset.
   * For now, a Unit's selected item is given update(delta)
   */
  private updateMeleeDrawing(): void {
    this.attackingMeleeContainers.forEach((meleeContainer) => {
      const meleeData: Melee = meleeContainer.getData("data");
      const weaponOriginalOffsetX = meleeContainer.getData("offset_x")
      const weaponOriginalOffsetY = meleeContainer.getData("offset_y")

      //redraw moving melee containers with offset
      meleeContainer.setX(weaponOriginalOffsetX + meleeData.getOffsetX());
      meleeContainer.setY(weaponOriginalOffsetY + meleeData.getOffsetY());
    });
  }

  private checkCollisions() {
    //TODO: friendly fire

    //friends collide with enemy bullets
    this.physics.world.overlap(
      this.friendlyArmy.getUnitHitSprites(),
      this.enemyBullets,
      this.collideFriendlyWithEnemyBullets.bind(this),
      undefined,
      this
    );

    //enemies collide with friendly bullets
    this.physics.world.overlap(
      this.enemyArmy.getUnitHitSprites(),
      this.friendlyBullets,
      this.collideEnemyWithFriendlyBullets.bind(this),
      undefined,
      this
    );

    //TODO: friendly fire
    //check melee hits any units
    this.physics.world.overlap(
      this.friendlyArmy.getUnitHitSprites(),
      this.attackingMeleesHitboxes,
      this.collideUnitsWithMelee.bind(this),
      undefined,
      this
    );

    this.physics.world.overlap(
      this.enemyArmy.getUnitHitSprites(),
      this.attackingMeleesHitboxes,
      this.collideUnitsWithMelee.bind(this),
      undefined,
      this
    );

    //note: only works if velocity is set.
    //containers cannot have velocity because they are not bodies
    //TODO: check later
    // this.physics.world.collide(
    //   this.friendlySprites,
    //   this.enemySprites,
    //   (a, b) => {
    //     console.log("collision");
    //   }
    // );
  }

  //TODO: try to make this func more generic and merge the two functions
  //no tiles
  private collideFriendlyWithEnemyBullets(
    friendlySprite:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    bulletSprite:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ): void {
    const bulletData: Bullet = (
      bulletSprite as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody
    ).getData("data");

    const physicsSprite =
      friendlySprite as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
    const unit: Unit = physicsSprite.getData("data");

    unit.decrementHp(bulletData.getDamage());

    if (unit.isDead()) {
      this.friendlyArmy.removeUnit(unit);

      const unitContainer = unit.getUnitContainer();
      const deadBodySprite = this.add.sprite(
        unitContainer.x,
        unitContainer.y,
        "unit-tomato-dead"
      );

      deadBodySprite.setAngle(unitContainer.angle);
      deadBodySprite.setDepth(-1);

      Stats.incrementStat("friendly-dead");
    }

    this.enemyBullets.remove(bulletSprite as Phaser.GameObjects.GameObject);
    bulletSprite.destroy();

    Stats.incrementStat("enemy-hits-friendly");

    //TODO: destroy container, but not guns
    //TODO: add dead bodies
  }

  private collideEnemyWithFriendlyBullets(
    enemySprite:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    bulletSprite:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ): void {
    const bulletData: Bullet = (
      bulletSprite as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody
    ).getData("data");

    const physicsSprite =
      enemySprite as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
    const unit: Unit = physicsSprite.getData("data");
    const bullet: Bullet = (bulletSprite as Phaser.GameObjects.Sprite).getData(
      "data"
    );

    if (bullet.getIsPlayerOwned()) {
      (this.audioHitmarker as Phaser.Sound.HTML5AudioSound).setVolume(
        Settings.getCurrentVolume()
      );
      this.audioHitmarker.play();

      Stats.incrementStat("player-hits-enemy");
    }

    unit.decrementHp(bulletData.getDamage());

    if (unit.isDead()) {
      this.enemyArmy.removeUnit(unit);

      const unitContainer = unit.getUnitContainer();
      const deadBodySprite = this.add.sprite(
        unitContainer.x,
        unitContainer.y,
        "unit-tomato-dead"
      );

      deadBodySprite.setAngle(unitContainer.angle);
      deadBodySprite.setDepth(-1);

      Stats.incrementStat("enemy-dead");

      if (bullet.getIsPlayerOwned()) {
        Stats.incrementStat("player-kills-enemy");
      }
    }

    this.friendlyBullets.remove(bulletSprite as Phaser.GameObjects.GameObject);
    bulletSprite.destroy();

    Stats.incrementStat("friendly-hits-enemy");
    //TODO: destroy container, but not guns
    //TODO: add dead bodies
  }

  private collideUnitsWithMelee(
    unitSprite:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    meleeSprite:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ) {
    const meleeData: Melee = (
      meleeSprite as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody
    ).getData("data");

    const physicsSprite =
      unitSprite as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
    const unit: Unit = physicsSprite.getData("data");

    //your weapon? do nothing
    const unitContainer = unit.getUnitContainer();
    const unitWeaponSprite = unitContainer.getByName("weapon");
    if (unitWeaponSprite == meleeSprite) {
      return;
    }

    //TODO: player stats and more stats

    unit.decrementHp(meleeData.calcDamage());

    if (unit.isDead()) {
      //it's in one of these
      this.friendlyArmy.removeUnit(unit);
      this.enemyArmy.removeUnit(unit);

      const unitContainer = unit.getUnitContainer();
      const deadBodySprite = this.add.sprite(
        unitContainer.x,
        unitContainer.y,
        "unit-tomato-dead"
      );
      //TODO: enums for unit-tomato-dead etc

      deadBodySprite.setAngle(unitContainer.angle);
      deadBodySprite.setDepth(-1);
    }

    //TODO: destroy container, but not guns
  }

  public getFriendlyArmy() {
    return this.friendlyArmy;
  }

  public getEnemyArmy() {
    return this.enemyArmy;
  }

  private isGameOver(): boolean {
    return this.friendlyArmy.isDefeated() || this.enemyArmy.isDefeated();
  }

  public getPlayerUnit() {
    return this.tomatoPlayer;
  }
}
