import { Scene } from "phaser";
import { Tomato } from "../unit/Tomato";
import { Gun } from "../item/Gun";
import { Bullet } from "../entity/Bullet";
import { BulletPouch } from "../item/BulletPouch";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;

  private tomato: Phaser.GameObjects.Container;

  private readonly MOVE_SPEED = 25;
  private readonly BULLET_SPEED = 2000;

  private friendlyBullets: Phaser.Physics.Arcade.Group;
  private enemyBullets: Phaser.Physics.Arcade.Group;

  //TODO: bullet pool

  private friendlySprites: Phaser.Physics.Arcade.Group;
  private enemySprites: Phaser.Physics.Arcade.Group;

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
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x00ff00);
    this.camera.centerOn(0, 0);
    this.camera.setZoom(0.2);

    this.background = this.add.image(0, 0, "background");
    this.background.setScale(50);
    this.background.setAlpha(0.5);

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

    this.tomato = this.createTomato();
    const playerSprite = this.tomato.getByName(
      "body"
    ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    this.friendlyBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();

    this.friendlySprites = this.physics.add.group();
    this.friendlySprites.add(playerSprite);

    this.enemySprites = this.physics.add.group();

    /**
     * keyboard
     */
    this.keyW = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.keyZ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyX = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X);

    this.makeEnemies();

    this.physics.add.collider(this.friendlySprites, this.enemySprites);
  }

  private makeEnemies() {
    for (let i = 0; i < 10; i++) {
      const tomato = this.createTomato();

      tomato.setY(-700);
      tomato.setX(0 + i * 500);

      let tomatoSprite = tomato.getByName(
        "body"
      ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

      tomatoSprite.setTint(0x87ceeb);

      this.enemySprites.add(tomatoSprite);
    }
  }

  private createTomato(): Phaser.GameObjects.Container {
    const tomato = this.add.container(0, 0);

    const tomatoData = new Tomato();
    const gunData = new Gun();
    const bulletPouchData = new BulletPouch();
    tomatoData.addItem(gunData);
    tomatoData.addItem(bulletPouchData);

    tomato.setData("data", tomatoData);

    const tomatoSprite = this.physics.add.sprite(0, 0, "unit-tomato");
    tomatoSprite.setData("data", tomatoData);

    const gunSprite = this.add.sprite(20, 100, "item-gun");
    gunSprite.setData("data", gunData);

    //TODO: if not selected, hide gun?

    tomatoSprite.setName("body");
    gunSprite.setName("weapon");

    tomato.add(tomatoSprite);
    tomato.add(gunSprite);

    tomatoSprite.setMass(1);

    return tomato;
  }

  /**
   *
   * @param _ time
   * @param delta in milliseconds since last update
   */
  update(_: any, delta: any) {
    this.tomato.getData("data").update(delta);

    this.processInput(delta);

    this.updateBullets(delta);

    this.checkCollisions();
  }

  processInput(delta: number) {
    /**
     * movement
     */
    if (this.keyW.isDown) {
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
      const event = tomatoData.handleLeftClick(delta);
      if (event == "item-gun-fire") {
        this.shootPlayerBullet();
      }

      //set movement
    });

    //set player's tomato facing
    const playerX = this.tomato.x;
    const playerY = this.tomato.y;
    this.input.mousePointer.updateWorldPoint(this.camera);
    const mouseX = this.input.mousePointer.worldX;
    const mouseY = this.input.mousePointer.worldY;
    var angle =
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

    console.log("add bullet");
    this.physics.velocityFromRotation(
      this.tomato.rotation,
      this.BULLET_SPEED,
      bulletSprite.body.velocity
    );

    //this.friendlyBullets.add(bulletSprite);
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
    //friends and enemies collide
    // this.physics.world.overlap(
    //   this.friendlySprites,
    //   this.enemySprites,
    //   this.collideManInGuard.bind(this),
    //   null,
    //   this,
    // );

    //friends collide with enemy bullets

    //enemies collide with friendly bullets
    this.physics.world.overlap(
      this.enemySprites,
      this.friendlyBullets,
      this.collideEnemyWithFriendlyBullets.bind(this),
      undefined,
      this
    );
  }

  private collideEnemyWithFriendlyBullets(
    enemySprite:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile,
    bulletSprite:
      | Phaser.Types.Physics.Arcade.GameObjectWithBody
      | Phaser.Tilemaps.Tile
  ): void {
    enemySprite.destroy();
    bulletSprite.destroy();

    this.enemySprites.remove(enemySprite as Phaser.GameObjects.GameObject);
    this.friendlyBullets.remove(bulletSprite as Phaser.GameObjects.GameObject);

    //TODO: destroy container, but not guns
    //TODO: add dead bodies
    //TODO: slow?
  }
}
