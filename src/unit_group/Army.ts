import { Game } from "../scenes/Game";
import { Unit } from "../unit/Unit";
import { Organization } from "./Organization";

/**
 * Contains smaller units of organization.
 * Draws and calculates.
 */
export class Army {
  private teamNumber: number;

  private armies: Array<Organization>;

  private unitHitSprites: Phaser.Physics.Arcade.Group;

  constructor(game: Game, teamNumber: number) {
    this.teamNumber = teamNumber;

    this.armies = [];

    this.unitHitSprites = game.physics.add.group();
  }

  /**
   * Returns the group of enemy hitboxes.
   * Do not directly alter this group. Use Army's methods to modify.
   * @returns a phaser group of hitboxes. For collision calculations.
   */
  getUnitHitSprites() {
    return this.unitHitSprites;
  }

  getOrganizations() {
    return this.armies;
  }

  /**
   * Returns the number of alive units.
   * @returns number
   */
  getAliveArmyCount(): number {
    return this.unitHitSprites.children.size;
  }

  /**
   * Removes and destroys the unit (and hit box) from the Army.
   * If no unit in the army, nothing happens.
   * @param unit
   */
  removeUnit(unit: Unit): void {
    const unitContainer = unit.getUnitContainer();
    const hitSprite = unitContainer.getByName("body");

    //nothing to remove
    if (!this.unitHitSprites.contains(hitSprite)) {
      return;
    }

    this.unitHitSprites.remove(hitSprite);

    this.armies.forEach((a) => a.removeUnit(unit));

    hitSprite.destroy();
  }

  getUnitCount() {
    return this.armies
      .map((army) => army.getUnitCount())
      .reduce((a, b) => a + b);
  }

  addOrganization(organization: Organization) {
    organization.setTeamNumber(this.teamNumber);
    this.armies.push(organization);

    const units = organization.getUnits();

    units.forEach((unitContainer) => {
      let hitbox = unitContainer.getByName("body");

      this.unitHitSprites.add(hitbox);
    });
  }

  /**
   * Call once to draw the army on the map.
   * @param x
   * @param y
   * @param rowSize columns in a row
   * @param initRotation phaser angle for formation
   */
  public initFormation(
    x: number,
    y: number,
    rowSize: number,
    initAngle: number
  ) {
    this.armies.forEach((org, idx) => {
      //prettier-ignore
      const gap = idx * ((500 * rowSize) + 1000);
      org.initFormation(x + gap, y, rowSize, initAngle);
    });
  }

  public update(delta: number) {
    this.armies.forEach((org) => org.update(delta));
  }

  public isDefeated(): boolean {
    return this.armies.every((org) => org.getIsDefeated());
  }
}
