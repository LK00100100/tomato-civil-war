import { Coordinate } from "../Coordinate";
import { Game } from "../scenes/Game";
import { Unit } from "../unit/Unit";

/**
 * Military Organization unit.
 * Draws, calculates, and orders Units under the Organization.
 */
export abstract class Organization {
  protected teamNumber: number; //0, 1, 2, etc.

  /**
   * nulls are dead units.
   * 0th row is the first row towards enemy.
   */
  protected unitRows: Array<Array<Unit | null>>;
  protected unitRowMap: Map<Unit, Coordinate>; //0-indexed

  /**
   * Individual units have to move somewhere.
   */
  protected unitToMoveMap: Map<Unit, Coordinate>;

  /**
   * False is "do not fire" mode.
   */
  protected isFireAtWill: boolean;

  /**
   * True, if set to move. False, if not set to move and not moving.
   */
  protected isMoving: boolean;

  /**
   * True, if shooting or fighting now.
   */
  protected isEngaging: boolean;

  protected game: Game;

  protected deltaDuration: number;

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

  protected closestEnemyOrg: Organization | null;
  /**
   * If closestEnemyOrg is null, ignore this.
   */
  protected closestEnemyOrgDistance: number;
  /**
   * If closestEnemyOrg is null, ignore this.
   */
  protected closestEnemyCoord: Coordinate | null;

  /**
   * Where unit is facing. in terms of "Phaser angle degrees".
   * East is 0. West is 180/-180. North is -90. South is 90.
   */
  protected orgMoveAngle: number;

  private static readonly THINK_DURATION = 1000;

  constructor(game: Game) {
    this.game = game;

    this.units = new Set();

    this.unitRows = [];
    this.unitRowMap = new Map();
    this.unitToMoveMap = new Map();

    this.deltaDuration = 0;

    this.isFireAtWill = true;
    this.isMoving = false;
    this.isEngaging = false;

    this.orgMoveAngle = 0;

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

  /**
   * Adds to this Organization. Doesn't add to row.
   *
   * Call initFormation() to add to rows.
   * @param unit
   */
  public addUnit(unit: Unit): void {
    this.units.add(unit.getUnitContainer());
  }

  public removeUnit(unit: Unit): void {
    //all metadata already deleted
    if (!this.unitRowMap.has(unit)) return;

    this.units.delete(unit.getUnitContainer());

    const { x: col, y: row } = this.unitRowMap.get(unit)!;
    this.unitRowMap.delete(unit);

    this.unitRows[row][col] = null;
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
   * Draw the army on the battlefield in an organized manner.
   */

  //TODO: rotation
  /**
   * form company starting with bottom-left.
   * Go right, then go up.
   * @param x
   * @param y
   */
  public initFormation(x: number, y: number, rowSize: number) {
    let currentX = x;
    let currentY = y;
    let countPlaced = 0; //side note: could just use this through %
    let currentRow = 0;
    let currentCol = 0;

    //TODO: use formUp() to draw
    let unitRow: Array<Unit> = [];
    this.units.forEach((tomato) => {
      tomato.setAngle(90);
      tomato.setX(currentX);
      tomato.setY(currentY);

      currentX += 500;

      let unit = tomato.getData("data");
      unitRow.push(unit);
      this.unitRowMap.set(unit, { x: currentCol, y: currentRow });

      currentCol++;
      countPlaced++;
      if (countPlaced % rowSize == 0) {
        currentX = currentRow % 2 == 0 ? x - 250 : x;
        currentY -= 500;

        this.unitRows.push(unitRow);
        unitRow = [];
        currentRow++;
        currentCol = 0;
      }
    });

    if (unitRow.length != 0) this.unitRows.push(unitRow);
  }

  /**
   * Tells the company to organize and form up on the current rotation.
   * Push all units to the front rows to fill in all gaps, in closest-from-gap order.
   * Removes null rows.
   * Normally call this after losses.
   * @returns true if moved units;
   */
  protected formUp(): boolean {
    if (!this.needsToReform()) return false;

    if (this.unitRows.length <= 1) return false;

    let movedSomething = false;
    //move stuff up one row at a time until the gaps are filled for non-back rows
    let nextRowCandidate = 1;
    let nextColCandidate = 0;

    for (let r = 0; r < this.unitRows.length - 1; r++) {
      let row = this.unitRows[r];

      if (nextRowCandidate <= r) {
        nextRowCandidate = r + 1;
        nextColCandidate = 0;
      }

      for (let c = 0; c < row.length; c++) {
        if (row[c] != null) continue;

        //empty spot, find candidate to swap
        let didSwap = false;
        while (nextRowCandidate < this.unitRows.length && !didSwap) {
          if (this.unitRows[nextRowCandidate][nextColCandidate] != null) {
            didSwap = true;

            //swap
            const unit: Unit =
              this.unitRows[nextRowCandidate][nextColCandidate]!;
            row[c] = unit;
            this.unitRows[nextRowCandidate][nextColCandidate] = null;
            movedSomething = true;

            //update metadata
            this.unitRowMap.set(unit, { x: c, y: r });
          }

          nextColCandidate++;

          if (nextColCandidate == row.length) {
            nextRowCandidate += 1;
            nextColCandidate = 0;
          }
        }
      }

      //no more people to move up
      if (nextRowCandidate == this.unitRows.length) break;
    }

    //remove null rows
    for (let row = this.unitRows.length - 1; row >= 0; row--) {
      if (this.unitRows[row].every((elem) => elem == null)) this.unitRows.pop();
    }

    return movedSomething;
  }

  /**
   *
   */
  private calculateFormUp() {}

  /**
   * Returns true if units need to be pushed to the front rows.
   * In other words, there are empety gaps in the non-back rows.
   */
  private needsToReform(): boolean {
    for (const row of this.unitRows) {
      //ignore last row
      if (row == this.unitRows[length - 1]) break;

      if (row.includes(null)) return true;
    }

    return false;
  }

  /**
   * Update this organization's action. For calculation.
   * @param delta time in millseconds since the last frame.
   */
  public update(delta: number) {
    this.deltaDuration += delta;

    this.units.forEach((container) => {
      const unit = container.getData("data") as Unit;
      unit.update(delta);
    });

    if (this.isMoving) {
      this.moveUnits();
    }

    if (this.isEngaging && this.isFireAtWill) {
      this.attackUnits();

      const needsFormUp = this.formUp();

      //TODO: calculate formup
    }

    //assess enemies
    if (this.deltaDuration >= Organization.THINK_DURATION) {
      this.deltaDuration = 0;

      //this company is currently busy fighting an active company
      if (this.isEngaging) {
        if (this.closestEnemyOrg!.getUnitCount() > 0) {
          return;
        }

        this.isEngaging = false;
      }

      this.findAndFightThreats();
    }
  }

  /**
   * Observes visible units around this organization.
   * Then maybe picks a target to fight.
   */
  //TODO: think more. maybe bring this up to the army
  protected abstract findAndFightThreats(): void;

  /**
   * All units in this Organization steps forward (probably toward enemies).
   *
   * Firstly, if needed, move all individual units.
   * If there are no such units, move the entire unit, if needed.
   */
  protected moveUnits() {
    const angleToRad = this.orgMoveAngle * Phaser.Math.DEG_TO_RAD;
    const xMovement = Math.cos(angleToRad);
    const yMovement = Math.sin(angleToRad);

    this.units.forEach((unitContainer) => {
      const unit: Unit = unitContainer.getData("data");

      //do not move player's units automatically.
      if (unit.getIsPlayerOwned()) return;

      const unitSpeed = unit.getSpeed();

      //move entire unit
      if (this.unitToMoveMap.size == 0) {
        //TODO: do tweening
        unitContainer.setAngle(this.orgMoveAngle);

        unitContainer.x += xMovement * unitSpeed;
        unitContainer.y += yMovement * unitSpeed;
        return;
      }

      if (!this.unitToMoveMap.has(unit)) return;

      //move individuals
      const targetCoord = this.unitToMoveMap.get(unit);
      //TODO:
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
      unitContainer.setAngle(this.orgMoveAngle);

      const event = unit.doAction();

      if (event == "item-gun-fire") {
        this.game.shootBullet(unit, this.teamNumber);
      }

      //TODO: handle event better. event handler?
    });
  }
}
