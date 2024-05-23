import { ItemEvent } from "../item/ItemEvent";

export class GunFireEvent implements ItemEvent {
  name: string;
  fireAngle: number;
  damage: number;
}
