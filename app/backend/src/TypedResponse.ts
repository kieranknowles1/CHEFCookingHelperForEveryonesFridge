import type express from 'express'

/**
 * Strongly typed response for `express`
 * Based on https://plainenglish.io/blog/typed-express-request-and-response-with-typescript
 */
export default interface TypedResponse<TBody> extends express.Response {
  json: (body: TBody) => this
}
