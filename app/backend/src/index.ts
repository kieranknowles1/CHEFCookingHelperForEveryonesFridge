import express, { type NextFunction, type Request, type Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import logger, { logError } from './logger'
import CodedError from './CodedError'
import { type components } from './types/api.generated'
import installBarcodeEndpoint from './api/v1/barcode/barcode'
import installFridgeAvailableRecipeEndpoint from './api/v1/fridge/recipe/available'
import installFridgeIngredientAllAmountEndpoint from './api/v1/fridge/ingredient/all/amount'
import installFridgeIngredientEndpoint from './api/v1/fridge/ingredient/amount'
import installIngredientAllEndpoint from './api/v1/ingredient/all'
import installRecipeEndpoint from './api/v1/recipe/recipe'
import installSimilarRecipeEndpoint from './api/v1/recipe/similar'
import { preloadModel } from './ml/getModel'

type ErrorList = components['schemas']['ErrorList']

preloadModel()

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

// Error handling middleware. Must be placed after all endpoints.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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
})

app.listen(PORT, () => {
  logger.info(`Backend listening on http://localhost:${PORT}`)
})
