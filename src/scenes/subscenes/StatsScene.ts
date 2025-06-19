import { Scene } from "phaser";
import { ButtonUtil } from "../../util/ButtonUtil";
import { Stats } from "../../util/Stats";

/**
 * Used only by GameScene.ts.
 * Ui that displays, buttons, information and debug text.
 * Doesn't do any heavy calculations.
 */
export default class StatsScene extends Scene {
  public static readonly HANDLE = "StatsScene"; //has to be same as above

  private statsText!: Phaser.GameObjects.Text; //stats messages

  private okButtonSprite: Phaser.GameObjects.Sprite;

  constructor() {
    super(StatsScene.HANDLE); //has to be same as below
  }

  create() {
    console.log("opening stats screen");
    this.add.sprite(500, 300, "ui-battle-stats-paper");

    const textConfig = { fontSize: 20, color: "black" };
    this.statsText = this.add.text(300, 100, "tbd", textConfig).setDepth(1000);

    this.createButtons();

    this.updateMajorStatsText();
  }

  private createButtons(): void {
    this.okButtonSprite = this.add.sprite(500, 600, "btn-ok").setInteractive();

    const okClickFunc = () => {
      console.log("ok");
    };
    ButtonUtil.dressUpButton(this.okButtonSprite, okClickFunc);
  }

  resetUi() {
    this.okButtonSprite?.clearTint();
  }

  updateMajorStatsText() {
    let txt = "";
    //TODO: use enum for stats keys

    if (Stats.getStat("friendly-army-units-alive") == 0) {
      txt = "Battle Lost";
    } else {
      txt = "Battle Won";
    }

    txt += `\n\nFriendly Units Alive: ${Stats.getStat(
      "friendly-army-units-alive"
    )} / ${Stats.getStat("friendly-army-units-started")}`;
    txt += `\nEnemy Units Alive: ${Stats.getStat(
      "enemy-army-units-alive"
    )} / ${Stats.getStat("enemy-army-units-started")}`;

    txt += `\nFriendly Dead: ${Stats.getStat("friendly-dead")}`;
    txt += `\nEnemy Dead: ${Stats.getStat("enemy-dead")}`;

    const friendlyHits = Stats.getStat("friendly-hits-enemy");
    const friendlyShots = Stats.getStat("friendly-shots-fired");
    const friendlyAccuracy =
      ((friendlyHits / friendlyShots) * 100).toFixed(2) || 0.0;

    txt += `\n\nFriendy Hits : ${friendlyHits} / ${friendlyShots} (${friendlyAccuracy}%)`;

    const enemyHits = Stats.getStat("enemy-hits-friendly");
    const enemyShots = Stats.getStat("enemy-shots-fired");
    const enemyAccuracy = ((enemyHits / enemyShots) * 100).toFixed(2) || 0.0;

    txt += `\nEnemy Hits : ${enemyHits} / ${enemyShots} (${enemyAccuracy}%)`;

    txt += `\n\nFriendly Misses: ${Stats.getStat("friendly-misses")}`;
    txt += `\nEnemy Misses: ${Stats.getStat("enemy-misses")}`;

    const playerHits = Stats.getStat("player-hits-enemy");
    const playerShots = Stats.getStat("player-shots-fired");
    const playerAccuracy = playerShots == 0 ? "N/A" : ((playerHits / playerShots) * 100).toFixed(2) || 0.0;

    txt += `\n\nPlayer Hits : ${playerHits} / ${playerShots} (${playerAccuracy}%)`;
    txt += `\nPlayer Misses: ${Stats.getStat("player-misses-enemy")}`;
    txt += `\n\nPlayer Kills: ${Stats.getStat("player-kills-enemy")}`;

    txt += this.statsText.text = txt;
  }
}
