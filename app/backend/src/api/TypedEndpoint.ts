import type express from 'express'

// https://stackoverflow.com/questions/62410684/constrain-keys-using-value-type
// TODO: Reference list, use separate file
type KeysOfType<T, P> = { [K in keyof T]: P extends T[K] ? K : never }[keyof T]

// JSON schema in either a POST body or a response
interface JsonData {
  content: {
    'application/json': any
  }
}

interface JsonEndpoint {
  // NOTE: Key is a string, despite being represented like a number
  responses: Record<string, JsonData>
}

export interface JsonEndpointWithParameters extends JsonEndpoint {
  parameters: {
    query?: Record<string, any>
    path?: Record<string, any>
  }
  requestBody?: JsonData
}

export interface TypedRequest<
  endpoint extends JsonEndpointWithParameters
> extends express.Request {
  // Path parameters are NOT converted to numbers, hooray for consistency!
  params: Record<keyof endpoint['parameters']['path'], string>
  // NOTE: Optional parameters are typed as possibly undefined, even if default is provided
  query: Exclude<endpoint['parameters']['query'], undefined>
  // NOTE: This currently only works if the body is mandatory
  body: endpoint['requestBody'] extends JsonData
    ? endpoint['requestBody']['content']['application/json']
    : never
}

/**
 * Strongly typed response for `express`
 * Based on https://plainenglish.io/blog/typed-express-request-and-response-with-typescript
 *
 * @template Endpoint The endpoint type, from the generated API at `src/types/api.generated.ts`
 *
 * @example
 * // Endpoint with a single response code. Use TypedResponse<endpoint, code>
 * app.get('/api/v1/getstuff', (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
 *  res.json({ stuff: 'stuff' })
 * })
 *
 * @example
 * // Endpoint with multiple response codes. Use an intersection type of multiple TypedResponse<endpoint, code>
 * // The type checker will consider res.json() to be overloaded with all the possible response codes
 * // NOTE: The response code is not checked at compile time, only the type of the response body. Make sure to use the correct response code or express-openapi-validator will complain.
 * app.get('/api/v1/getstuff', (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200> & TypedResponse<endpoint, 401>) => {
 * if (checkAuth(req)) {
 *  res.json({ stuff: 'stuff' })
 * } else {
 *  res.status(401).json({ error: 'Unauthorized' })
 * }
 */
export interface TypedResponse<
  Endpoint extends JsonEndpoint,
  Code extends KeysOfType<Endpoint['responses'], JsonData>,
> extends express.Response {
  json: (body: Endpoint['responses'][Code]['content']['application/json']) => this
}
