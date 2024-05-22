/**
 * Bullet stuff
 */
export class Bullet {
  duration: number;

  /**
   * Is owned by player 1.
   */
  private isPlayerOwned: boolean;

  private static readonly MAX_DURATION = 4000;
  public static readonly BULLET_SPEED = 3000;

  constructor() {
    this.duration = 0;

    this.isPlayerOwned = false;
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
