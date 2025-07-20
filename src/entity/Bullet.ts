/**
 * Bullet stuff
 */
export class Bullet {
  duration: number;

  /**
   * Is owned by player 1.
   */
  private isPlayerOwned: boolean;
  private damage: number;

  private static readonly MAX_DURATION = 4000;
  public static readonly BULLET_SPEED = 6000;

  constructor(damage?: number) {
    this.damage = damage ?? 0;

    this.reset();
  }

   public setDamage(damage: number) {
    this.damage = damage;
  }

  /**
   * Reset to a new constructor setting.
   */
  public reset(): void {
    this.duration = 0;
    this.isPlayerOwned = false;
  }

  public getIsPlayerOwned(): boolean {
    return this.isPlayerOwned;
  }

  public setIsPlayerOwned(newPlayerOwned: boolean) {
    this.isPlayerOwned = newPlayerOwned;
  }

  public getDamage(): number {
    return this.damage;
  }

  /**
   *
   * @param delta milliseconds number
   */
  public update(delta: number): void {
    this.duration += delta;

    if (this.duration > Bullet.MAX_DURATION)
      this.duration = Bullet.MAX_DURATION;
  }

  public isExpired(): boolean {
    return this.duration >= Bullet.MAX_DURATION;
  }
}
