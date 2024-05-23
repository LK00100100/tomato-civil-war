/**
 * Smoke entity
 */
export class Smoke {
  private duration: number;

  /**
   * 1.0 = 100% opacity, not see through).
   * 0.0 = 0% opacity, 100% see through.
   */
  private opacity: number;

  private static readonly REDUCE_OPACITY_DURATION = 150;

  constructor() {
    this.duration = 0;

    this.opacity = 1.0;
  }

  /**
   *
   * @param delta milliseconds number
   */
  public update(delta: number): void {
    this.duration += delta;

    if (this.duration >= Smoke.REDUCE_OPACITY_DURATION) {
      this.duration = 0;
      this.opacity -= 0.01;
    }
  }

  public isExpired(): boolean {
    return this.opacity <= 0;
  }

  public getOpacity() {
    return Math.max(this.opacity, 0);
  }
}
