import { type NextFunction, type Request, type Response } from 'express'
import { HttpError } from 'express-openapi-validator/dist/framework/types'
import { error } from 'express-openapi-validator'

import CodedError from '../CodedError'
import { type components } from '../types/api.generated'
import logger from '../logger'

type ErrorList = components['schemas']['ErrorList']

function getResponseCode (err: Error): number {
  if (err instanceof CodedError) {
    return err.code
  } else if (err instanceof error.BadRequest) {
    return err.status
  } else {
    return 500
  }
}

/**
 * Middleware to handle errors thrown by endpoints.
 * CodedErrors are returned to the user with the appropriate status code.
 * Other errors are logged and return a 500 error.
 *
 * Must be placed after all endpoints.
 */
export default function errorHandler (err: Error, req: Request, res: Response, next: NextFunction): void {
  const code = getResponseCode(err)

  // Only log internal server errors. Other errors are considered to be the user's fault.
  if (code === 500) {
    logger.caughtError(err)
  }

  let errors: ErrorList['errors']
  if (err instanceof HttpError) {
    errors = err.errors
  } else {
    errors = [{
      message: err.message,
      path: err.name,
      errorCode: code.toString()
    }]
  }

  // This isn't an endpoint, so we can't use TypedResponse
  const response: ErrorList = {
    path: req.path,
    status: code,
    errors
  }

  res.status(code).json(response)
}
