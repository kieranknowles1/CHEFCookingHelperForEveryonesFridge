import CodedError from '../CodedError'

export default class NotFoundError extends CodedError {
  public readonly code = 404
  public readonly name = 'NotFoundError'
  constructor () {
    super('The requested endpoint does not exist.')
  }
}
