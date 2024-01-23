import { type Request, expressjwt } from 'express-jwt'
import { type Express } from 'express'

import ForbiddenError from '../../ForbiddenError'
import jwtOptions from '../jwtOptions'

/**
 * Require authentication for all user routes
 */
export default function registerUserAuthMiddleware (app: Express): void {
  // Require authentication for all user routes
  // This middleware is executed before the endpoint for all routes starting with /api/v1/user
  // Does not check if the user exists, if a token is somehow obtained for a non-existent user, the endpoint will still be executed
  app.use('/api/v1/user/:userId',
    // Make sure the token is valid
    // eslint complains about jwt returning a promise, but everything works fine regardless
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    expressjwt(jwtOptions),
    // Check that the user ID in the token matches the requested user ID
    (req: Request, _, next) => {
      const tokenSubject = req.auth?.sub
      const requested = req.params.userId

      if (tokenSubject === requested) {
        next()
      } else {
        throw new ForbiddenError()
      }
    })
}
