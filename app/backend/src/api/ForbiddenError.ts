import CodedError from '../CodedError'

export default class ForbiddenError extends CodedError {
  public readonly code = 403
  public readonly name = 'ForbiddenError'
  public constructor () {
    super('You are not authorized to access this resource')
  }
}
