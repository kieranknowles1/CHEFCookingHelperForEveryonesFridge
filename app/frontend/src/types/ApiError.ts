import { type components } from './api.generated'

type ErrorList = components['schemas']['ErrorList']

export class ApiError extends Error {
  public readonly errors: ErrorList

  constructor (errors: ErrorList) {
    super(errors.errors[0].message)
    this.name = ApiError.name
    this.errors = errors
  }
}
