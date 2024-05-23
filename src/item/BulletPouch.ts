import { Item } from "./Item";

/**
 * Pouch of bullets.
 */
export class BulletPouch implements Item {
  quantity: number;

  constructor() {
    this.quantity = 20;
  }

  update(_delta: number) {}

  useItem(): ItemEvent {
    return { name: "item-bullet-pouch-used" };
  }
}
