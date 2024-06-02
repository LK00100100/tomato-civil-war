/**
 * Singleton of player's settings
 */
export class Settings {
  /**
   * Turns on visual debugging and console logging.
   */
  private isDebugMode: boolean;

  /**
   * a number between 0 (0%) and 1 (100%)
   */
  private currentVolume: number = 0.1;

  private static instance: Settings = new Settings();

  private constructor() {
    this.isDebugMode = false;
  }

  public getInstance(): Settings {
    return Settings.instance;
  }

  public static setIsDebugMode(newState: boolean) {
    Settings.instance.isDebugMode = newState;
  }

  public static getIsDebugMode(): boolean {
    return Settings.instance.isDebugMode;
  }

  public static getCurrentVolume(): number {
    return Settings.instance.currentVolume;
  }

  public static setCurrentVolume(newVolume: number): void {
    if (newVolume < 0 || newVolume > 1)
      throw new Error("Bad argument. Should be [0.0, 1.0]");

    Settings.instance.currentVolume = newVolume;
  }
}
