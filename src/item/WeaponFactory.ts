import { Game } from "../scenes/Game";
import { Rifle } from "./Rifle";
import { SmoothboreGun } from "./SmoothboreGun";

/**
 * Makes weapons.
 */
export class WeaponFactory {
  public static makeSmoothboreGunSpriteWithData(
    game: Game
  ): Phaser.GameObjects.Sprite {
    const gunSprite = game.add.sprite(20, 100, "item-gun-smoothbore");
    gunSprite.setData("data", new SmoothboreGun());

    return gunSprite;
  }

  public static makeRifleSpriteWithData(game: Game): Phaser.GameObjects.Sprite {
    const gunSprite = game.add.sprite(20, 100, "item-gun-rifle");
    gunSprite.setData("data", new Rifle());

    return gunSprite;
  }
}
