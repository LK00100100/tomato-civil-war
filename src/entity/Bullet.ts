/**
 * Bullet stuff
 */
export class Bullet {
  duration: number;

  static readonly MAX_DURATION = 2000;

  constructor() {
    this.duration = 0;
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
