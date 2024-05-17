import { Game } from "../scenes/Game";
import { Organization } from "./Organization";

/**
 * Draws and calculates for:
 * 60 - 200 people
 */
export class Company extends Organization {
  constructor(game: Game, name: string) {
    super(game, name);
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

    this.orgMoveAngle =
      Phaser.Math.RAD_TO_DEG *
      Phaser.Math.Angle.Between(
        myCoordinate.x,
        myCoordinate.y,
        this.closestEnemyCoord!.x,
        this.closestEnemyCoord!.y
      );
  }
}
