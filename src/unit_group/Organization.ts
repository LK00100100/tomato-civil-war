import { Coordinate } from "../Coordinate";
import { Game } from "../scenes/Game";
import { Unit } from "../unit/Unit";

/**
 * Military Organization unit.
 * Draws, calculates, and orders Units under the Organization.
 */
export abstract class Organization {
  /**
   * Name for this Organization. Preferably unique.
   */
  protected name: string;

  protected teamNumber: number; //0, 1, 2, etc.

  /**
   * nulls are dead units.
   * 0th row is the first row towards enemy.
   */
  protected unitRows: Array<Array<Unit | null>>;
  /**
   * Unit to row/col in the formation.
   */
  protected unitRowMap: Map<Unit, Coordinate>; //0-indexed

  /**
   * Individual units have to move somewhere or form up.
   */
  protected unitToMoveMap: Map<Unit, Coordinate>;

  /**
   * False is "do not fire" mode.
   */
  protected isFireAtWill: boolean;

  /**
   * True, if set to walk forward.
   * Not the same as forming up.
   */
  protected isMovingForward: boolean;

  /**
   * True, if needs to form up (movement set).
   */
  protected isFormingUp: boolean;

  /**
   * True, if within engagement distance of an enemy.
   */
  protected isEngaging: boolean;

  protected game: Game;

  protected deltaDuration: number;

  protected units: Set<Phaser.GameObjects.Container>;

  /**
   * If the organization has no more units, morale is broken, or etc.
   */
  protected isDefeated: boolean;

  //TODO: dynamically set this
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
   * Generally facing last known enemy position.
   */
  protected orgMoveAngle: number;

  private static readonly ASSESS_ENEMY_DURATION = 2000;
  private static readonly TOMATO_WIDTH_PIXELS = 256;

  constructor(game: Game, name: string) {
    this.game = game;
    this.name = name;

    this.units = new Set();

    this.unitRows = [];
    this.unitRowMap = new Map();
    this.unitToMoveMap = new Map();

    this.deltaDuration = 0;

    this.isFireAtWill = true;
    this.isMovingForward = false;
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

    this.unitToMoveMap.delete(unit);
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

    //TODO:
    this.game.add.rectangle(
      totalX / this.units.size,
      totalY / this.units.size,
      100,
      100,
      0xffa500
    );

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
   * Form and draw company.
   * @param x army's center
   * @param y army's center
   * @param rowSize how many columns to put in the row.
   * @param initAngle phaser angle to face
   */
  public initFormation(
    x: number,
    y: number,
    rowSize: number,
    initAngle: number
  ) {
    let countPlaced = 0; //side note: could just use this through %
    let currentRow = 0;
    let currentCol = 0;

    this.orgMoveAngle = initAngle;

    let unitRow: Array<Unit> = [];
    this.units.forEach((tomato) => {
      tomato.setAngle(initAngle);

      let unit = tomato.getData("data");
      unitRow.push(unit);
      this.unitRowMap.set(unit, { x: currentCol, y: currentRow });

      currentCol++;
      countPlaced++;
      if (countPlaced % rowSize == 0) {
        this.unitRows.push(unitRow);
        unitRow = [];
        currentRow++;
        currentCol = 0;
      }
    });

    //flush remainder
    if (unitRow.length != 0) this.unitRows.push(unitRow);

    //draw units
    this.calculateFormUpToMove({ x: x, y: y }, this.orgMoveAngle);

    for (let [unit, targetCoord] of this.unitToMoveMap) {
      const unitContainer = unit.getUnitContainer();
      unitContainer.setX(targetCoord.x);
      unitContainer.setY(targetCoord.y);
    }

    this.unitToMoveMap.clear();
  }

  /**
   * Tells the company to organize and form up on the current rotation.
   * Push all units to the front rows to fill in all gaps, in closest-from-gap order.
   * Removes null rows.
   * Also sets all the unit's target x,y to form up.
   * Normally call this after losses.
   * @returns true if moved units;
   */
  protected fillGapsAndCalculateFormup(): boolean {
    let movedSomething = false;
    let nextRowCandidate = 1;
    let nextColCandidate = 0;

    //move stuff up one row at a time until the gaps are filled for non-back rows
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
          const candidate: Unit =
            this.unitRows[nextRowCandidate][nextColCandidate]!;

          if (candidate != null) {
            didSwap = true;

            //swap
            row[c] = candidate;
            this.unitRows[nextRowCandidate][nextColCandidate] = null;
            movedSomething = true;

            //update metadata
            this.unitRowMap.set(candidate, { x: c, y: r });
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

    //for the last row, push units more towards the middle
    if (this.unitRows.length >= 1) {
      const lastRowNum = this.unitRows.length - 1;
      const lastRow = this.unitRows[lastRowNum];

      const midLeft = Math.ceil(lastRow.length / 2) - 1; //or mid spot..
      const midRight = midLeft + 1;

      const numUnitsInRow = lastRow.filter((x) => x != null).length;

      const numLeftSpots = Math.ceil(numUnitsInRow / 2); //can have 1 more.
      const numRightSpots = numUnitsInRow - numLeftSpots;

      //does the middle need to be filled?
      const leftEdge = midLeft - numLeftSpots + 1;
      const rightEdge = midRight + numRightSpots - 1;
      let needsFilling = false;

      for (let i = leftEdge; i <= rightEdge; i++) {
        if (lastRow[i] == null) {
          needsFilling = true;
          break;
        }
      }

      //fill up the middle
      if (needsFilling == true) {
        movedSomething = true;

        const units = lastRow.filter((x) => x != null);

        lastRow.fill(null);

        for (let i = rightEdge; i >= leftEdge; i--) {
          lastRow[i] = units.pop()!;

          // update metadata
          this.unitRowMap.set(lastRow[i]!, { x: i, y: lastRowNum });
        }
      }
    }

    if (movedSomething) {
      this.calculateFormUpToMove(this.getCenterPosition(), this.orgMoveAngle);
    }

    return movedSomething;
  }

  /**
   * Calculates the x,y for each individual to rotate.
   * @param rotateAngle phaser angle to rotate (degrees)
   */
  protected calculateRotateArmy(rotateAngle: number) {
    this.calculateFormUpToMove(this.getCenterPosition(), rotateAngle);
  }

  /**
   * Calculates the x, y each unit needs to go to
   * in order to go back to looking like a formation.
   * If everyone is already drawn in formation,
   * this will do nothing.
   * You can call formUp() before calling this
   * to move up units into the gap (not drawn).
   *
   * @param orgCoord center of organization
   * @param facingAngle Phaser angle to face
   */
  private calculateFormUpToMove(orgCoord: Coordinate, facingAngle: number) {
    //get to top-left-corner of the formation
    //relative to the organization's direction

    //TODO: set isDebug mode
    this.game.add.rectangle(orgCoord.x, orgCoord.y, 100, 100, 0x00008b); //dark blue

    //prettier-ignore
    let halfWidth = Math.floor(this.unitRows[0].length)  - 0.5;

    halfWidth *= Organization.TOMATO_WIDTH_PIXELS;
    //prettier-ignore
    let halfHeight = Math.floor(this.unitRows.length / 2);
    if (this.unitRows.length % 2 == 0) {
      halfHeight -= 0.5;
    }

    halfHeight *= Organization.TOMATO_WIDTH_PIXELS;

    const magnitudeToCorner = Math.sqrt(
      Math.pow(halfWidth, 2) + Math.pow(halfHeight, 2)
    );

    //calc topLeftCornerAngle
    //prettier-ignore
    const cornerAngle = 90 - (Math.asin(halfHeight / magnitudeToCorner) * Phaser.Math.RAD_TO_DEG);

    const topLeftCornerAngle = Phaser.Math.Angle.WrapDegrees(
      facingAngle - cornerAngle
    );

    const cornerAngleToRad = topLeftCornerAngle * Phaser.Math.DEG_TO_RAD;
    const xMagnitude = Math.cos(cornerAngleToRad) * magnitudeToCorner;
    const yMagnitude = Math.sin(cornerAngleToRad) * magnitudeToCorner;

    const cornerX = orgCoord.x + xMagnitude;
    const cornerY = orgCoord.y + yMagnitude;

    //TODO: delete
    this.game.add.rectangle(cornerX, cornerY, 100, 100, 0x00ffff); //aqua

    //calc to next column direction
    const angleToColumn = Phaser.Math.Angle.WrapDegrees(this.orgMoveAngle + 90);
    const angleToColumnRad = angleToColumn * Phaser.Math.DEG_TO_RAD;
    const xColumnMagnitude =
      Math.cos(angleToColumnRad) * Organization.TOMATO_WIDTH_PIXELS * 2;
    const yColumnMagnitude =
      Math.sin(angleToColumnRad) * Organization.TOMATO_WIDTH_PIXELS * 2;

    //calc to next row direction
    const angleToRow = Phaser.Math.Angle.WrapDegrees(this.orgMoveAngle + 180);
    const angleToRowRad = angleToRow * Phaser.Math.DEG_TO_RAD;
    const xRowMagnitude =
      Math.cos(angleToRowRad) * Organization.TOMATO_WIDTH_PIXELS;
    //prettier-ignore
    const yRowMagnitude =
      Math.sin(angleToRowRad) * (Organization.TOMATO_WIDTH_PIXELS);

    //set the x, y for every unit
    for (let r = 0; r < this.unitRows.length; r++) {
      //prettier-ignore
      let currentX = cornerX + (xRowMagnitude * r);
      //prettier-ignore
      let currentY = cornerY + (yRowMagnitude * r);

      if (r % 2 != 0) {
        currentX += xColumnMagnitude / 2;
        currentY += yColumnMagnitude / 2;
      }

      for (let c = 0; c < this.unitRows[r].length; c++) {
        const unit: Unit = this.unitRows[r][c]!;

        if (unit != null) {
          this.unitToMoveMap.set(unit, { x: currentX, y: currentY });
        }

        currentX += xColumnMagnitude;
        currentY += yColumnMagnitude;
      }
    }
  }

  /**
   * Returns true if units need to be pushed to the front rows.
   * In other words, there are empety gaps in the non-back rows.
   */
  private needsToFillGaps(): boolean {
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
    if (this.getIsDefeated()) return;

    this.deltaDuration += delta;

    this.units.forEach((container) => {
      const unit = container.getData("data") as Unit;
      unit.update(delta);
    });

    //move to direction-angle or move to form up
    if (this.unitToMoveMap.size > 0) {
      this.moveIndividualUnits();
    } else {
      if (this.isMovingForward) {
        this.moveUnitsForward();
      }
    }

    if (this.isEngaging) {
      if (this.isFireAtWill) {
        this.fire();
      }

      const needsToFillGaps = this.needsToFillGaps();

      if (needsToFillGaps) {
        this.fillGapsAndCalculateFormup();
      }
    }

    //assess enemies
    if (this.deltaDuration >= Organization.ASSESS_ENEMY_DURATION) {
      this.deltaDuration = 0;

      //this company is currently firing at the enemy
      if (this.isEngaging) {
        //still fighting
        if (this.closestEnemyOrg!.getUnitCount() > 0) {
          return;
        }

        //done fighting
        this.isEngaging = false;
        console.log(`${this.name}: completed fighting`);
      }

      console.log(`${this.name}: finding new threat`);
      //not currently fighting anything. get closer to the fight
      this.findAndFightThreats();

      if (this.closestEnemyOrg != null) {
        this.calculateRotateArmy(this.orgMoveAngle);
        console.log(`${this.name}: rotating`);
      }
    }
  }

  /**
   * Observes visible units around this organization.
   * Then maybe picks a target to fight.
   */
  protected findAndFightThreats(): void {
    let enemyArmy;
    if (this.teamNumber == Game.TEAM_A) {
      enemyArmy = this.game.getEnemyArmy();
    } else {
      enemyArmy = this.game.getFriendlyArmy();
    }

    const myCoordinate = this.getCenterPosition();

    //find closest army
    this.closestEnemyOrg = null;
    this.closestEnemyOrgDistance = 1000000000;
    this.closestEnemyCoord = null;

    const enemyOrgs = enemyArmy.getOrganizations();
    enemyOrgs.forEach((enemyOrg) => {
      if (enemyOrg.getIsDefeated()) {
        return;
      }

      const enemyCoordinate = enemyOrg.getCenterPosition();

      let xDiff = Math.abs(enemyCoordinate.x - myCoordinate.x);
      let yDiff = Math.abs(enemyCoordinate.y - myCoordinate.y);
      let dist = xDiff + yDiff;

      if (dist < this.closestEnemyOrgDistance) {
        this.closestEnemyOrgDistance = dist;
        this.closestEnemyOrg = enemyOrg;
        this.closestEnemyCoord = enemyCoordinate;
      }
    });

    //no enemies detected
    if (this.closestEnemyOrg == null) {
      this.isFireAtWill = false;
      this.isMovingForward = false;
      return;
    }

    //walk towards enemy
    if (this.closestEnemyOrgDistance > this.getEngagementDistance()) {
      console.log(`${this.name} : set to move`);
      this.isMovingForward = true;
      this.isEngaging = false;
    }
    //within range, stop and fire
    else {
      console.log(`${this.name} : stop and engage`);
      this.isMovingForward = false;
      this.isEngaging = true;
    }

    this.orgMoveAngle =
      Phaser.Math.RAD_TO_DEG *
      Phaser.Math.Angle.Between(
        myCoordinate.x,
        myCoordinate.y,
        this.closestEnemyCoord!.x,
        this.closestEnemyCoord!.y
      );

    const enemyOrgName = (this.closestEnemyOrg as any as Organization).name;
    console.log(`${this.name} : angle is ${this.orgMoveAngle}`);
    console.log(`${this.name} : is fighting ${enemyOrgName}`);
  }

  /**
   * All units in this Organization steps forward (probably toward enemies).
   *
   * Firstly, if needed, move all individual units.
   * If there are no such units, move the entire unit, if needed.
   */
  protected moveUnitsForward() {
    const angleToRad = this.orgMoveAngle * Phaser.Math.DEG_TO_RAD;
    const xMagnitude = Math.cos(angleToRad);
    const yMagnitude = Math.sin(angleToRad);

    //move entire units
    this.units.forEach((unitContainer) => {
      const unit: Unit = unitContainer.getData("data");

      //do not move player's units for them.
      if (unit.getIsPlayerOwned()) return;

      const unitSpeed = unit.getSpeed();

      //move entire unit
      //TODO: do tweening
      unitContainer.setAngle(this.orgMoveAngle);

      unitContainer.x += xMagnitude * unitSpeed;
      unitContainer.y += yMagnitude * unitSpeed;
    });
  }

  /**
   * Move units as individuals according to the x, y in the unitToMoveMap.
   */
  private moveIndividualUnits() {
    for (let [unit, targetCoord] of this.unitToMoveMap.entries()) {
      if (unit.getIsPlayerOwned()) {
        this.unitToMoveMap.delete(unit);
        continue;
      }

      const unitContainer = unit.getUnitContainer();

      let distanceToTarget = Phaser.Math.Distance.Between(
        unitContainer.x,
        unitContainer.y,
        targetCoord.x,
        targetCoord.y
      );

      let unitSpeed = unit.getSpeed();

      //we've arrived
      if (distanceToTarget <= unitSpeed) {
        this.unitToMoveMap.delete(unit);
        unitSpeed = distanceToTarget;
      }

      const targetAngle =
        Phaser.Math.RAD_TO_DEG *
        Phaser.Math.Angle.Between(
          unitContainer.x,
          unitContainer.y,
          targetCoord.x,
          targetCoord.y
        );

      const angleToRad = targetAngle * Phaser.Math.DEG_TO_RAD;
      const xMagnitude = Math.cos(angleToRad);
      const yMagnitude = Math.sin(angleToRad);

      const xMove = xMagnitude * unitSpeed;
      const yMove = yMagnitude * unitSpeed;

      unitContainer.x += xMove;
      unitContainer.y += yMove;
    }
  }

  /**
   * Tell this organization to attack what is in front of them
   */
  protected fire() {
    this.units.forEach((unitContainer) => {
      const unit: Unit = unitContainer.getData("data");

      //do not touch player's units for them.
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
