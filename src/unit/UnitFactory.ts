import { BulletPouch } from "../item/BulletPouch";
import { WeaponFactory } from "../item/WeaponFactory";
import { Game } from "../scenes/Game";
import { Tomato } from "./Tomato";

export class UnitFactory {
  /**
   * Creates and draws a tomato (container).
   * @param game game to draw on
   * @param startingWeaponSprCon starting weapon sprite to draw and add to the Tomato. or container.
   * @returns A container with a tomato (physics sprite) and some starter items.
   */
  public static createTomato(
    game: Game,
    startingWeaponSprCon?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Container | undefined
  ): Phaser.GameObjects.Container {

    //TODO: should really remove this and just "create tomato"
    if (startingWeaponSprCon == undefined) {
      startingWeaponSprCon =
        WeaponFactory.makeSmoothboreGunSpriteWithData(game);
    }

    //TODO: enums
    startingWeaponSprCon.setName("weapon");
    const weaponData = startingWeaponSprCon.getData("data");

    const bulletPouchData = new BulletPouch();

    const tomatoData = new Tomato();
    tomatoData.addItem(weaponData);
    tomatoData.addItem(bulletPouchData);

    const tomatoSprite = game.physics.add.sprite(0, 0, "unit-tomato");
    tomatoSprite.setData("data", tomatoData);
    tomatoSprite.setName("body");

    //TODO: if not selected, hide gun?

    //TODO: rename "body" to "sprite"

    const tomatoContainer = game.add.container();
    tomatoContainer.setData("data", tomatoData); //redundant since sprite has data, but makes my life easier.
    tomatoContainer.add(tomatoSprite);
    tomatoContainer.add(startingWeaponSprCon);

    tomatoData.setUnitContainer(tomatoContainer);

    // tomatoSprite.setMass(1);
    // tomatoSprite.setPushable(true);

    //TODO: double check containers are destroyed

    return tomatoContainer;
  }
}
