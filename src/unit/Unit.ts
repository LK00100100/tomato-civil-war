import { Item } from "../item/Item";

/**
 * Base Unit class for fighters.
 */
export abstract class Unit {
  protected hp: number;
  protected items: Array<Item>;
  protected selectedItem: number;
  protected speed: number;
  protected isPlayerOwned: boolean;

  protected unitContainer: Phaser.GameObjects.Container;

  constructor(hp: number) {
    this.hp = hp;
    this.items = [];

    this.speed = 1;
    this.selectedItem = 0;
    this.isPlayerOwned = false;
  }

  getSpeed() {
    return this.speed;
  }

  getUnitContainer(): Phaser.GameObjects.Container {
    return this.unitContainer;
  }

  setIsPlayerOwned(isPlayerOwned: boolean) {
    this.isPlayerOwned = isPlayerOwned;
  }

  getIsPlayerOwned() {
    return this.isPlayerOwned;
  }

  /**
   *
   * @param container has various sprites as one. "body" is the hit box.
   * @returns
   */
  setUnitContainer(container: Phaser.GameObjects.Container): void {
    this.unitContainer = container;
  }

  /**
   * TODO: maybe return enum?
   * Do something such as fire a gun, then returns an event.
   */
  abstract doAction(): string;

  /**
   * Update the internal clock of the unit. For calculations.
   * @param delta
   */
  abstract update(delta: number): void;

  /**
   *
   * @param item
   * @returns true if item was added. False, otherwise.
   */
  abstract addItem(item: Item): boolean;

  /**
   *
   * @param item
   * @returns true if item was removed. False, otherwise.
   */
  abstract removeItem(item: Item): boolean;
}
