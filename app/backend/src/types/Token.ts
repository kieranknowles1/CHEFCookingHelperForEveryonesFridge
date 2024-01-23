import * as t from 'io-ts'

/**
 * Decoded payload of a JWT token
 */
export default t.type({
  iat: t.number,
  nbf: t.number,
  exp: t.number,
  iss: t.string,
  sub: t.number
})
