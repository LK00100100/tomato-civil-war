import { Item } from "./Item";

/**
 * Basic gun.
 * Requires the user to have a bullet pouch.
 */
export class Gun implements Item {
  isLoaded: boolean;

  isReloading: boolean;

  duration: number; //current reload duration

  static readonly MAX_RELOAD_DURATION = 3000;

  //TODO: need to load bullets
  constructor() {
    this.isLoaded = true;
    this.isReloading = false;

    this.duration = 0;
  }

  update(delta: number) {
    if (this.isLoaded) return;

    this.duration += delta;

    if (this.duration >= Gun.MAX_RELOAD_DURATION) {
      this.duration = 0;
      this.isReloading = false;
      this.isLoaded = true;
    }
  }

  useItem(): string {
    //ready to fire
    if (this.isLoaded) {
      this.isLoaded = false;
      return "item-gun-fire";
    }

    if (!this.isReloading) {
      this.isReloading = true;
      return "item-gun-reload-start";
    }

    return "item-gun-reloading";
  }
}
