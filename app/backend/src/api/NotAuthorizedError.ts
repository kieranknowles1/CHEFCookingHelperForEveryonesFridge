import CodedError from '../CodedError'

export default class NotAuthorizedError extends CodedError {
  public readonly code = 401
  public readonly name = 'NotAuthorizedError'
}
