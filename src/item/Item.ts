/**
 * Carryable by Units
 */
export interface Item {
  update: (delta: number) => void;

  useItem: () => ItemEvent;
}
