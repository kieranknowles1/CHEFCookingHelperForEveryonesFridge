import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'

import errorHandler from './api/errorHandler'
import installBarcodeEndpoint from './api/v1/barcode/barcode'
import installFridgeAvailableRecipeEndpoint from './api/v1/fridge/recipe/available'
import installFridgeIngredientAllAmountEndpoint from './api/v1/fridge/ingredient/all/amount'
import installFridgeIngredientEndpoint from './api/v1/fridge/ingredient/amount'
import installIngredientAllEndpoint from './api/v1/ingredient/all'
import installRecipeEndpoint from './api/v1/recipe/recipe'
import installSimilarRecipeEndpoint from './api/v1/recipe/similar'
import logger from './logger'
import { preloadModel } from './ml/getModel'

const app = express()

// TODO: Use env variable
const PORT = 3000

// TODO: Serve spec file using swagger-ui-express
// TODO: OpenApiValidator middleware

app.use(bodyParser.json())
app.use(cors())

installBarcodeEndpoint(app)
installFridgeAvailableRecipeEndpoint(app)
installFridgeIngredientAllAmountEndpoint(app)
installFridgeIngredientEndpoint(app)
installIngredientAllEndpoint(app)
installRecipeEndpoint(app)
installSimilarRecipeEndpoint(app)

app.use(errorHandler)

app.listen(PORT, () => {
  logger.info(`Backend listening on http://localhost:${PORT}`)
})

preloadModel()
