import { type Express } from 'express'
import { matchedData, param } from 'express-validator'

import { EndpointParameters, type TypedRequest, type TypedResponse } from '../../../../../TypedEndpoint'
import getDatabase from '../../../../../database/getDatabase'
import { type paths } from '../../../../../types/api.generated'

type endpoint = paths['/fridge/{fridgeId}/ingredient/all/amount']['get']

type IngredientAllRequest = TypedRequest<undefined, { fridgeId: string }, undefined>
type IngredientAllResponse = TypedResponse<endpoint, 200>

export default function installIngredientAllAmountEndpoint (app: Express): void {
  app.get('/api/v1/fridge/:fridgeId/ingredient/all/amount',
    param('fridgeId').isInt(),
    (req: IngredientAllRequest, res: IngredientAllResponse) => {
      const data = matchedData(req) as EndpointParameters<endpoint>

      const ingredients = getDatabase().getAllIngredientAmounts(data.fridgeId)

      res.json(Array.from(ingredients, ([id, row]) => {
        return {
          ingredient: row.ingredient,
          amount: row.amount
        }
      }))
    })
}
