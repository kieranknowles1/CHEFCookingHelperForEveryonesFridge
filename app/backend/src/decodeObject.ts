import type * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either'

/**
 * Decode a io-ts object, throwing an error if it fails
 */
export default function decodeObject<T extends t.Any> (codec: T, input: unknown): t.TypeOf<T> {
  const result = codec.decode(input)
  if (isLeft(result)) {
    throw new Error(`Invalid object: ${JSON.stringify(result.left)}`)
  }
  return result.right
}
