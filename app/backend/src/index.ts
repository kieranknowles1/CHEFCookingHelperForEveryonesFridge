import express, { type NextFunction } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import logger, { LogLevel, logError } from './logger'
import CodedError from './CodedError'
import installBarcodeEndpoint from './api/v1/barcode/barcode'
import installFridgeAvailableRecipeEndpoint from './api/v1/fridge/recipe/available'
import installFridgeIngredientAllAmountEndpoint from './api/v1/fridge/ingredient/all/amount'
import installFridgeIngredientEndpoint from './api/v1/fridge/ingredient/amount'
import installIngredientAllEndpoint from './api/v1/ingredient/all'
import installRecipeEndpoint from './api/v1/recipe/recipe'

const app = express()

// TODO: Use env variable
const PORT = 3000

app.use(bodyParser.json())
app.use(cors())

installBarcodeEndpoint(app)
installFridgeAvailableRecipeEndpoint(app)
installFridgeIngredientAllAmountEndpoint(app)
installFridgeIngredientEndpoint(app)
installIngredientAllEndpoint(app)
installRecipeEndpoint(app)

app.use((err: Error, req: express.Request, res: express.Response, next: NextFunction) => {
  const code = err instanceof CodedError ? err.code : 500

  if (code === 500) {
    logError(err)
  }

  res.status(code).json({
    errors: {
      message: err.message,
      name: err.name
    }
  })
})

app.listen(PORT, () => {
  logger.log(LogLevel.info, `Backend listening on http://localhost:${PORT}`)
})
