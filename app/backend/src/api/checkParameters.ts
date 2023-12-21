import { type NextFunction, type Request, type Response } from 'express'
import { validationResult } from 'express-validator'

import { type components } from '../types/api.generated'

type ErrorList = components['schemas']['ErrorList']

/**
 * Middleware function that checks the types of the paremeters,
 * extracts their values, and either forwards to the next function
 * or errors with `400` if they are invalid.
 * Use after validation chains
 */
export default function checkParameters (req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const response: ErrorList = {
      message: 'Invalid parameters',
      errors: errors.array().map(err => ({
        message: err.msg,
        name: 'InvalidParameter',
        code: 400
      }))
    }
    res.status(400).json(response)
  } else {
    next()
  }
}
