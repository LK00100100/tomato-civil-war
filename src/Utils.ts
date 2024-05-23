/**
 * Various Utils
 */
export class Utils {
  /**
   * Roll a dice.
   * func(3) => 0, 1, or 2.
   * @param max exclusive max.
   */
  public static rollDiceExclusive(max: number) {
    return Math.floor(Math.random() * max);
  }

  /**
   * Get decimal number from 0 to max (exclusive).
   * @param max exclusive max
   * @returns
   */
  public static rollRandomExclusive(max: number) {
    return Math.random() * max;
  }
}
