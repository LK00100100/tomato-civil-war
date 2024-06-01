import { Item } from "../item/Item";
import { ItemEvent } from "../item/ItemEvent";
import { Utils } from "../util/Utils";

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

  /**
   * A number in milliseconds that represents slowness.
   * 0 is perfect.
   * 2000 makes them 2 seconds slower to doAction().
   */
  protected randomOffsetMax: number;
  /**
   * Once this goes over the max, the action delay is over.
   *
   * Call resetRandomOffsetDelta() when start over.
   */
  protected deltaRandomOffset: number;

  constructor(hp: number) {
    this.hp = hp;
    this.items = [];

    this.speed = 1;
    this.selectedItem = 0;
    this.isPlayerOwned = false;

    this.randomOffsetMax = Utils.rollRandomExclusive(3000);
    this.deltaRandomOffset = this.randomOffsetMax; //no initial delay
  }

  public setSelectedItem(selectedIdx: number) {
    this.selectedItem = selectedIdx;
  }

  public decrementHp(hp: number) {
    this.hp -= hp;
  }

  public getSpeed() {
    return this.speed;
  }

  public isOverRandomOffset(): boolean {
    if (this.isPlayerOwned) return true;

    return this.deltaRandomOffset >= this.randomOffsetMax;
  }

  public getUnitContainer(): Phaser.GameObjects.Container {
    return this.unitContainer;
  }

  public getSelectedItem() {
    return this.items[this.selectedItem];
  }

  private resetRandomOffsetDelta() {
    this.deltaRandomOffset = 0;
  }

  public setIsPlayerOwned(isPlayerOwned: boolean) {
    this.isPlayerOwned = isPlayerOwned;
  }

  /**
   * Is player controlled?
   * @returns
   */
  public getIsPlayerOwned() {
    return this.isPlayerOwned;
  }

  /**
   *
   * @param container has various sprites as one. "body" is the hit box.
   * @returns
   */
  public setUnitContainer(container: Phaser.GameObjects.Container): void {
    this.unitContainer = container;
  }

  /**
   * TODO: maybe return enum?
   * Do something such as fire a gun, then returns an event.
   */
  public doAction(): ItemEvent {
    const action = this.items[this.selectedItem].useItem();

    return action;
  }

  /**
   * Update the internal clock of the unit. For calculations.
   * @param delta
   */
  public update(delta: number) {
    this.deltaRandomOffset += delta; //can go below negative

    this.items[this.selectedItem].update(delta);
  }

  /**
   *
   * @param item
   * @returns true if item was added. False, otherwise.
   */
  public addItem(item: Item): boolean {
    if (this.items.length == this.getItemLimit()) return false;

    //add random shooting delay for guns per units (for aesthetics)
    item.setCooldownOverCallback(() => this.resetRandomOffsetDelta());

    this.items.push(item);
    return true;
  }
  /**
   *
   * @param item
   * @returns true if item was removed. False, otherwise.
   */
  public removeItem(_item: Item): boolean {
    throw new Error("Method not implemented.");
  }
  /**
   * Item holding limit.
   */
  protected abstract getItemLimit(): number;

  public isDead(): boolean {
    return this.hp <= 0;
  }

  public getHp() {
    return this.hp;
  }
}
