import { Game } from "../scenes/Game";
import { Organization } from "./Organization";

//TODO: we need more organizations for skirmisher companies and what not
//TODO:maybe rename this to "linecompany with a specific update cycle
/**
 * Draws and calculates for:
 * 60 - 200 people
 */
export class Company extends Organization {
  constructor(game: Game, name: string) {
    super(game, name);
  }
}
