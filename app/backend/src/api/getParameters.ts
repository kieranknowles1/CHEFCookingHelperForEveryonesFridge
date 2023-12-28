import { type Request } from 'express'

import { type EndpointParameters, type JsonEndpointWithParameters } from './TypedEndpoint'

// FIXME: This doesn't work with optional parameters
type MatchedData<endpoint extends JsonEndpointWithParameters> = Record<keyof EndpointParameters<endpoint>, string>

/** Function to convert an endpoint's parameters into the expected types */
export type ParameterConverter<endpoint extends JsonEndpointWithParameters> = (matched: MatchedData<endpoint>) => EndpointParameters<endpoint>

/**
 * Function to get strongly typed parameters from the matched data that was validated using `express-openapi-validator`.
 *
 * Use `checkParameters` as middleware to validate that the data exists in the expected format.
 *
 * NOTE: Parameters will be strings, even if matched against other types
 *
 * @deprecated Use express-openapi-validator instead
 */
export default function getParameters<endpoint extends JsonEndpointWithParameters> (req: Request, converter: ParameterConverter<endpoint>): EndpointParameters<endpoint> {
  return converter(req.params as MatchedData<endpoint>)
}
