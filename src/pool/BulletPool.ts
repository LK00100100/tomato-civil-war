import { Bullet } from "../entity/Bullet";
import { Game } from "../scenes/Game";

/**
 * A pool of bullet sprites and their data.
 * It creates as many as it needs. Creates more if needed.
 */
export class BulletPool {

  /**
   * Bullets added here are reset and need to be populated with damage.
   */
  private bulletPool: Array<Phaser.Types.Physics.Arcade.SpriteWithDynamicBody>;

  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.bulletPool = [];
  }

  /**
   * 
   * @param damage be sure to set this
   * @returns 
   */
  public getBullet(damage?: number):Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    if (this.bulletPool.length == 0) {
      return this.createNewBullet(damage);
    }

    const bulletSprite = this.bulletPool.pop()!;
    bulletSprite.setVisible(true);

    const bulletData: Bullet = bulletSprite.getData("data");
    bulletData.setDamage(damage ?? 0);

    return bulletSprite;
  }

  /**
   * Bullets are stored, reset, and invisible.
   * @param bulletSprite -
   */
  public addAndResetBullet(bulletSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    bulletSprite.setVisible(false);

    const bulletData = bulletSprite.getData("data");
    bulletData.reset();

    this.bulletPool.push(bulletSprite);
  }

  private createNewBullet(damage?: number): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody {
    const bulletSprite = this.game.physics.add.sprite(
      0,
      0,
      "entity-bullet"
    );

    const bulletData = new Bullet(damage ?? 0);
    bulletSprite.setData("data", bulletData);

    return bulletSprite;
  }
  

}
