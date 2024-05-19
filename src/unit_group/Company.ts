import { Game } from "../scenes/Game";
import { Organization } from "./Organization";

/**
 * Draws and calculates for:
 * 60 - 200 people
 */
export class Company extends Organization {
  constructor(game: Game, name: string) {
    super(game, name);
  }
}
