import { Utils } from "../Utils";
import { Item } from "./Item";

//TODO: rename to SmoothboreGun
/**
 * Basic gun.
 * Requires the user to have a bullet pouch.
 */
export class Gun implements Item {
  isLoaded: boolean;

  isReloading: boolean;

  duration: number; //current reload duration

  private static readonly DAMAGE_BASE = 40;
  private static readonly DAMAGE_RAND_MAX = 65;

  /**
   * +/- shooting angle.
   * In Phaser angle.
   */
  private static readonly MAX_ANGLE: number = 10;

  static readonly MAX_RELOAD_DURATION = 4000;

  //TODO: need to load bullets
  constructor() {
    this.isLoaded = true;
    this.isReloading = false;

    this.duration = 0;
  }

  update(delta: number) {
    if (this.isLoaded) return;

    this.duration += delta;

    if (this.duration >= Gun.MAX_RELOAD_DURATION) {
      this.duration = 0;
      this.isReloading = false;
      this.isLoaded = true;
    }
  }

  useItem(): ItemEvent {
    //ready to fire
    if (this.isLoaded) {
      this.isLoaded = false;

      return {
        name: "item-gun-fire",
        fireAngle: this.calcFireAngle(),
        damage: this.calcDamage(),
      } as GunFireEvent;
    }

    if (!this.isReloading) {
      this.isReloading = true;

      return { name: "item-gun-reload-start" };
    }

    return { name: "item-gun-reloading" };
  }

  private calcFireAngle(): number {
    const isNegative = Utils.rollDiceExclusive(2) == 0 ? -1 : 1;

    return Utils.rollRandomExclusive(Gun.MAX_ANGLE) * isNegative;
  }

  private calcDamage(): number {
    const additionalDamage = Utils.rollDiceExclusive(Gun.DAMAGE_RAND_MAX) + 1;

    return Gun.DAMAGE_BASE + additionalDamage;
  }
}
