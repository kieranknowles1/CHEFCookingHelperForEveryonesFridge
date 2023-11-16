/**
 * Get the groups from `match`, or throw an `Error` if there are none.
 */
export function getGroups (match: RegExpMatchArray): Record<string, string> {
  if (match.groups === undefined) {
    throw new Error('Match has no groups')
  }
  return match.groups
}
