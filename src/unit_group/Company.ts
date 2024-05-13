import { Game } from "../scenes/Game";
import { Unit } from "../unit/Unit";
import { Organization } from "./Organization";

/**
 * Draws and calculates for:
 * 60 - 200 people
 */
export class Company extends Organization {
  private static readonly THINK_DURATION = 1000;

  constructor(game: Game) {
    super(game);
  }

  //TODO: rotation
  /**
   * form company starting with bottom-left.
   * Go right, then go up.
   * @param x
   * @param y
   */
  public override initFormation(x: number, y: number, rowSize: number) {
    let currentX = x;
    let currentY = y;
    let countPlaced = 0;
    let currentRow = 0;

    this.units.forEach((tomato) => {
      tomato.setAngle(90);
      tomato.setX(currentX);
      tomato.setY(currentY);

      currentX += 500;

      countPlaced++;
      if (countPlaced % rowSize == 0) {
        currentX = currentRow % 2 == 0 ? x - 250 : x;
        currentY -= 500;

        currentRow++;
      }
    });
  }

  public override update(delta: number) {
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

      this.formUp();
    }

    //assess enemies
    if (this.deltaDuration >= Company.THINK_DURATION) {
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
      this.isMoving = false;
      return;
    }

    //walk towards enemy
    if (this.closestEnemyOrgDistance > this.getEngagementDistance()) {
      this.isMoving = true;
      this.isEngaging = false;
    }
    //within range, stop and fire
    else {
      this.isMoving = false;
      this.isEngaging = true;
    }

    this.moveAngle =
      Phaser.Math.RAD_TO_DEG *
      Phaser.Math.Angle.Between(
        myCoordinate.x,
        myCoordinate.y,
        this.closestEnemyCoord!.x,
        this.closestEnemyCoord!.y
      );
  }
}
