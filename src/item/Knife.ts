import { Item } from "./Item";
import { ItemEvent } from "./ItemEvent";

/**
 * Knife
 */
export class Knife implements Item {
  constructor() {}
  update(_delta: number) {}

  useItem(): ItemEvent {
    return { name: "item-knife-used" };
  }
}
