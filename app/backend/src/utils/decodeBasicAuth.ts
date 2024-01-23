import { BadRequest } from 'express-openapi-validator/dist/openapi.validator'

export interface BasicAuth {
  username: string
  // The plaintext password, MUST be hashed before storing
  password: string
}

function throwInvalidHeader (): never {
  throw new BadRequest({ path: 'header', message: 'Invalid Authorization header' })
}

/**
 * Decode a basic auth header
 * @param {string} header The header to decode
 * @returns {BasicAuth} The decoded header.
 * @throws {BadRequest} If the header is not correctly formatted
 */
export default function decodeBasicAuth (header: string): BasicAuth {
  const [type, encoded] = header.split(' ')
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

  return { username, password }
}
