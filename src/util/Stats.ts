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

  public static incrementStat(key: string, incrNumber?: number) {
    const oldNumber = Stats.instance.statsMap.get(key) || 0;

    incrNumber ??= 1;

    Stats.instance.statsMap.set(key, oldNumber + incrNumber);
  }

  public static getStatsMap() {
    return Stats.instance.statsMap;
  }
}
