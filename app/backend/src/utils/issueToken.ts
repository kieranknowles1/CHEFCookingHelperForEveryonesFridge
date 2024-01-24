import jwt, { type JwtPayload } from 'jsonwebtoken'

import constants from '../constants'
import environment from '../environment'

/**
 * Issue a JWT for the given user ID.
 * Does not check that the user ID or any credentials are valid.
 */
export default function issueToken (userId: number): string {
  // Date.now() returns milliseconds, but JWT expects seconds
  const nowSeconds = Math.floor(Date.now() / 1000)
  const rawToken: JwtPayload = {
    iat: nowSeconds,
    nbf: nowSeconds,
    exp: nowSeconds + environment.TOKEN_VALIDITY,
    iss: 'chef-backend',
    sub: userId.toString()
  }
  return jwt.sign(rawToken, environment.SECRET, {
    algorithm: constants.JWT_ALGORITHM
  })
}
