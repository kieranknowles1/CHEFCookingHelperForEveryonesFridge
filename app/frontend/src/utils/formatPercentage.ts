/**
 * Format a number between 0 and 1 as a percentage.
 */
export default function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}
