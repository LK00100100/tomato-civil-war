import { Coordinate } from "../Coordinate";
import { Position } from "../Position";
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
   * Number of columns are set when init.
   * Always a rectangle.shape.
   */
  protected unitRows: Array<Array<Unit | null>>;
  /**
   * Unit to row/col in the formation.
   */
  protected unitRowMap: Map<Unit, Position>; //0-indexed

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
  protected isActivelyFighting: boolean;

  protected game: Game;

  protected deltaAssessEnemyDuration: number;
  protected deltaAssessFightDuration: number;

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
   * Whenever there has been a loss, you'll need to fill in the gaps
   */
  protected needsReform: boolean;

  /**
   * Where unit is facing. in terms of "Phaser angle degrees".
   * East is 0. West is 180/-180. North is -90. South is 90.
   * Generally facing last known enemy position.
   */
  protected orgFaceAngle: number;

  private static readonly ASSESS_ENEMY_DURATION = 2000;
  private static readonly ASSESS_FIGHTING_DURATION = 5000;

  private static readonly MINIMUM_ENGAGEMENT_DISTANCE = 9000;
  private static readonly TOMATO_WIDTH_PIXELS = 256;

  constructor(game: Game, name: string) {
    this.game = game;
    this.name = name;

    this.units = new Set();

    this.unitRows = [];
    this.unitRowMap = new Map();
    this.unitToMoveMap = new Map();

    this.deltaAssessEnemyDuration = 0;
    this.deltaAssessFightDuration = 0;

    this.isFireAtWill = true;
    this.isMovingForward = false;
    this.isActivelyFighting = false;

    this.orgFaceAngle = 0;

    this.engagementDistance = Organization.MINIMUM_ENGAGEMENT_DISTANCE;

    this.needsReform = false;
    this.isDefeated = false;
  }

  public getIsDefeated() {
    return this.isDefeated;
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

    const { col, row } = this.unitRowMap.get(unit)!;
    this.unitRowMap.delete(unit);

    this.unitRows[row][col] = null;

    this.unitToMoveMap.delete(unit);

    this.needsReform = true;

    if (this.units.size == 0) {
      this.isDefeated = true;
    }
  }

  //TODO: set unit tests
  //TODO: perhaps get center of empty units
  /**
   * Tries to draw a box around remaining units.
   * Imagine the first row only has the right half. The center is the center of that.
   * If there are no units, throws error.
   * @returns
   */
  public getCenterPosition(): Coordinate {
    if (this.units.size == 0) {
      throw new Error("no units, therefore no position");
    }

    if (this.units.size == 1) {
      for (let unitContainer of this.units) {
        return {
          x: unitContainer.x,
          y: unitContainer.y,
        };
      }
    }

    const numRows = this.unitRows.length;
    const numCols = this.unitRows[0].length; //all rows are the same size

    let frontMostUnit: Unit | null = null;
    let backMostUnit: Unit | null = null;
    let leftMostUnit: Unit | null = null; //left of first row
    let rightMostUnit: Unit | null = null;

    let hasLeftOffset = false; //an even row sticks out left
    let hasRightOffset = false; //an odd row sticks out right

    //get front most unit
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        const unit = this.unitRows[r][c];
        if (unit == null) continue;

        if (frontMostUnit == null) {
          frontMostUnit = unit;
          break;
        }
      }

      if (frontMostUnit != null) break;
    }

    //get back most unit
    for (let r = numRows - 1; r >= 0; r--) {
      for (let c = 0; c < numCols; c++) {
        const unit = this.unitRows[r][c];
        if (unit == null) continue;

        if (backMostUnit == null) {
          backMostUnit = unit;
          break;
        }
      }

      if (backMostUnit != null) break;
    }

    //get left most unit (if tie, get left offset)
    for (let c = 0; c < numCols; c++) {
      for (let r = 0; r < numRows; r++) {
        const unit = this.unitRows[r][c];
        if (unit == null) continue;

        if (leftMostUnit == null) {
          leftMostUnit = unit;
        }

        //any even rows stick out to the left
        if (r % 2 == 0) {
          hasLeftOffset = true;
          break;
        }
      }

      if (leftMostUnit != null) break;
    }

    //get right most unit, (if tie, get right offset)
    for (let c = numCols - 1; c >= 0; c--) {
      for (let r = 0; r < numRows; r++) {
        const unit = this.unitRows[r][c];
        if (unit == null) continue;

        if (rightMostUnit == null) {
          rightMostUnit = unit;
        }

        //any odd rows stick out to the right
        if (r % 2 != 0) {
          hasRightOffset = true;
          break;
        }
      }

      if (rightMostUnit != null) break;
    }

    const realNumRows =
      this.unitRowMap.get(backMostUnit!)!.row -
      this.unitRowMap.get(frontMostUnit!)!.row +
      1;
    const realNumColumns =
      this.unitRowMap.get(rightMostUnit!)!.col -
      this.unitRowMap.get(leftMostUnit!)!.col +
      1;

    const estimatedFacingAngle = frontMostUnit!.getUnitContainer().angle;

    //toward next column
    const angleToRight = Phaser.Math.Angle.WrapDegrees(
      estimatedFacingAngle + 90
    );
    const angleToRightRad = angleToRight * Phaser.Math.DEG_TO_RAD;
    let toRightXMagnitude =
      Math.cos(angleToRightRad) * Organization.TOMATO_WIDTH_PIXELS;
    let toRightYMagnitude =
      Math.sin(angleToRightRad) * Organization.TOMATO_WIDTH_PIXELS;

    //toward next rows (upward)
    const angleToUpRowRad = estimatedFacingAngle * Phaser.Math.DEG_TO_RAD;
    const toFrontXMagnitude =
      Math.cos(angleToUpRowRad) * Organization.TOMATO_WIDTH_PIXELS;
    //prettier-ignore
    const toFrontYMagnitude =
      Math.sin(angleToUpRowRad) * (Organization.TOMATO_WIDTH_PIXELS);

    //step horiontally towards center
    //prettier-ignore
    let armyUnitWidth = (realNumColumns * 2) - 1; //army's number of units wide
    if (hasLeftOffset && hasRightOffset) {
      armyUnitWidth += 1;
    }

    const leftUnitContainer = leftMostUnit!.getUnitContainer();
    //prettier-ignore
    const numRightStepsToCenter = (armyUnitWidth / 2) - 0.5;

    //prettier-ignore
    let totalX = leftUnitContainer.x + (toRightXMagnitude * numRightStepsToCenter);
    //prettier-ignore
    let totalY = leftUnitContainer.y + (toRightYMagnitude * numRightStepsToCenter);

    //make vertical steps to center
    const currentRow = this.unitRowMap.get(leftMostUnit!)!.row;
    //prettier-ignore
    const middleRow = (realNumRows / 2.0) - 0.5;
    //can be negative (go left on negative, otherwise step right)
    const numVerticalStepsToCenter = currentRow - middleRow;

    totalX += toFrontXMagnitude * numVerticalStepsToCenter;
    totalY += toFrontYMagnitude * numVerticalStepsToCenter;

    //TODO:
    this.game.add.rectangle(totalX, totalY, 100, 100, 0xffa500); //orange rectangle

    return {
      x: totalX,
      y: totalY,
    };
  }

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

    this.orgFaceAngle = initAngle;

    let unitRow: Array<Unit> = [];
    this.units.forEach((tomato) => {
      tomato.setAngle(initAngle);

      let unit = tomato.getData("data");
      unitRow.push(unit);
      this.unitRowMap.set(unit, { col: currentCol, row: currentRow });

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
    this.calculateFormUpToMove({ x: x, y: y }, this.orgFaceAngle);

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
    let movedAUnit = false;
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
            movedAUnit = true;

            //update metadata
            this.unitRowMap.set(candidate, { col: c, row: r });
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
        movedAUnit = true;

        const units = lastRow.filter((x) => x != null);

        lastRow.fill(null);

        for (let i = rightEdge; i >= leftEdge; i--) {
          lastRow[i] = units.pop()!;

          // update metadata
          this.unitRowMap.set(lastRow[i]!, { col: i, row: lastRowNum });
        }
      }
    }

    if (movedAUnit) {
      this.calculateFormUpToMove(this.getCenterPosition(), this.orgFaceAngle);
    }

    return movedAUnit;
  }

  /**
   * Calculates the x,y for each individual to rotate.
   * Set the army's rotate angle.
   * @param rotateAngle phaser angle to rotate (degrees)
   */
  protected calculateRotateArmy(rotateAngle: number) {
    this.calculateFormUpToMove(this.getCenterPosition(), rotateAngle);
    this.orgFaceAngle = rotateAngle;
  }

  /**
   * Calculates the x, y each unit needs to go to
   * in order to go back to looking like a formation.
   * If everyone is already drawn in formation,
   * this will do nothing.
   * You can call formUp() before calling this
   * to move up units into the gap (not drawn).
   * Set org's angle.
   *
   * @param orgCoord center of organization
   * @param facingAngle Phaser angle to face
   */
  private calculateFormUpToMove(orgCoord: Coordinate, facingAngle: number) {
    console.log(`${this.name} : calculateFormUpToMove()`);
    //get to top-left-corner of the formation
    //relative to the organization's direction

    //TODO: set isDebug mode
    this.game.add.rectangle(orgCoord.x, orgCoord.y, 100, 100, 0x00008b); //dark blue
    console.log(`${this.name} form up at ${orgCoord.x}, ${orgCoord.y}`);

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
    const angleToColumn = Phaser.Math.Angle.WrapDegrees(this.orgFaceAngle + 90);
    const angleToColumnRad = angleToColumn * Phaser.Math.DEG_TO_RAD;
    const xColumnMagnitude =
      Math.cos(angleToColumnRad) * Organization.TOMATO_WIDTH_PIXELS * 2;
    const yColumnMagnitude =
      Math.sin(angleToColumnRad) * Organization.TOMATO_WIDTH_PIXELS * 2;

    //calc to next row direction
    const angleToRow = Phaser.Math.Angle.WrapDegrees(this.orgFaceAngle + 180);
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

    this.orgFaceAngle = facingAngle;
  }

  /**
   * Update this organization's action. For calculation.
   * @param delta time in millseconds since the last frame.
   */
  public update(delta: number) {
    if (this.getIsDefeated()) return;

    this.deltaAssessEnemyDuration += delta;
    this.deltaAssessFightDuration += delta;

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

    if (this.isActivelyFighting) {
      if (this.isFireAtWill) {
        this.fire();
      }
    }

    //assess enemies often
    if (this.deltaAssessEnemyDuration >= Organization.ASSESS_ENEMY_DURATION) {
      this.deltaAssessEnemyDuration = 0;

      //this company is currently firing at the enemy
      if (this.isActivelyFighting) {
        if (this.closestEnemyOrg!.getIsDefeated()) {
          //done fighting
          this.isActivelyFighting = false;
          console.log(`${this.name}: completed fighting`);
        }
      }
      //enemy too far away
      else {
        console.log(`${this.name}: finding new threat`);
        //not currently fighting anything. get closer to the fight
        this.findAndFightThreats();

        //face towards new enemy, if needed
        //TODO: make a method for unitToMoveMap.size == 0
        if (this.closestEnemyOrg != null && this.unitToMoveMap.size == 0) {
          //TODO: this causes back-sliding for some reason. but i know this method works well?
          console.log(`${this.name}: rotating towards far enemy`);
          this.calculateRotateArmy(this.orgFaceAngle);
        }
      }
    }

    //assess while fighting every now and then
    if (
      this.deltaAssessFightDuration >= Organization.ASSESS_FIGHTING_DURATION
    ) {
      this.deltaAssessFightDuration = 0;

      //not fighting, do nothing
      if (!this.isActivelyFighting) {
        return;
      }

      //probably already rotating.
      if (this.unitToMoveMap.size > 0) {
        return;
      }

      //rotate to face enemy's probably new center after losses.
      if (
        this.closestEnemyOrg != null &&
        !this.closestEnemyOrg!.getIsDefeated()
      ) {
        const myCoordinate = this.getCenterPosition();
        const enemyCoordinate = this.closestEnemyOrg!.getCenterPosition();
        this.orgFaceAngle =
          Phaser.Math.RAD_TO_DEG *
          Phaser.Math.Angle.Between(
            myCoordinate.x,
            myCoordinate.y,
            enemyCoordinate.x,
            enemyCoordinate.y
          );
      }

      console.log(`${this.name}: rotating under combat`);
      //TODO: this causes some shifting for some reason
      //this.calculateRotateArmy(this.orgMoveAngle);
      if (this.needsReform) {
        console.log(`${this.name}: reforming under combat`);
        this.fillGapsAndCalculateFormup(); //this causes a mass disappearance???
        this.needsReform = false;
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

    //no more enemies at all
    if (this.closestEnemyOrg == null) {
      this.isFireAtWill = false;
      this.isMovingForward = false;
      return;
    }

    //walk towards enemy
    if (this.closestEnemyOrgDistance > this.getEngagementDistance()) {
      console.log(`${this.name} : set to move`);
      this.isMovingForward = true;
      this.isActivelyFighting = false;
    }
    //within range, stop and fire
    else {
      console.log(`${this.name} : stop and engage`);
      this.isMovingForward = false;
      this.isActivelyFighting = true;
    }

    this.orgFaceAngle =
      Phaser.Math.RAD_TO_DEG *
      Phaser.Math.Angle.Between(
        myCoordinate.x,
        myCoordinate.y,
        this.closestEnemyCoord!.x,
        this.closestEnemyCoord!.y
      );

    const enemyOrgName = (this.closestEnemyOrg as any as Organization).name;
    console.log(`${this.name} : angle is ${this.orgFaceAngle}`);
    console.log(`${this.name} : is fighting ${enemyOrgName}`);
  }

  /**
   * All units in this Organization steps forward (probably toward enemies).
   *
   * Firstly, if needed, move all individual units.
   * If there are no such units, move the entire unit, if needed.
   */
  protected moveUnitsForward() {
    const angleToRad = this.orgFaceAngle * Phaser.Math.DEG_TO_RAD;
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
      unitContainer.setAngle(this.orgFaceAngle);

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
      unitContainer.setAngle(this.orgFaceAngle);

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

      const unitPosition = this.unitRowMap.get(unit)!;

      //do not fire if not in the first 2 rows.
      if (unitPosition.row >= 2) {
        return;
      }

      //TODO: do tweening
      unitContainer.setAngle(this.orgFaceAngle);

      const event = unit.doAction();

      if (event.name == "item-gun-fire") {
        this.game.shootBullet(unit, this.teamNumber, event as GunFireEvent);
      }

      //TODO: handle event better. event handler?
    });
  }
}
