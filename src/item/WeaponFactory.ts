import { Game } from "../scenes/Game";
import { Pike } from "./Pike";
import { Rifle } from "./Rifle";
import { SmoothboreGun } from "./SmoothboreGun";
import { Standard } from "./Standard";

//TODO: split this up into sub types of factory. like melee and gun
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

    const circle = game.add.ellipse(300, 0, 50, 50, 0x00ff00, 0);
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

  public static makeStandardSpriteWithData(game: Game, standardType :string): Phaser.GameObjects.Container {
    //TODO: enum and 
    const standardData = new Standard(standardType);

    //TODO: move these original offsets into the tomato class. this is really a standard tomato offset. also may ellipse
    const offsetX = 150;
    const offsetY = 50;

    const sprite = game.add.sprite(0, 0, standardData.getItemName());
    sprite.setData("data", standardData);

    const circle = game.add.ellipse(300, 60, 50, 50, 0x00ff00, 0);
    const circularHitbox = game.physics.add.existing(circle);
    circularHitbox.setData("data", standardData);

    const pikeContainer = game.add.container(offsetX, offsetY);
    pikeContainer.setData("sprite", sprite);
    pikeContainer.setData("hitbox", circularHitbox);
    pikeContainer.setData("data", standardData);
    pikeContainer.setData("offset_x", offsetX);
    pikeContainer.setData("offset_y", offsetY);
    pikeContainer.add(sprite);
    pikeContainer.add(circularHitbox);

    return pikeContainer;
  }
}
