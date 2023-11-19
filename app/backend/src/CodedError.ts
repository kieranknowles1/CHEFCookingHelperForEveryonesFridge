/**
 * Error that has a response code attached to it
 */
export default abstract class CodedError extends Error {
  abstract get code (): number
}
