/**
 * Format a Date object to a short date string in the user's locale
 */
export default function formatShortDate (date: Date): string {
  return date.toLocaleDateString(/* user locale */ undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
