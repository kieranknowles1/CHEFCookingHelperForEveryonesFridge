import { type ValidationError } from 'express-validator'
import type express from 'express'

// https://stackoverflow.com/questions/62410684/constrain-keys-using-value-type
// TODO: Reference list, use separate file
type KeysOfType<T, P> = { [K in keyof T]: P extends T[K] ? K : never }[keyof T]

interface JsonResponse {
  content: {
    'application/json': any
  }
}

interface JsonEndpoint {
  // NOTE: Key is a string, despite being represented like a number
  responses: Record<string, JsonResponse>
}

export interface JsonEndpointWithParameters extends JsonEndpoint {
  parameters: {
    query?: Record<string, any>
    path?: Record<string, any>
    body?: Record<string, any>
  }
}

/**
 * Combine all query, path, and body parameters as returned by `matchedData`
 */
export type EndpointParameters<
  endpoint extends JsonEndpointWithParameters
> = endpoint['parameters']['query'] & endpoint['parameters']['path'] & endpoint['parameters']['body']

/**
 * Strongly typed response for `express`
 * Based on https://plainenglish.io/blog/typed-express-request-and-response-with-typescript
 */
export interface TypedResponse<
  endpoint extends JsonEndpoint,
  code extends KeysOfType<endpoint['responses'], JsonResponse>
> extends express.Response {
  json: (body: endpoint['responses'][code]['content']['application/json'] | { errors: ValidationError[] }) => this
}
