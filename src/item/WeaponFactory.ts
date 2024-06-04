import { Game } from "../scenes/Game";
import { Pike } from "./Pike";
import { Rifle } from "./Rifle";
import { SmoothboreGun } from "./SmoothboreGun";

/**
 * Makes weapons.
 * Remember that the weapon sprite relative to the Unit sprite, is set
 * from 0, 0 (center) of the unit sprite, while facing phaser.angle of 0 (right).
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

  //TODO: physics sprite
  public static makePikeSpriteWithData(game: Game): Phaser.GameObjects.Sprite {
    const meleeSprite = game.physics.add.sprite(200, 100, "item-melee-pike");
    meleeSprite.setData("data", new Pike());

    return meleeSprite;
  }
}
