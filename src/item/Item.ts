import { NoEvent } from "../item_event/NoEvent";
import { ItemEvent } from "./ItemEvent";

/**
 * Carryable by Units
 */
export abstract class Item {
  
  //TODO: may have to stop the item from moving if you die.

  //TODO: pick up item, resets offset
  
  /**
   * Used for animation.
   * The drawing offset x relative to the container.
   * 0 angle is facing right.
   */
  protected offsetX: number = 0;
  /**
   * Used for animation.
   * The drawing offset y relative to the container
   * 0 angle is facing right.
   */
  protected offsetY: number = 0;


  /**
   * When you use the item, when is the next time you can use it again.
   */
  protected isOnCooldown: boolean;

  protected cooldownDuration: number;

  /**
   * Items generally have a cooldown after use.
   */
  protected cooldownIsOverCallback: () => void;

  protected abstract getCooldownDuration(): number;

  public abstract getItemName(): string;

  public setCooldownIsOverCallback(callback: () => void) {
    this.cooldownIsOverCallback = callback;
  }

  public abstract update(delta: number): void;

  public abstract useItem(): ItemEvent;

  /**
   * Item may have a secondary use.
   * Or can return nothing.
   */
  public useItemSecondary(): ItemEvent {
    return NoEvent.getSingleton();
  }

  //TODO: implement when you die. maybe reset variables and use callbacks
  //public abstract dropItem(): void;
}
