import { ItemEvent } from "./ItemEvent";

/**
 * Carryable by Units
 */
export abstract class Item {
  /**
   * Items generally have a cooldown after use.
   */
  protected cooldownOverCallback: () => void;

  public setCooldownOverCallback(callback: () => void) {
    this.cooldownOverCallback = callback;
  }

  public abstract update(delta: number): void;

  public abstract useItem(): ItemEvent;
}
