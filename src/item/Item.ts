import { NoEvent } from "../item_event/NoEvent";
import { ItemEvent } from "./ItemEvent";

/**
 * Carryable by Units
 */
export abstract class Item {
  /**
   * Items generally have a cooldown after use.
   */
  protected cooldownOverCallback: () => void;

  protected abstract getCooldownDuration(): number;

  protected abstract getItemName(): string;

  public setCooldownOverCallback(callback: () => void) {
    this.cooldownOverCallback = callback;
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
}
