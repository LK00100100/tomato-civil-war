import { MeleeAttackEvent } from "../item_event/MeleeAttackEvent";
import { Item } from "./Item";
import { ItemEvent } from "./ItemEvent";

//TODO: weapon class for gun and melee
/**
 * Base class of a Melee weapon held by a Unit.
 * Rapid cooldown.
 */
export abstract class Melee extends Item {

   /**
   * This function is called when the kill mode is first turned off.
   */
  protected killModeIsOffCallback: () => void;
  
  //TODO: move to item
  /**
   * When you use the item, when is the next time you can use it again.
   */
  protected isOnCooldown: boolean;

  //TODO: move to item
  protected cooldownDuration: number;

  /**
   * While on, this melee weapon does damage.
   * Simulates swinging the weapon forward.
   */
  protected isKillMode: boolean;

  public setKillModeIsOffCallback(callback: () => void) {
    this.killModeIsOffCallback = callback;
  }

  //note: may have to stop the item from moving if you die.

  constructor() {
    super();
    this.isOnCooldown = false;

    this.cooldownDuration = 0;
  }

  public abstract calcDamage(): number;

  public override update(delta: number) {
    if (!this.isOnCooldown) return;

    this.cooldownDuration += delta;

    //cooldown done
    if (this.cooldownDuration >= this.getCooldownDuration()) {
      this.cooldownDuration = 0;
      this.isOnCooldown = false;
      this.isKillMode = false;

      if (this.cooldownIsOverCallback != null) {
        this.cooldownIsOverCallback();
      }
    }
  }

  public useItem(): ItemEvent {
    //TODO: pool
    //on cooldown
    if (this.isOnCooldown) {
      return {
        name: this.getItemName() + "-cooldown", //TODO: could enum it
      } as MeleeAttackEvent;
    }

    //attacking
    this.isOnCooldown = true;
    this.isKillMode = true;

    return {
      name: this.getItemName() + "-attack",
      damage: this.calcDamage(),
    } as MeleeAttackEvent;
  }
}
