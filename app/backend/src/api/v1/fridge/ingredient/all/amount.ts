import { type Express, type Request } from 'express'
import { param } from 'express-validator'

import checkParameters, { getParameters } from '../../../../../checkParameters'
import { type TypedResponse } from '../../../../../TypedEndpoint'
import getDatabase from '../../../../../database/getDatabase'
import { type paths } from '../../../../../types/api.generated'

type endpoint = paths['/fridge/{fridgeId}/ingredient/all/amount']['get']

export default function installIngredientAllAmountEndpoint (app: Express): void {
  app.get('/api/v1/fridge/:fridgeId/ingredient/all/amount',
    param('fridgeId').isInt(),
    checkParameters,
    (req: Request, res: TypedResponse<endpoint, 200>) => {
      const data = getParameters<endpoint>(req)

      const ingredients = getDatabase().getAllIngredientAmounts(data.fridgeId)

      res.json(Array.from(ingredients, ([id, row]) => {
        return {
          ingredient: row.ingredient,
          amount: row.amount
        }
      }))
    })
}
