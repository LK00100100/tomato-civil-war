import { Scene } from "phaser";
import { Tomato } from "../unit/Tomato";
import { Bullet } from "../entity/Bullet";
import { Company } from "../unit_group/Company";
import { UnitFactory } from "../unit/UnitFactory";
import { Army } from "../unit_group/Army";
import { Unit } from "../unit/Unit";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;

  private tomato: Phaser.GameObjects.Container;

  public readonly MOVE_SPEED = 25;
  public readonly BULLET_SPEED = 2000;

  public friendlyBullets: Phaser.Physics.Arcade.Group;
  public enemyBullets: Phaser.Physics.Arcade.Group;

  //TODO: static enums
  public static readonly teamA = 1;
  public static readonly teamB = 2;

  //TODO: bullet pool

  private friendlyArmy: Army;
  private enemyArmy: Army;

  /**
   * controls
   */
  private keyW: Phaser.Input.Keyboard.Key;
  private keyA: Phaser.Input.Keyboard.Key;
  private keyS: Phaser.Input.Keyboard.Key;
  private keyD: Phaser.Input.Keyboard.Key;
  private keyZ: Phaser.Input.Keyboard.Key;
  private keyX: Phaser.Input.Keyboard.Key;

  constructor() {
    super("Game");
  }

  create() {
    /**
     * camera junk
     */
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);
    this.camera.centerOn(0, 0);
    this.camera.setZoom(0.2);

    this.background = this.add.image(0, 0, "background");
    this.background.setScale(50);
    this.background.setAlpha(0.5);

    this.friendlyBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

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

    this.friendlyArmy = new Army(this, Game.teamA);
    this.enemyArmy = new Army(this, Game.teamB);

    this.tomato = UnitFactory.createTomato(this);
    const tomatoData: Unit = this.tomato.getData("data") as Unit;
    tomatoData.setIsPlayerOwned(true);

    const yourCompany = new Company(this);
    yourCompany.addUnit(tomatoData);

    this.friendlyArmy.addOrganization(yourCompany);

    this.makeEnemies(30);
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
    const company = new Company(this);

    for (let i = 0; i < numEnemies; i++) {
      const tomato = UnitFactory.createTomato(this);
      company.addUnit(tomato.getData("data"));
    }

    this.enemyArmy.addOrganization(company);
    this.enemyArmy.formUp(-700, -3700);

    //add enemy tint
    const sprites = this.enemyArmy.getUnitHitSprites();
    sprites.getChildren().forEach((gameObj) => {
      const sprite =
        gameObj as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
      sprite.setTint(0x87ceeb); // sky blue, makes dark red.
    });
  }

  /**
   *
   * @param _ time
   * @param delta in milliseconds since last update
   */
  update(_: any, delta: any) {
    this.enemyArmy.update(delta);
    this.friendlyArmy.update(delta);

    this.processInput(delta);

    this.updateBullets(delta);

    this.checkCollisions();

    if (this.isGameOver()) {
      console.log("game is over");
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
      this.tomato.setY(this.tomato.y - this.MOVE_SPEED);
    }

    if (this.keyS.isDown) {
      this.tomato.setY(this.tomato.y + this.MOVE_SPEED);
    }

    if (this.keyA.isDown) {
      this.tomato.setX(this.tomato.x - this.MOVE_SPEED);
    }

    if (this.keyD.isDown) {
      this.tomato.setX(this.tomato.x + this.MOVE_SPEED);
    }

    if (this.keyZ.isDown) {
      this.cameras.main.zoom -= 0.01;
    }
    if (this.keyX.isDown) {
      this.cameras.main.zoom += 0.01;
    }

    //player's left click
    this.input.on("pointerdown", () => {
      //this.scene.start('GameOver');

      //player shoots
      const tomatoData: Tomato = this.tomato.getData("data");
      const event = tomatoData.doAction();
      if (event == "item-gun-fire") {
        this.shootPlayerBullet();
      }

      //set movement
    });

    //set player's tomato facing
    this.input.mousePointer.updateWorldPoint(this.camera);
    const playerX = this.tomato.x;
    const playerY = this.tomato.y;
    const mouseX = this.input.mousePointer.worldX;
    const mouseY = this.input.mousePointer.worldY;
    const angle =
      Phaser.Math.RAD_TO_DEG *
      Phaser.Math.Angle.Between(playerX, playerY, mouseX, mouseY);
    this.tomato.setAngle(angle);

    this.camera.centerOn(playerX, playerY);
  }

  /**
   * Player is shooting a bullet
   */
  private shootPlayerBullet() {
    const bulletSprite = this.physics.add.sprite(
      this.tomato.x,
      this.tomato.y,
      "item-bullet"
    );

    bulletSprite.setData("data", new Bullet());

    //note: when adding to group, velocity will be set to 0.
    this.friendlyBullets.add(bulletSprite);

    this.physics.velocityFromRotation(
      this.tomato.rotation,
      this.BULLET_SPEED,
      bulletSprite.body.velocity
    );
  }

  private updateBullets(delta: number) {
    this.friendlyBullets.getChildren().forEach((bulletSprite) => {
      const bullet: Bullet = bulletSprite.getData("data");

      bullet.update(delta);

      if (bullet.isExpired()) {
        bulletSprite.destroy();
        this.friendlyBullets.remove(bulletSprite);
      }
    });

    this.enemyBullets.getChildren().forEach((bulletSprite) => {
      const bullet: Bullet = bulletSprite.getData("data");

      bullet.update(delta);

      if (bullet.isExpired()) {
        bulletSprite.destroy();
        this.enemyBullets.remove(bulletSprite);
      }
    });
  }

  private checkCollisions() {
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

  //no tiles
  private collideFriendlyWithEnemyBullets(
    friendlySprite:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    bulletSprite:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ): void {
    bulletSprite.destroy();
    const physicsSprite =
      friendlySprite as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
    const unit = physicsSprite.getData("data");

    this.friendlyArmy.removeUnit(unit);
    this.enemyBullets.remove(bulletSprite as Phaser.GameObjects.GameObject);

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
    const physicsSprite =
      enemySprite as Phaser.Types.Physics.Arcade.GameObjectWithDynamicBody;
    const unit = physicsSprite.getData("data");

    bulletSprite.destroy();
    this.enemyArmy.removeUnit(unit);

    this.friendlyBullets.remove(bulletSprite as Phaser.GameObjects.GameObject);

    //TODO: destroy container, but not guns
    //TODO: add dead bodies
  }

  public getFriendlyArmy() {
    return this.friendlyArmy;
  }

  public getEnemyArmy() {
    return this.enemyArmy;
  }

  private isGameOver(): boolean {
    return false;
  }
}
