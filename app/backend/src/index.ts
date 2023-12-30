import { readFileSync } from 'fs'

import * as OpenApiValidator from 'express-openapi-validator'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'

import { API_SPEC_PATH, DATABASE_PATH, PORT } from './settings'
import logger, { logError } from './logger'
import ChefDatabaseImpl from './database/ChefDatabaseImpl'
import errorHandler from './api/errorHandler'
import getApiSpec from './getApiSpec'
import installBarcodeEndpoint from './api/v1/barcode/barcode'
import installFridgeAvailableRecipeEndpoint from './api/v1/fridge/recipe/available'
import installFridgeIngredientAllAmountEndpoint from './api/v1/fridge/ingredient/all/amount'
import installFridgeIngredientEndpoint from './api/v1/fridge/ingredient/amount'
import installIngredientAllEndpoint from './api/v1/ingredient/all'
import installRecipeEndpoint from './api/v1/recipe/recipe'
import installSimilarRecipeEndpoint from './api/v1/recipe/similar'
import notFoundHandler from './api/notFoundHandler'
import { preloadModel } from './ml/getModel'

const db = new ChefDatabaseImpl(DATABASE_PATH)

logger.info('Sanity checking database.')
// Make sure the database is in a good state.
try {
  db.checkIntegrity()
} catch (err) {
  logger.error('Database integrity check failed. Please analyse the logged error. Endpoints may fail or return incorrect data.')
  logError(err)
}

// Get the model ready for when a ML endpoint is called
preloadModel().catch((err) => {
  logger.error('Failed to preload model. ML endpoints will not work.')
  logError(err)
})

const app = express()
app.use(cors())

const specText = readFileSync(API_SPEC_PATH, 'utf8')
const spec = getApiSpec(specText)
app.use('/api-docs/v1', swaggerUi.serve, swaggerUi.setup(spec))

logger.info(`Validating against API spec at ${API_SPEC_PATH}`)
app.use(OpenApiValidator.middleware({
  apiSpec: API_SPEC_PATH,
  validateRequests: true,
  validateResponses: true
}))

app.use(bodyParser.json())

logger.info('Registering endpoints.')
installBarcodeEndpoint(app, db)
installFridgeAvailableRecipeEndpoint(app, db)
installFridgeIngredientAllAmountEndpoint(app, db)
installFridgeIngredientEndpoint(app, db)
installIngredientAllEndpoint(app, db)
installRecipeEndpoint(app, db)
installSimilarRecipeEndpoint(app, db)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Backend listening on http://localhost:${PORT}`)
})
