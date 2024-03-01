import { type JsonObject } from 'swagger-ui-express'

/**
 * Checks if the given value is a JSON object
 * JsonObject is defined as an object with every key being a string
 */
export function isJsonObject (value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
