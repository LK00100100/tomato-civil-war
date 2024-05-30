/**
 * singleton of stats
 */
export class Stats {
  private statsMap: Map<string, number>;

  private static instance: Stats = new Stats();

  private constructor() {
    this.statsMap = new Map();
  }

  public getInstance(): Stats {
    return Stats.instance;
  }

  public static incrementStat(key: string, incrNumber = 1) {
    const oldNumber = Stats.instance.statsMap.get(key) || 0;

    Stats.instance.statsMap.set(key, oldNumber + incrNumber);
  }

  /**
   *
   * @param key
   * @param setNumber sets the key to this number. Defaults to 0
   */
  public static setStat(key: string, setNumber = 0) {
    Stats.instance.statsMap.set(key, setNumber);
  }

  public static getStatsMap() {
    return Stats.instance.statsMap;
  }
}
