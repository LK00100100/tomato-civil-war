import { Game } from "../scenes/Game";
import { Unit } from "../unit/Unit";

/**
 * Military Organization unit.
 * Draws, calculates, and orders Units under the Organization.
 */
export abstract class Organization {
  protected teamNumber: number; //0, 1, 2, etc.

  protected game: Game;

  protected duration: number;

  protected units: Set<Phaser.GameObjects.Container>;

  constructor(game: Game) {
    this.game = game;

    this.units = new Set();

    this.duration = 0;
  }

  public setTeamNumber(teamNumber: number): void {
    this.teamNumber = teamNumber;
  }

  public getUnitCount(): number {
    return this.units.size;
  }

  public getUnits() {
    return this.units;
  }

  public addUnit(unit: Unit): void {
    this.units.add(unit.getUnitContainer());
  }

  public removeUnit(unit: Unit): void {
    this.units.delete(unit.getUnitContainer());
  }

  /**
   * Tells the company to organize and form up.
   */
  abstract formUp(x: number, y: number, rowSize: number): void;

  /**
   * Update this organization's clock. For calculation.
   * @param delta time in millseconds since the last frame.
   */
  abstract update(delta: number): void;

  /**
   * Observes visible units around this organization.
   * Then maybe picks a target to fight.
   */
  //TODO: think more. maybe bring this up to the army
  protected abstract assessThreats(): void;
}
