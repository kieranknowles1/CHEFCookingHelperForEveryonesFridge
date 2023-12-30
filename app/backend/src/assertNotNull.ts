/**
 * Asserts that the given value is not null or undefined.
 */
export default function assertNotNull<T> (value: T | null | undefined): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error('Value was null or undefined')
  }
}
