/**
 * Singleton of player's settings
 */
export class Settings {
  private static instance: Settings = new Settings();

  private constructor() {}

  public getInstance(): Settings {
    return Settings.instance;
  }
}
