import { Game } from "../scenes/Game";
import { Unit } from "../unit/Unit";
import { Organization } from "./Organization";

/**
 * Draws and calculates for:
 * 60 - 200 people
 */
export class Company extends Organization {
  private static readonly MAX_DURATION: 10000;

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

    if (this.duration >= Company.MAX_DURATION) {
      this.duration = 0;

      this.assessThreats();
    }
  }

  protected assessThreats(): void {
    throw new Error("Method not implemented.");
  }
}
