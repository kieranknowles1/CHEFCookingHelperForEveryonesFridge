import { type NextFunction, type Request, type Response } from 'express'

import NotFoundError from './NotFoundError'

/**
 * Middleware to handle 404 errors.
 * Must be placed after all endpoints.
 */
export default function notFoundHandler (req: Request, res: Response, next: NextFunction): void {
  throw new NotFoundError()
}
