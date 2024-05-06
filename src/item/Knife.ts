import { Item } from "./Item";

/**
 * Knife
 */
export class Knife implements Item {
  constructor() {}
  update(delta: number) {}

  useItem(): string {
    return "item-knife-used";
  }
}
