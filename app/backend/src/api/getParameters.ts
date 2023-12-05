import { type Request } from 'express'
import { matchedData } from 'express-validator'

import { type EndpointParameters, type JsonEndpointWithParameters } from './TypedEndpoint'

type MatchedData<endpoint extends JsonEndpointWithParameters> = Record<keyof EndpointParameters<endpoint>, string>

/**
 * Function to get strongly typed parameters from the matched data that was validated using `express-validator`.
 *
 * Use `checkParameters` as middleware to validate that the data exists in the expected format.
 *
 * NOTE: Parameters will be strings, even if matched against other types
 * // FIXME: Returning `any` as matchedData doesn't work how I thought it did. It keeps matched numbers as strings
 */
export default function getParameters<endpoint extends JsonEndpointWithParameters> (req: Request): any {
  return matchedData(req) as MatchedData<endpoint>
}
