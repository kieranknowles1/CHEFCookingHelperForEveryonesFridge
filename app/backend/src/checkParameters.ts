import { type NextFunction, type Request, type Response } from 'express'
import { validationResult } from 'express-validator'

/**
 * Middleware function that checks the types of the paremeters,
 * extracts their values, and either forwards to the next function
 * or errors with `400` if they are invalid.
 * Use after validation chains
 */
export default function checkParameters (req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })
  } else {
    next()
  }
}
