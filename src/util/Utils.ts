/**
 * Various Utils
 */
export class Utils {

  /**
   * @returns either returns true or false
   */
  public static flipCoin() {
    return Utils.rollDiceExclusive(1) == 0;
  }

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

  /**
   * Get decimal number from 0 to max (exclusive).
   * 50% chance of being negative
   * @param max exclusive max
   * @returns
   */
  public static rollRandomExclusiveNegative(max: number) {
    let x = Math.random() * max;
    return this.rollDiceExclusive(2) == 0 ? x * -1 : x;
  }
}
