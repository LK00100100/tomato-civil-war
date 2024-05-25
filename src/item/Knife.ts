import { Item } from "./Item";
import { ItemEvent } from "./ItemEvent";

/**
 * Knife
 */
export class Knife extends Item {
  update(_delta: number) {}

  useItem(): ItemEvent {
    return { name: "item-knife-used" };
  }
}
