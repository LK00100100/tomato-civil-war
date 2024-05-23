import { Item } from "../item/Item";
import { ItemEvent } from "../item/ItemEvent";
import { Unit } from "./Unit";

/**
 * Unit of Tomato
 */
export class Tomato extends Unit {
  private static readonly MAX_HP: number = 100;
  private static readonly MAX_ITEM_LIMIT: number = 6;
  private static readonly MOVE_SPEED: number = 20;

  constructor() {
    super(Tomato.MAX_HP);

    //TODO: add knife

    this.speed = Tomato.MOVE_SPEED;
  }

  public override addItem(item: Item): boolean {
    if (this.items.length == Tomato.MAX_ITEM_LIMIT) return false;

    this.items.push(item);
    return true;
  }

  public override removeItem(_item: Item): boolean {
    throw new Error("Method not implemented.");
  }

  public override doAction(): ItemEvent {
    const action = this.items[this.selectedItem].useItem();

    return action;
  }

  public override update(delta: number) {
    this.items[this.selectedItem].update(delta);
  }
}
