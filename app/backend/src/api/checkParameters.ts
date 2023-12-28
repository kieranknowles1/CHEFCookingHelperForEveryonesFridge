import { type NextFunction, type Request, type Response } from 'express'
import { validationResult } from 'express-validator'

import { type components } from '../types/api.generated'

type ErrorList = components['schemas']['ErrorList']

/**
 * Middleware function that checks the types of the paremeters,
 * extracts their values, and either forwards to the next function
 * or errors with `400` if they are invalid.
 * Use after validation chains
 *
 * @deprecated Use express-openapi-validator instead
 * DO NOT USE. This exists only to make things compile and most likely does not work
 */
export default function checkParameters (req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const response: ErrorList = {
      path: req.path,
      status: 400,
      errors: errors.array().map(err => ({
        message: err.msg,
        path: 'InvalidParameter',
        errorCode: '400'
      }))
    }
    res.status(400).json(response)
  } else {
    next()
  }
}
