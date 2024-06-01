import { Scene } from "phaser";
import { Game } from "../Game";
import { Unit } from "../../unit/Unit";

/**
 * On top of the game screen. Has stats
 */
export default class BattleInfoScene extends Scene {
  public static readonly HANDLE = "BattleInfoScene"; //has to be same as above

  private hpText!: Phaser.GameObjects.Text; //stats messages

  private gameScene: Game;

  constructor(gameScene: Game) {
    super(BattleInfoScene.HANDLE); //has to be same as below

    this.gameScene = gameScene;
  }

  create() {
    console.log("opening battle info screen");
    this.hpText = this.add
      .text(50, 700, "test", { fontSize: 30 })
      .setDepth(1000);
  }

  update() {
    const playerUnit = this.gameScene.getPlayerUnit();

    if (playerUnit == null) return;

    const playerData: Unit = playerUnit.getData("data");

    const playerHp = Math.max(0, playerData.getHp());

    this.hpText.text = "HP: " + playerHp;
  }
}
