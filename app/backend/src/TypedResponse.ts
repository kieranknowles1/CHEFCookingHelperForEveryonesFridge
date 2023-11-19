import type express from 'express'
import type { ValidationError } from 'express-validator'

/**
 * Strongly typed response for `express`
 * Based on https://plainenglish.io/blog/typed-express-request-and-response-with-typescript
 */
export default interface TypedResponse<TBody> extends express.Response {
  json: (body: TBody | { errors: ValidationError[] }) => this
}
