import { Melee } from "./Melee";

/**
 * A large spear.
 * Great against horses.
 * Kills a Tomato in 2 hits.
 */
export class Pike extends Melee {
  private static readonly ITEM_NAME = "item-melee-pike";

  private static readonly DAMAGE_BASE = 70;

  private static readonly MAX_COOLDOWN_DURATION = 500;

  private static readonly MIN_COOLDOWN_TURN_OFF_KILL_MODE = Pike.MAX_COOLDOWN_DURATION / 2;

  protected override getItemName(): string {
    return Pike.ITEM_NAME;
  }

  protected getCooldownDuration(): number {
    return Pike.MAX_COOLDOWN_DURATION;
  }

  public calcDamage(): number {
    return Pike.DAMAGE_BASE;
  }

  public override update(delta: number): void {
    super.update(delta);

    this.updatePikeOffset(delta);

    //turn off kill
    if (this.cooldownDuration >= Pike.MIN_COOLDOWN_TURN_OFF_KILL_MODE) {
      this.isKillMode = false;

      if (this.killModeIsOffCallback) {
        this.killModeIsOffCallback();
      }
    }
  }

  private updatePikeOffset(delta: number) {

    if(this.cooldownDuration == 0) {
      this.offsetX = 0;
      return;
    }

    //move pike forward
    if (this.cooldownDuration < Pike.MIN_COOLDOWN_TURN_OFF_KILL_MODE) {
      this.offsetX += delta * 10;
    }
    //move pike backwards
    else {
      this.offsetX -= delta * 10;
    }

  }

}
