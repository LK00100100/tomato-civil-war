import { Unit } from "./Unit";

/**
 * Unit of Tomato
 */
export class Tomato extends Unit {
  private static readonly MAX_HP: number = 100;
  private static readonly MAX_ITEM_LIMIT: number = 5;
  private static readonly MOVE_SPEED: number = 20;

  constructor() {
    super(Tomato.MAX_HP);

    //TODO: add knife

    this.speed = Tomato.MOVE_SPEED;
  }

  protected override getItemLimit(): number {
    return Tomato.MAX_ITEM_LIMIT;
  }
}
