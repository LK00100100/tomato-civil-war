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

  /**
   * While on, this melee weapon does damage.
   * Simulates swinging the weapon forward.
   */
  protected isKillMode: boolean;

  public setKillModeIsOffCallback(callback: () => void) {
    this.killModeIsOffCallback = callback;
  }

  constructor() {
    super();
    this.isOnCooldown = false;
    this.isKillMode = false;

    this.cooldownDuration = 0;

    this.offsetX = 0;
    this.offsetY = 0;
  }

  public getOffsetX() {
    return this.offsetX;
  }

  public getOffsetY() {
    return this.offsetY;
  }

  public abstract calcDamage(): number;

  public override update(delta: number) {
    //item is idle
    if (!this.isOnCooldown) {
      return;
    }

    this.cooldownDuration += delta;

    //cooldown done
    if (this.cooldownDuration >= this.getCooldownDuration()) {
      this.cooldownDuration = 0;
      this.isOnCooldown = false;
      this.isKillMode = false;

      if (this.cooldownIsOverCallback) {
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
