import { param, query, validationResult } from 'express-validator'
import { type Express } from 'express'

import { TypedRequest, type ParameterType, type TypedResponse } from '../../../../TypedEndpoint'
import getDatabase from '../../../../database/getDatabase'
import { type paths } from '../../../../types/api.generated'

interface IngredientRequest<TQuery extends ParameterType, TBody>
  extends TypedRequest<TQuery, { fridgeId: string, ingredientId: string }, TBody> {}

type IngredientPostRequest = IngredientRequest<{ amount: string }, undefined>
type IngredientGetRequest = IngredientRequest<undefined, undefined>
type IngredientGetResponse = TypedResponse<paths['/fridge/{fridgeId}/ingredient/{ingredientId}/amount']['get'], 200>

const PATH = '/api/v1/fridge/:fridgeId/ingredient/:ingredientId/amount'

export default function installIngredientEndpoint (app: Express): void {
  app.get(
    PATH,
    param('fridgeId').isInt(),
    param('ingredientId').isInt(),
    (req: IngredientGetRequest, res: IngredientGetResponse) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const fridgeId = Number.parseFloat(req.params.fridgeId)
      const ingredientId = Number.parseFloat(req.params.ingredientId)

      const amount = getDatabase().getIngredientAmount(fridgeId, ingredientId)
      res.json(amount)
    }
  )

  app.post(
    PATH,
    param('fridgeId').isInt(),
    param('ingredientId').isInt(),
    query('amount').isFloat({ min: 0 }),
    (req: IngredientPostRequest, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const fridgeId = Number.parseInt(req.params.fridgeId)
      const ingredientId = Number.parseInt(req.params.ingredientId)
      const amount = Number.parseFloat(req.query.amount)

      getDatabase().wrapTransaction(writable => {
        writable.setIngredientAmount(fridgeId, ingredientId, amount)
      })
      res.status(204).send()
    }
  )
}
