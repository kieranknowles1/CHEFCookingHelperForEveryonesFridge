import { param, query } from 'express-validator'
import { type Express } from 'express'

import { type TypedResponse } from '../../../TypedEndpoint'
import checkParameters from '../../../checkParameters'
import getDatabase from '../../../../database/getDatabase'
import getParameters from '../../../getParameters'
import { type paths } from '../../../../types/api.generated'

type ingredientGetEndpoint = paths['/fridge/{fridgeId}/ingredient/{ingredientId}/amount']['get']
type ingredientPostEndpoint = paths['/fridge/{fridgeId}/ingredient/{ingredientId}/amount']['post']

type IngredientGetResponse = TypedResponse<paths['/fridge/{fridgeId}/ingredient/{ingredientId}/amount']['get'], 200>

const PATH = '/api/v1/fridge/:fridgeId/ingredient/:ingredientId/amount'

export default function installFridgeIngredientEndpoint (app: Express): void {
  app.get(
    PATH,
    param('fridgeId').isInt(),
    param('ingredientId').isInt(),
    checkParameters,
    (req, res: IngredientGetResponse) => {
      const params = getParameters<ingredientGetEndpoint>(req, matched => ({
        fridgeId: Number.parseInt(matched.fridgeId),
        ingredientId: Number.parseInt(matched.ingredientId)
      }))

      const amount = getDatabase().getIngredientAmount(params.fridgeId, params.ingredientId)
      res.json(amount)
    }
  )

  app.post(
    PATH,
    param('fridgeId').isInt(),
    param('ingredientId').isInt(),
    query('amount').isFloat({ min: 0 }),
    checkParameters,
    (req, res) => {
      const params = getParameters<ingredientPostEndpoint>(req, matched => ({
        fridgeId: Number.parseInt(matched.fridgeId),
        ingredientId: Number.parseInt(matched.ingredientId),
        amount: Number.parseFloat(matched.amount)
      }))

      getDatabase().wrapTransaction(writable => {
        writable.setIngredientAmount(params.fridgeId, params.ingredientId, params.amount)
      })
      res.status(204).send()
    }
  )
}
