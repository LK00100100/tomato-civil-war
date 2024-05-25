import { Item } from "./Item";
import { ItemEvent } from "./ItemEvent";

/**
 * Pouch of bullets.
 */
export class BulletPouch extends Item {
  quantity: number;

  constructor() {
    super();
    this.quantity = 20;
  }

  update(_delta: number) {}

  useItem(): ItemEvent {
    return { name: "item-bullet-pouch-used" };
  }
}
