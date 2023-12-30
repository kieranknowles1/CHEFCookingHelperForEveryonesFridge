import fs from 'fs'

import * as OpenApiValidator from 'express-openapi-validator'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yaml'

import logger, { logError } from './logger'
import errorHandler from './api/errorHandler'
import getDatabase from './database/getDatabase'
import installBarcodeEndpoint from './api/v1/barcode/barcode'
import installFridgeAvailableRecipeEndpoint from './api/v1/fridge/recipe/available'
import installFridgeIngredientAllAmountEndpoint from './api/v1/fridge/ingredient/all/amount'
import installFridgeIngredientEndpoint from './api/v1/fridge/ingredient/amount'
import installIngredientAllEndpoint from './api/v1/ingredient/all'
import installRecipeEndpoint from './api/v1/recipe/recipe'
import installSimilarRecipeEndpoint from './api/v1/recipe/similar'
import { isJsonObject } from './types/isJsonObject'
import notFoundHandler from './api/notFoundHandler'
import { preloadModel } from './ml/getModel'

const app = express()

// TODO: Use env variable
const PORT = 3000

const API_SPEC_PATH = './api.yml'

app.use(cors())

const spec = yaml.parse(fs.readFileSync(API_SPEC_PATH, 'utf8'))
if (!isJsonObject(spec)) {
  throw new Error(`API spec at ${API_SPEC_PATH} is not the expected format.`)
}
app.use('/api-docs/v1', swaggerUi.serve, swaggerUi.setup(spec))

logger.info(`Validating against API spec at ${API_SPEC_PATH}`)
app.use(OpenApiValidator.middleware({
  apiSpec: API_SPEC_PATH,
  validateRequests: true,
  // Using TypedResponse as validateResponses is a bit overzealous
  validateResponses: true
}))

app.use(bodyParser.json())

installBarcodeEndpoint(app)
installFridgeAvailableRecipeEndpoint(app)
installFridgeIngredientAllAmountEndpoint(app)
installFridgeIngredientEndpoint(app)
installIngredientAllEndpoint(app)
installRecipeEndpoint(app)
installSimilarRecipeEndpoint(app)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Backend listening on http://localhost:${PORT}`)
})

// Get the model ready for when a ML endpoint is called
preloadModel().catch((err) => {
  logger.error('Failed to preload model. ML endpoints will not work.')
  logError(err)
})

// Make sure the database is in a good state.
try {
  getDatabase().checkIntegrity()
} catch (err) {
  logger.error('Database integrity check failed. Please analyse the logged error. Endpoints may fail or return incorrect data.')
  logError(err)
}
