import { type Request } from 'express'
import { matchedData } from 'express-validator'

import { type EndpointParameters, type JsonEndpointWithParameters } from './TypedEndpoint'

export default function getParameters<endpoint extends JsonEndpointWithParameters> (req: Request): EndpointParameters<endpoint> {
  return matchedData(req) as EndpointParameters<endpoint>
}
