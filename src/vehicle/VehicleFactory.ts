import { Game } from "../scenes/Game";
import { Horse } from "./Horse";

//TODO: use enums instead of strings.
/**
 * Makes Vehicles.
 * Dev Note: arcade physics cannot rotate hit boxes.
 */
export class VehicleFactory {

  public static makeHorseSpriteWithData(
    game: Game
  ): Phaser.GameObjects.Container {
    //TODO: set to 0,0 later or pass input
    const data = new Horse();

    const horseSprite = game.add.sprite(0, 0, "vehicle-horse");
    horseSprite.setData("data", data);
    horseSprite.setDepth(-10);  //TODO: use enums

    //phaser-arcade cannot do rotating hitboxes
    const circle = game.add.ellipse(0, 0, 290, 290, 0x00ff00, 0);
    const circularHitbox = game.physics.add.existing(circle);
    circularHitbox.setData("data", data);

    //TODO: one hitbox for now

    //make container
    const horseContainer = game.add.container(0, 0);
    horseContainer.setData("sprite", horseSprite);
    horseContainer.setData("hitbox", circularHitbox);
    horseContainer.setData("data", data);
    horseContainer.setData("destroyFunction", () => {
      circularHitbox.destroy();
      horseSprite.destroy();
      horseContainer.destroy();
    });

    horseContainer.add(horseSprite);
    horseContainer.add(circularHitbox);
    horseContainer.setDepth(-10);

    circularHitbox.setData("container", horseContainer);

    //dev note: could make another destroy func that actual destroys
    return horseContainer;
  }

}
