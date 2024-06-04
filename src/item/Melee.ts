import { MeleeAttackEvent } from "../item_event/MeleeAttackEvent";
import { Item } from "./Item";
import { ItemEvent } from "./ItemEvent";

//TODO: weapon class for gun and melee
/**
 * Base class of a Melee weapon held by a Unit.
 * Rapid cooldown.
 */
export abstract class Melee extends Item {
  //TODO: move to item
  protected isOnCooldown: boolean;

  //TODO: move to item
  protected duration: number; //current cooldown duration

  constructor() {
    super();
    this.isOnCooldown = false;

    this.duration = 0;
  }

  public abstract calcDamage(): number;

  public override update(delta: number) {
    if (!this.isOnCooldown) return;

    this.duration += delta;

    //cooldown done
    if (this.duration >= this.getCooldownDuration()) {
      this.duration = 0;
      this.isOnCooldown = false;

      if (this.cooldownOverCallback != null) {
        this.cooldownOverCallback();
      }
    }
  }

  public useItem(): ItemEvent {
    //on cooldown
    if (this.isOnCooldown) {
      return {
        name: this.getItemName() + "-cooldown",
      } as MeleeAttackEvent;
    }

    //attacking
    this.isOnCooldown = true;

    return {
      name: this.getItemName() + "-attack",
      damage: this.calcDamage(),
    } as MeleeAttackEvent;
  }
}
