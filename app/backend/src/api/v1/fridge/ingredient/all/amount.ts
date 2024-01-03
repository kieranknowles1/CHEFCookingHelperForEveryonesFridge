import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../../../TypedEndpoint'
import type IChefDatabase from '../../../../../database/IChefDatabase'
import { type paths } from '../../../../../types/api.generated'

type endpoint = paths['/fridge/{fridgeId}/ingredient/all/amount']['get']

export default function registerFridgeIngredientAllAmountEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/fridge/:fridgeId/ingredient/all/amount',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const fridgeId = parseInt(req.params.fridgeId)

      const ingredients = db.getAllIngredientAmounts(fridgeId)

      res.json(Array.from(ingredients, ([id, row]) => {
        return {
          ingredient: row.ingredient,
          amount: row.amount
        }
      }))
    })
}
