import { Gun } from "./Gun";

/**
 * A non-mass produced basic gun.
 * Takes a short while to reload.
 * Accurate.
 * Kills a Tomato in 1 shot.
 * Requires the user to have a bullet pouch.
 */
export class Rifle extends Gun {
  private static readonly DAMAGE_BASE = 100;

  protected static readonly ITEM_NAME = "item-gun-rifle";

  /**
   * +/- shooting angle.
   * In Phaser angle.
   */
  private static readonly MAX_RAND_ANGLE = 0;

  private static readonly MAX_RELOAD_DURATION = 4000;

  protected override getBaseDamage(): number {
    return Rifle.DAMAGE_BASE;
  }

  protected override getItemName(): string {
    return Rifle.ITEM_NAME;
  }

  protected override getMaxAngle(): number {
    return Rifle.MAX_RAND_ANGLE;
  }

  protected override getMaxRandomDamage(): number {
    return 0;
  }

  protected override getMaxReloadDuration() {
    return Rifle.MAX_RELOAD_DURATION;
  }
}
