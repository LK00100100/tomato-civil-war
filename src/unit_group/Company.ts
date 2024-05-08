import { Coordinate } from "../Coordinate";
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

  /**
   * form company starting with bottom-left.
   * Go right, then go up.
   * @param x
   * @param y
   */
  public override formUp(x: number, y: number, rowSize: number) {
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
    this.duration += delta;

    this.units.forEach((container) => {
      const unit = container.getData("data") as Unit;
      unit.update(delta);
    });

    if (this.isMoving) {
      this.moveUnits();
    }

    if (this.isFireAtWill) {
      this.attackUnits();
    }

    if (this.duration >= Company.THINK_DURATION) {
      this.duration = 0;

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
    let closestEnemyOrg: Organization | null = null;
    let closestEnemyOrgDistance = 1000000000;
    let closestEnemyCoord: Coordinate | null = null;

    const enemyOrgs = enemyArmy.getOrganizations();
    enemyOrgs.forEach((enemyOrg) => {
      if (enemyOrg.getIsDefeated()) {
        return;
      }

      const enemyCoordinate = enemyOrg.getCenterPosition();

      let xDiff = Math.abs(enemyCoordinate.x - myCoordinate.x);
      let yDiff = Math.abs(enemyCoordinate.y - myCoordinate.y);
      let dist = xDiff + yDiff;

      if (dist < closestEnemyOrgDistance) {
        closestEnemyOrgDistance = dist;
        closestEnemyOrg = enemyOrg;
        closestEnemyCoord = enemyCoordinate;
      }
    });

    //no enemies detected
    if (closestEnemyOrg == null) {
      this.isFireAtWill = false;
      this.isMoving = false;
      return;
    }

    //walk towards enemy
    if (closestEnemyOrgDistance > this.getEngagementDistance()) {
      this.isFireAtWill = false;
      this.isMoving = true;
    }
    //within range, stop and fire
    else {
      this.isFireAtWill = true;
      this.isMoving = false;
    }

    this.moveAngle =
      Phaser.Math.RAD_TO_DEG *
      Phaser.Math.Angle.Between(
        myCoordinate.x,
        myCoordinate.y,
        closestEnemyCoord!.x,
        closestEnemyCoord!.y
      );
  }
}
