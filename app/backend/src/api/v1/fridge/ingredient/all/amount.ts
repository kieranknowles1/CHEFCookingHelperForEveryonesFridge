import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../../../TypedEndpoint'
import getDatabase from '../../../../../database/getDatabase'
import { type paths } from '../../../../../types/api.generated'

type endpoint = paths['/fridge/{fridgeId}/ingredient/all/amount']['get']

export default function installFridgeIngredientAllAmountEndpoint (app: Express): void {
  app.get('/api/v1/fridge/:fridgeId/ingredient/all/amount',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const fridgeId = parseInt(req.params.fridgeId)

      const ingredients = getDatabase().getAllIngredientAmounts(fridgeId)

      res.json(Array.from(ingredients, ([id, row]) => {
        return {
          ingredient: row.ingredient,
          amount: row.amount
        }
      }))
    })
}
