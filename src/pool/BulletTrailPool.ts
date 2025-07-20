import { BulletTrail } from "../entity/BulletTrail";

/**
 * A pool of BulleTrail sprites and their data.
 * It creates as many as it needs. Creates more if needed.
 */
export class BulletTrailPool {

  /**
   * Bullet Trails added here are reset
   */
  private bulletTrailPool: Phaser.Geom.Line[];
  private bulletTrailDataPool: BulletTrail[];

  constructor() {
    this.bulletTrailPool = [];
    this.bulletTrailDataPool = [];
  }

  //TODO: separate with and without bulletsprite to avoid confusion. no bullet sprite just to populate pool
  /**
   * Get the bullet trail and data.
   * You will need to set the Bullet to the BulletTrail.
   * If needed, be sure to call Bullet.setBulletSpriteAndCopyAttributes(bulletSprite).
   * @param bulletSprite attach bulletSprite to Bullet Trail.
   * @returns 
   */
  public getBulletTrail(bulletSprite?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody): BulletTrailTuple {
    if (this.bulletTrailPool.length == 0) {
      return this.createNewBulletTrail(bulletSprite);
    }

    const bulletTrail = this.bulletTrailPool.pop()!;
    const bulletTrailData = this.bulletTrailDataPool.pop()!;
    bulletTrailData.setBulletSpriteAndCopyAttributes(bulletSprite);

    return {
      bulletTrail: bulletTrail,
      bulletTrailData: bulletTrailData
    };
  }

  /**
   * bullet trail is stored, reset, and invisible.
   * @param bulletTrailLine -
   */
  public addAndResetBulletTrail(bulletTrailLine: Phaser.Geom.Line, data: BulletTrail) {
    //when bulletTrailLine is not in the game.bulletTrailEntities, it will not be drawn

    data.reset();

    this.bulletTrailPool.push(bulletTrailLine);
    this.bulletTrailDataPool.push(data);
  }

  /**
   * 
   * @param bulletSprite The bullet to be attached to the Bullet Trail
   * @returns 
   */
  private createNewBulletTrail(bulletSprite?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody): BulletTrailTuple {
    let bulletTrail;

    if (bulletSprite) {
      bulletTrail = new Phaser.Geom.Line(
        bulletSprite.x,
        bulletSprite.y,
        bulletSprite.x,
        bulletSprite.y
      );
    }
    else {
      bulletTrail = new Phaser.Geom.Line(0, 0, 0, 0);
    }

    return {
      bulletTrail: bulletTrail,
      bulletTrailData: new BulletTrail(bulletSprite)
    };
  }

}

export class BulletTrailTuple {
  public bulletTrail: Phaser.Geom.Line;
  public bulletTrailData: BulletTrail;
}
