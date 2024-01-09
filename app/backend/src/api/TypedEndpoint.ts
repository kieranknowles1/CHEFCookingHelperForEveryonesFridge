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

export interface TypedRequest<
  endpoint extends JsonEndpointWithParameters
> extends express.Request {
  // Path parameters are NOT converted to numbers, hooray for consistency!
  params: Record<keyof endpoint['parameters']['path'], string>
  // NOTE: Optional parameters are typed as possibly undefined, even if default is provided
  query: Exclude<endpoint['parameters']['query'], undefined>
}

/**
 * Strongly typed response for `express`
 * Based on https://plainenglish.io/blog/typed-express-request-and-response-with-typescript
 */
export interface TypedResponse<
  endpoint extends JsonEndpoint,
  code extends KeysOfType<endpoint['responses'], JsonResponse>
> extends express.Response {
  json: (body: endpoint['responses'][code]['content']['application/json']) => this
}
