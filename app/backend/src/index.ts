import express, { type NextFunction } from 'express'
import bodyParser from 'body-parser'

import type { TypedResponse } from './TypedEndpoint'
import installRecipeEndpoint from './api/v1/recipe/recipe'
import installIngredientEndpoint from './api/v1/fridge/ingredient/amount'
import CodedError from './CodedError'

const app = express()

// TODO: Use env variable
const PORT = 3000

app.use(bodyParser.json())

// TODO: Remove test endpoint
app.get('/hello', (req, res: TypedResponse<{ message: string, to?: string }>) => {
  res.status(200).json({
    message: 'Hello World!',
    to: req.ip
  })
})

installRecipeEndpoint(app)
installIngredientEndpoint(app)

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
