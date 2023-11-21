import express, { type NextFunction } from 'express'
import bodyParser from 'body-parser'

import CodedError from './CodedError'
import installAvailableRecipeEndpoint from './api/v1/fridge/recipe/available'
import installIngredientAllAmountEndpoint from './api/v1/fridge/ingredient/all/amount'
import installIngredientEndpoint from './api/v1/fridge/ingredient/amount'
import installRecipeEndpoint from './api/v1/recipe/recipe'

const app = express()

// TODO: Use env variable
const PORT = 3000

app.use(bodyParser.json())

installAvailableRecipeEndpoint(app)
installIngredientAllAmountEndpoint(app)
installIngredientEndpoint(app)
installRecipeEndpoint(app)

app.use((err: Error, req: express.Request, res: express.Response, next: NextFunction) => {
  const code = err instanceof CodedError ? err.code : 500

  res.status(code).json({
    errors: {
      message: err.message,
      name: err.name
    }
  })
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
