import { Gun } from "./Gun";

/**
 * A mass produced basic gun.
 * Takes a while to reload.
 * Inaccurate.
 * Kills a Tomato in 1-3 shots.
 * Requires the user to have a bullet pouch.
 */
export class SmoothboreGun extends Gun {
  private static readonly DAMAGE_BASE = 40;
  private static readonly DAMAGE_RAND_MAX = 65;

  protected static readonly ITEM_NAME = "item-gun-smoothbore";

  /**
   * +/- shooting angle.
   * In Phaser angle.
   */
  private static readonly MAX_RAND_ANGLE = 10;

  private static readonly MAX_RELOAD_DURATION = 10000;

  protected override getBaseDamage(): number {
    return SmoothboreGun.DAMAGE_BASE;
  }

  protected override getItemName(): string {
    return SmoothboreGun.ITEM_NAME;
  }

  protected override getMaxAngle(): number {
    return SmoothboreGun.MAX_RAND_ANGLE;
  }

  protected override getMaxRandomDamage(): number {
    return SmoothboreGun.DAMAGE_RAND_MAX;
  }

  protected override getMaxReloadDuration() {
    return SmoothboreGun.MAX_RELOAD_DURATION;
  }
}
