import fs from 'fs'

import * as OpenApiValidator from 'express-openapi-validator'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'

import logger, { createDefaultLogger, setLogger } from './logger'
import ChefDatabaseImpl from './database/ChefDatabaseImpl'
import SqliteConnection from './database/SqliteConnection'
import constants from './constants'
import environment from './environment'
import getApiSpec from './getApiSpec'
import { preloadModel } from './ml/getModel'
import registerEndpoints from './api/registerEndpoints'

setLogger(createDefaultLogger(environment.RUNTIME_LOG_FILE))

const db = new ChefDatabaseImpl(new SqliteConnection(environment.DATABASE_PATH))

logger.info('Sanity checking database.')
// Make sure the database is in a good state.
try {
  db.checkIntegrity()
} catch (err) {
  logger.error('Database integrity check failed. Please analyse the logged error. Endpoints may fail or return incorrect data.')
  logger.caughtError(err)
}

// Get the model ready for when a ML endpoint is called
preloadModel().catch((err) => {
  logger.error('Failed to preload model. ML endpoints will not work.')
  logger.error('Will retry when the model is next requested.')
  logger.caughtError(err)
})

const app = express()
app.use(cors())
app.use(bodyParser.json())

const specText = fs.readFileSync(constants.API_SPEC_PATH, 'utf8')
const spec = getApiSpec(specText)
app.use('/api-docs/v1', swaggerUi.serve, swaggerUi.setup(spec))

logger.info(`Validating against API spec at ${constants.API_SPEC_PATH}`)
app.use(OpenApiValidator.middleware({
  apiSpec: constants.API_SPEC_PATH,
  validateRequests: true,
  validateResponses: true
}))

logger.info('Registering endpoints.')
registerEndpoints(app, db)

app.listen(environment.PORT, () => {
  logger.info(`Backend listening on http://localhost:${environment.PORT}`)
})
