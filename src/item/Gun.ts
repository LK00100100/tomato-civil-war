import { GunFireEvent } from "../item_event/GunFireEvent";
import { Utils } from "../util/Utils";
import { Item } from "./Item";
import { ItemEvent } from "./ItemEvent";

/**
 * Base class of a Gun held by a Unit.
 * Shoots bullets and deals damage.
 */
export abstract class Gun extends Item {
  protected isLoaded: boolean;

  protected isReloading: boolean;

  //TODO: rename to cooldownDuration, move to Item
  protected duration: number; //current reload duration

  //TODO: need to load bullets from bullet pouch

  constructor() {
    super();
    this.isLoaded = true;
    this.isReloading = false;

    this.duration = 0;
  }

  public getIsLoaded() {
    return this.isLoaded;
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

  public override update(delta: number) {
    if (this.isLoaded) return;

    this.duration += delta;

    //done reloading
    if (this.duration >= this.getMaxReloadDuration()) {
      this.duration = 0;
      this.isReloading = false;
      this.isLoaded = true;

      if (this.cooldownIsOverCallback != null) {
        this.cooldownIsOverCallback();
      }
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
