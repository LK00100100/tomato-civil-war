import { BulletPouch } from "../item/BulletPouch";
import { SmoothboreGun } from "../item/SmoothboreGun";
import { Game } from "../scenes/Game";
import { Tomato } from "./Tomato";

export class UnitFactory {
  /**
   * Creates and draws a tomato (container).
   * @returns A container with a tomato (physics sprite) and a gun (sprite).
   */
  public static createTomato(game: Game): Phaser.GameObjects.Container {
    const tomato = game.add.container(0, 0);

    const tomatoData = new Tomato();
    const gunData = new SmoothboreGun();
    const bulletPouchData = new BulletPouch();
    tomatoData.addItem(gunData);
    tomatoData.addItem(bulletPouchData);

    tomato.setData("data", tomatoData);

    const tomatoSprite = game.physics.add.sprite(0, 0, "unit-tomato");
    tomatoSprite.setData("data", tomatoData);

    const gunSprite = game.add.sprite(20, 100, "item-gun-smoothbore");
    gunSprite.setData("data", gunData);

    //TODO: if not selected, hide gun?

    tomatoSprite.setName("body");
    gunSprite.setName("weapon");

    tomato.add(tomatoSprite);
    tomato.add(gunSprite);

    tomatoData.setUnitContainer(tomato);

    // tomatoSprite.setMass(1);
    // tomatoSprite.setPushable(true);

    return tomato;
  }
}
