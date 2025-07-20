import { Smoke } from "../entity/Smoke";
import { Game } from "../scenes/Game";

/**
 * A pool of smoke sprites and their data.
 * It creates as many as it needs. Creates more if needed.
 */
export class SmokePool {

  /**
   * Smoke added here are reset and invisible.
   */
  private smokePool: Phaser.GameObjects.Sprite[];

  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.smokePool = [];
  }

  /**
   * 
   * @returns 
   */
  public getSmoke(): Phaser.GameObjects.Sprite {
    if (this.smokePool.length == 0) {
      return this.createNewSmoke();
    }

    const smokeSprite = this.smokePool.pop()!;
    smokeSprite.setVisible(true);

    return smokeSprite;
  }

  /**
   * smoke is stored, reset, and invisible.
   * @param smokeSprite -
   */
  public addAndResetSmoke(smokeSprite: Phaser.GameObjects.Sprite) {
    smokeSprite.setVisible(false);

    const smokeData: Smoke = smokeSprite.getData("data");
    smokeData.reset();

    this.smokePool.push(smokeSprite);
  }

  private createNewSmoke(): Phaser.GameObjects.Sprite {
    const smokeSprite = this.game.add.sprite(
      0,
      0,
      "entity-smoke"
    );

    const smokeData = new Smoke();
    smokeSprite.setData("data", smokeData);

    return smokeSprite;
  }

}
