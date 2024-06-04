import { ItemEvent } from "../item/ItemEvent";

/**
 * Normally when you use the secondary fire.
 */
export class NoEvent implements ItemEvent {
  name = "no-item-event";

  private static singleton: NoEvent = new NoEvent();

  public static getSingleton(): NoEvent {
    return NoEvent.singleton;
  }
}
