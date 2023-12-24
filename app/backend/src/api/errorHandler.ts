import { type NextFunction, type Request, type Response } from 'express'

import CodedError from '../CodedError'
import { type components } from '../types/api.generated'
import { logError } from '../logger'

type ErrorList = components['schemas']['ErrorList']

/**
 * Middleware to handle errors thrown by endpoints.
 * CodedErrors are returned to the user with the appropriate status code.
 * Other errors are logged and return a 500 error.
 *
 * Must be placed after all endpoints.
 */
export default function errorHandler (err: Error, req: Request, res: Response, next: NextFunction): void {
  const code = err instanceof CodedError ? err.code : 500

  // Only log internal server errors. Other errors are considered to be the user's fault.
  if (code === 500) {
    logError(err)
  }

  // This isn't an endpoint, so we can't use TypedResponse
  const response: ErrorList = {
    message: err.message,
    errors: [{
      message: err.message,
      name: err.name,
      code
    }]
  }

  res.status(code).json(response)
}
