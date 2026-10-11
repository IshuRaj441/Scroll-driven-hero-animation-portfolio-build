/**
 * Impact metrics shown in the hero.
 *
 * These are PLACEHOLDERS — replace the numbers and copy with real figures before
 * publishing. The UI reads exclusively from this file so content stays editable in
 * one place.
 */
export type Stat = {
  /** Numeric target the count-up animates toward. Rendered as `${value}%`. */
  readonly value: number;
  /** Short, factual description shown beside the figure. */
  readonly label: string;
};

export const stats: readonly Stat[] = [
  { value: 92, label: "Faster first render" },
  { value: 58, label: "More scroll engagement" },
  { value: 34, label: "Lower drop-off rate" },
  { value: 71, label: "Higher conversion" },
];
