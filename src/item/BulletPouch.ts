import { Item } from "./Item";

/**
 * Pouch of bullets.
 */
export class BulletPouch implements Item {
  quantity: number;

  constructor() {
    this.quantity = 20;
  }

  update(delta: number) {}

  useItem(): string {
    return "item-bullet-pouch-used";
  }
}
