import { type JsonObject } from 'swagger-ui-express'
import yaml from 'yaml'

import { isJsonObject } from './types/isJsonObject'

/**
 * Get the specification for the API.
 */
export default function getApiSpec (data: string): JsonObject {
  const spec = yaml.parse(data)

  if (!isJsonObject(spec)) {
    throw new Error('API spec is not a JSON object.')
  }

  return spec
}
