import { Utils } from "../Utils";
import { GunFireEvent } from "../item_event/GunFireEvent";
import { Item } from "./Item";
import { ItemEvent } from "./ItemEvent";

/**
 * Base class of a Gun held by a Unit.
 * Shoots bullets and deals damage.
 */
export abstract class Gun implements Item {
  protected isLoaded: boolean;

  protected isReloading: boolean;

  protected duration: number; //current reload duration

  //TODO: need to load bullets from bullet pouch

  constructor() {
    this.isLoaded = true;
    this.isReloading = false;

    this.duration = 0;
  }

  protected abstract getBaseDamage(): number;

  protected abstract getItemName(): string;

  /**
   * Angle of bullet fired out of gun. 0 = straight.
   * -x is a little left.
   * +x is a little right.
   */
  protected abstract getMaxAngle(): number;

  /**
   * Added to base damage.
   */
  protected abstract getMaxRandomDamage(): number;

  /**
   * Time to reload in milliseconds.
   */
  protected abstract getMaxReloadDuration(): number;

  public update(delta: number) {
    if (this.isLoaded) return;

    this.duration += delta;

    if (this.duration >= this.getMaxReloadDuration()) {
      this.duration = 0;
      this.isReloading = false;
      this.isLoaded = true;
    }
  }

  protected calcFireAngle(): number {
    const isNegative = Utils.rollDiceExclusive(2) == 0 ? -1 : 1;

    return Utils.rollRandomExclusive(this.getMaxAngle()) * isNegative;
  }

  protected calcDamage(): number {
    const additionalDamage =
      Utils.rollDiceExclusive(this.getMaxRandomDamage()) + 1;

    return this.getBaseDamage() + additionalDamage;
  }

  public useItem(): ItemEvent {
    //ready to fire
    if (this.isLoaded) {
      this.isLoaded = false;

      return {
        name: this.getItemName() + "-fire",
        fireAngle: this.calcFireAngle(),
        damage: this.calcDamage(),
      } as GunFireEvent;
    }

    if (!this.isReloading) {
      this.isReloading = true;

      return { name: this.getItemName() + "-reload-start" };
    }

    return { name: this.getItemName() + "-reloading" };
  }
}
