import { Game } from "../scenes/Game";
import { Pike } from "./Pike";
import { Rifle } from "./Rifle";
import { SmoothboreGun } from "./SmoothboreGun";

//TODO: use enums instead of strings.
/**
 * Makes weapons.
 * Remember that the weapon sprite relative to the Unit sprite, is set
 * from 0, 0 (center) of the unit sprite, while facing phaser.angle of 0 (right).
 * Dev Note: arcade physics cannot rotate hit boxes.
 * Dev Note 2: The offsets for adding sprites will be put next to the a sprite's container of position 0, 0.
 * Then the sprite will be moved.
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

  public static makePikeSpriteWithData(game: Game): Phaser.GameObjects.Container {
    const pikeData = new Pike();

    //TODO: move these original offsets into the tomato class. this is really a standard tomato offset. also may ellipse
    const offsetX = 200;
    const offsetY = 100;

    const pikeSprite = game.add.sprite(0, 0, "item-melee-pike");
    pikeSprite.setData("data", pikeData);

    const circle = game.add.ellipse(300, 0, 40, 40, 0x00ff00, 0);
    const circularHitbox = game.physics.add.existing(circle);
    circularHitbox.setData("data", pikeData);

    const pikeContainer = game.add.container(offsetX, offsetY);
    pikeContainer.setData("sprite", pikeSprite);
    pikeContainer.setData("hitbox", circularHitbox);
    pikeContainer.setData("data", pikeData);
    pikeContainer.setData("offset_x", offsetX);
    pikeContainer.setData("offset_y", offsetY);
    pikeContainer.add(pikeSprite);
    pikeContainer.add(circularHitbox);

    return pikeContainer;
  }
}
