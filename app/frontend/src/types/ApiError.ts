import { type components } from './api.generated'

type ErrorList = components['schemas']['ErrorList']

export class ApiError extends Error {
  public readonly errors: ErrorList
  public readonly code: number

  constructor (errors: ErrorList) {
    super(errors.errors[0].message)
    this.name = ApiError.name
    this.errors = errors
    this.code = errors.status
  }
}
