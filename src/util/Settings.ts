/**
 * Singleton of player's settings
 */
export class Settings {
  /**
   * Turns on visual debugging and console logging.
   */
  private isDebugMode: boolean;

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
}
