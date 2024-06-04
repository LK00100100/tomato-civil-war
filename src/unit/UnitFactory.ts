import { BulletPouch } from "../item/BulletPouch";
import { WeaponFactory } from "../item/WeaponFactory";
import { Game } from "../scenes/Game";
import { Tomato } from "./Tomato";

export class UnitFactory {
  /**
   * Creates and draws a tomato (container).
   * @param game game to draw on
   * @param startingWeaponSprite starting weapon sprite to draw and add to the Tomato.
   * @returns A container with a tomato (physics sprite) and some starter items.
   */
  public static createTomato(
    game: Game,
    startingWeaponSprite?: Phaser.GameObjects.Sprite | undefined
  ): Phaser.GameObjects.Container {
    const tomatoContainer = game.add.container(0, 0);
    const tomatoData = new Tomato();

    if (startingWeaponSprite == undefined) {
      startingWeaponSprite =
        WeaponFactory.makeSmoothboreGunSpriteWithData(game);
    }

    //TODO: enums
    startingWeaponSprite.setName("weapon");
    const gunData = startingWeaponSprite.getData("data");

    const bulletPouchData = new BulletPouch();
    tomatoData.addItem(gunData);
    tomatoData.addItem(bulletPouchData);

    const tomatoSprite = game.physics.add.sprite(0, 0, "unit-tomato");
    tomatoSprite.setData("data", tomatoData);

    //TODO: if not selected, hide gun?

    tomatoSprite.setName("body");

    tomatoContainer.setData("data", tomatoData);
    tomatoContainer.add(tomatoSprite);
    tomatoContainer.add(startingWeaponSprite);

    tomatoData.setUnitContainer(tomatoContainer);

    // tomatoSprite.setMass(1);
    // tomatoSprite.setPushable(true);

    return tomatoContainer;
  }
}
