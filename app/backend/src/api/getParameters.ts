import { type Request } from 'express'
import { matchedData } from 'express-validator'

import { type EndpointParameters, type JsonEndpointWithParameters } from './TypedEndpoint'

/**
 * Function to get strongly typed parameters from the matched data that was validated using `express-validator`.
 *
 * Use `checkParameters` as middleware to validate that the data exists in the expected format.
 */
export default function getParameters<endpoint extends JsonEndpointWithParameters> (req: Request): EndpointParameters<endpoint> {
  return matchedData(req) as EndpointParameters<endpoint>
}
