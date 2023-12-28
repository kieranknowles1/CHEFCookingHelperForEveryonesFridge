import { type NextFunction, type Request, type Response } from 'express'

import { type components } from '../types/api.generated'

type ErrorList = components['schemas']['ErrorList']

/**
 * Middleware to handle 404 errors.
 * Must be placed after all endpoints.
 */
export default function notFoundHandler (req: Request, res: Response, next: NextFunction): void {
  const response: ErrorList = {
    message: 'The requested endpoint does not exist.',
    errors: [{
      code: 404,
      message: 'The requested endpoint does not exist.',
      name: 'NotFound'
    }]
  }

  res.status(404).json(response)
}
