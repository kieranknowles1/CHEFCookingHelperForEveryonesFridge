import express from 'express'
import bodyParser from 'body-parser'

import type TypedResponse from './TypedResponse'
import installRecipeEndpoint from './api/v1/installRecipeEndpoint'
import installAddIngredientEndpoint from './api/v1/installAddIngredientEndpoint'

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

// TODO: API Exception handler

installRecipeEndpoint(app)
installAddIngredientEndpoint(app)

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
