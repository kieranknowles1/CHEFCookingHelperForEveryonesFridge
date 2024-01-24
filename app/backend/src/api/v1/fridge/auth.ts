import { type Request, expressjwt } from 'express-jwt'
import { type Express } from 'express'

import ForbiddenError from '../../ForbiddenError'
import type IChefDatabase from '../../../database/IChefDatabase'
import NotAuthorizedError from '../../NotAuthorizedError'
import jwtOptions from '../jwtOptions'

/**
 * Require authentication for all fridge routes
 */
export default function registerFridgeAuthMiddleware (app: Express, db: IChefDatabase): void {
  // Require authentication for all fridge routes
  // This middleware is executed before the endpoint for all routes starting with /api/v1/fridge
  app.use('/api/v1/fridge/:fridgeId',
    // Make sure the token is valid
    // eslint complains about jwt returning a promise, but everything works fine regardless
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    expressjwt(jwtOptions),
    // Check that the user ID in the token can access the requested fridge
    (req: Request, _, next) => {
      if (req.auth?.sub === undefined) {
        throw new NotAuthorizedError()
      }

      const tokenSubject = Number.parseInt(req.auth.sub)
      const requested = Number.parseInt(req.params.fridgeId)

      const hasAccess = db.users.hasFridgeAccess(tokenSubject, requested)

      if (hasAccess) {
        next()
      } else {
        throw new ForbiddenError()
      }
    })
}
