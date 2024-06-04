import { ItemEvent } from "../item/ItemEvent";

//TODO: singletons for reload
export class GunFireEvent implements ItemEvent {
  /**
   * event-name
   */
  name: string;
  fireAngle: number;
  damage: number;
}
