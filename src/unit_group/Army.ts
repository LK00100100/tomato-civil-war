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
   * Removes and destroys the unit (and hit box) from the Army.
   * @param unit
   */
  removeUnit(unit: Unit): void {
    const unitContainer = unit.getUnitContainer();
    const hitSprite = unitContainer.getByName("body");

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

  public formUp(x: number, y: number) {
    //TODO: fill more

    const rowSize = 10;
    this.armies.forEach((org, idx) => {
      const gap = idx * 500 * rowSize + 100;
      org.formUp(x + gap, y, rowSize);
    });
  }

  public update(delta: number) {
    this.armies.forEach((a) => a.update(delta));
  }
}
