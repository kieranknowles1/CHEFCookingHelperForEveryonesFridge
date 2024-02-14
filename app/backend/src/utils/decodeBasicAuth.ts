import { error } from 'express-openapi-validator'

import constants from '../constants'

export interface BasicAuth {
  username: string
  // The plaintext password, MUST be hashed before storing
  password: string
}

function throwInvalidHeader (): never {
  throw new error.Unauthorized({ path: 'header', message: 'Invalid Authorization header' })
}

/**
 * Decode a basic auth header
 * @param {string} header The header to decode
 * @returns {BasicAuth} The decoded header.
 * @throws {BadRequest} If the header is not correctly formatted
 */
export default function decodeBasicAuth (header: string): BasicAuth {
  const [type, encoded] = header.split(' ')
  // openapi-validator should catch this, but just in case
  if (type !== 'Basic') {
    throwInvalidHeader()
  }

  const decoded = Buffer.from(encoded, 'base64').toString('utf-8')

  // Username cannot contain a colon, but password can.
  // Take everything before the first colon as the username, and everything after as the password
  // https://www.ietf.org/rfc/rfc2617.txt
  const colon = decoded.indexOf(':')
  if (colon === -1) {
    throwInvalidHeader()
  }

  const username = decoded.substring(0, colon)
  const password = decoded.substring(colon + 1)

  const byteLength = Buffer.byteLength(password, 'utf-8')

  if (byteLength > constants.MAX_PASSWORD_BYTES) {
    throw new error.BadRequest({ path: 'header', message: 'Password too long' })
  }

  return { username, password }
}
