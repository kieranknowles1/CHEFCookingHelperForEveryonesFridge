import fs from 'fs'

import * as OpenApiValidator from 'express-openapi-validator'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'

import type IChefDatabase from './database/IChefDatabase'
import constants from './constants'
import getApiSpec from './getApiSpec'
import logger from './logger'
import registerEndpoints from './api/registerEndpoints'

export interface CreateAppOptions {
  /**
   * Whether to validate responses against the OpenAPI spec.
   * This may result in a performance hit. Should always be true during development and testing.
   * @default false
   */
  validateResponses?: boolean
}

/**
 * Create an Express application, register all of its endpoints, and enable validation against the OpenAPI spec.
 * Does not start listening.
 */
export default function createApp (db: IChefDatabase, options?: CreateAppOptions): express.Express {
  const app = express()
  // Set the needed headers for browsers to allow cross-origin requests
  app.use(cors())

  // Parse the body of requests as JSON
  app.use(bodyParser.json())

  const specText = fs.readFileSync(constants.API_SPEC_PATH, 'utf8')
  const spec = getApiSpec(specText)

  // Host the API spec
  app.use('/api-docs/v1', swaggerUi.serve, swaggerUi.setup(spec))
  // Validate requests and responses against the API spec
  logger.info(`Validating against API spec at ${constants.API_SPEC_PATH}`)
  app.use(OpenApiValidator.middleware({
    apiSpec: constants.API_SPEC_PATH,
    validateRequests: true,
    validateResponses: options?.validateResponses ?? false
  }))

  logger.info('Registering endpoints.')
  registerEndpoints(app, db)

  return app
}
