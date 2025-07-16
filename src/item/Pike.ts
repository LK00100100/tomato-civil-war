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

    //turn off kill
    if(this.cooldownDuration >= Pike.MIN_COOLDOWN_TURN_OFF_KILL_MODE) {
      this.isKillMode = false;
      this.killModeIsOffCallback();
    }

    //move melee weapon, swipe and stab
    //TODO:
    //angle
    //then back
  }

}
