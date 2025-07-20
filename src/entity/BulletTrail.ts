/**
 * A semi-opaque trail following the bullet.
 */
export class BulletTrail {
  private duration: number;
  private xVelocity: number;
  private yVelocity: number;
  private bulletSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  private startX: number;
  private startY: number;

  /**
   * The tail stops growing after this much time as passed.
   */
  private static readonly GROW_DURATION = 500;

  constructor(bulletSprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) {
    this.duration = 0;

    this.bulletSprite = bulletSprite;
    this.xVelocity = bulletSprite.body.velocity.x;
    this.yVelocity = bulletSprite.body.velocity.y;

    this.startX = this.bulletSprite.x;
    this.startY = this.bulletSprite.y;
  }

  public getStartX() {
    return this.startX;
  }

  public getStartY() {
    return this.startY;
  }

  public getBulletSprite() {
    return this.bulletSprite;
  }

  public getEndX() {
    //prettier-ignore
    return this.bulletSprite.x - (this.xVelocity / 2);
  }

  public getEndY() {
    //prettier-ignore
    return this.bulletSprite.y - (this.yVelocity / 2);
  }

  /**
   * Reset to a new constructor setting.
   */
  public reset(): void {
    this.duration = 0;
  }

  /**
   * update the bullet first. Then update the trail
   * @param delta milliseconds number
   */
  public update(delta: number): void {
    this.duration += delta;
  }

  public shouldGrow() {
    return this.duration < BulletTrail.GROW_DURATION;
  }

  public isExpired(): boolean {
    return !this.bulletSprite.visible;
  }
}
