import { Coordinate } from "../Coordinate";
import { Game } from "../scenes/Game";
import { Unit } from "../unit/Unit";

/**
 * Military Organization unit.
 * Draws, calculates, and orders Units under the Organization.
 */
export abstract class Organization {
  protected teamNumber: number; //0, 1, 2, etc.

  protected isFireAtWill: boolean;
  protected isMoving: boolean;

  protected game: Game;

  protected duration: number;

  protected units: Set<Phaser.GameObjects.Container>;

  /**
   * If the organization has no more units, morale is broken, or etc.
   */
  protected isDefeated: boolean;

  /**
   * Stop distance before firing at enemies.
   * in pixels.
   */
  protected engagementDistance: number;

  /**
   * Where unit is facing. in terms of "Phaser angle degrees".
   * East is 0. West is 180/-180. North is -90. South is 90.
   */
  protected moveAngle: number;

  constructor(game: Game) {
    this.game = game;

    this.units = new Set();

    this.duration = 0;

    this.isFireAtWill = false;
    this.isMoving = true;

    this.moveAngle = 0;

    this.engagementDistance = 7500;

    this.isDefeated = false;
  }

  public getIsDefeated() {
    return this.isDefeated || this.units.size == 0;
  }

  /**
   * Should be set by the Organization.
   * Adjust this as your organization grows and shrinks.
   * @param engagementDistance
   */
  protected setEngagementDistance(engagementDistance: number) {
    this.engagementDistance = engagementDistance;
  }

  protected getEngagementDistance() {
    return this.engagementDistance;
  }

  /**
   * You should this set this once
   * @param teamNumber
   */
  public setTeamNumber(teamNumber: number): void {
    if (this.teamNumber != null) {
      throw new Error("team number already set.");
    }

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
   * Gets the average x, y position of all units in this Organization.
   * @returns
   */
  public getCenterPosition(): Coordinate {
    let totalX = 0;
    let totalY = 0;

    this.units.forEach((unit) => {
      totalX += unit.x;
      totalY += unit.y;
    });

    return {
      x: totalX / this.units.size,
      y: totalY / this.units.size,
    };
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
  protected abstract findAndFightThreats(): void;

  /**
   * All units in this Organization steps forward (probably toward enemies).
   */
  protected moveUnits() {
    const angleToRad = this.moveAngle * Phaser.Math.DEG_TO_RAD;
    const xMovement = Math.cos(angleToRad);
    const yMovement = Math.sin(angleToRad);

    this.units.forEach((unitContainer) => {
      const unit: Unit = unitContainer.getData("data");

      //do not move player's units automatically.
      if (unit.getIsPlayerOwned()) return;

      const unitSpeed = unit.getSpeed();

      //TODO: do tweening
      unitContainer.setAngle(this.moveAngle);

      unitContainer.x += xMovement * unitSpeed;
      unitContainer.y += yMovement * unitSpeed;
    });
  }

  /**
   * Tell this organization to attack what is in front of them
   */
  protected attackUnits() {
    this.units.forEach((unitContainer) => {
      const unit: Unit = unitContainer.getData("data");

      //do not move player's units automatically.
      if (unit.getIsPlayerOwned()) return;

      //TODO: do tweening
      unitContainer.setAngle(this.moveAngle);

      const event = unit.doAction();

      if (event == "item-gun-fire") {
        this.game.shootBullet(unit, this.teamNumber);
      }

      //TODO: handle event better. event handler?
    });
  }
}
