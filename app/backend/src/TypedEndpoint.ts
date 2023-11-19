import type express from 'express'
import type { ValidationError } from 'express-validator'

/**
 * Strongly typed request for `express`
 * Based on https://plainenglish.io/blog/typed-express-request-and-response-with-typescript
 *
 * Note that this can not and does not validate the request. `express-validator` must be used instead.
 */
export interface TypedRequest<TQuery extends Record<string, string> | undefined, TParams extends Record<string, string> | undefined, TBody> extends Express.Request {
  body: TBody
  params: TParams
  query: TQuery
}

/**
 * Strongly typed response for `express`
 * Based on https://plainenglish.io/blog/typed-express-request-and-response-with-typescript
 */
export interface TypedResponse<TBody> extends express.Response {
  json: (body: TBody | { errors: ValidationError[] }) => this
}
