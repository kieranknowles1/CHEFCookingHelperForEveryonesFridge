import fs from 'fs'

import { type JsonObject } from 'swagger-ui-express'
import yaml from 'yaml'

import { isJsonObject } from './types/isJsonObject'

/**
 * Get the specification for the API.
 */
export default function getApiSpec (path: string): JsonObject {
  const fileData = fs.readFileSync(path, 'utf8')
  const spec = yaml.parse(fileData)

  if (!isJsonObject(spec)) {
    throw new Error(`API spec at ${path} is not the expected format.`)
  }

  return spec
}
