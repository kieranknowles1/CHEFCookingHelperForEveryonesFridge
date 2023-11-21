import { type Express } from 'express'
import { param } from 'express-validator'

import { type TypedRequest, type TypedResponse } from '../../../../../TypedEndpoint'
import getDatabase from '../../../../../database/getDatabase'
import { type paths } from '../../../../../types/api.generated'

type IngredientAllRequest = TypedRequest<undefined, { fridgeId: string }, undefined>
type IngredientAllResponse = TypedResponse<paths['/fridge/{fridgeId}/ingredient/all/amount']['get'], 200>

export default function installIngredientAllAmountEndpoint (app: Express): void {
  app.get('/api/v1/fridge/:fridgeId/ingredient/all/amount',
    param('fridgeId').isInt(),
    (req: IngredientAllRequest, res: IngredientAllResponse) => {
      const fridgeId = Number.parseInt(req.params.fridgeId)
      const ingredients = getDatabase().getAllIngredientAmounts(fridgeId)

      res.json(Array.from(ingredients, ([id, row]) => {
        return {
          ingredient: row.ingredient,
          amount: row.amount
        }
      }))
    })
}
