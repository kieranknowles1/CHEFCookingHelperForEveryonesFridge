import { matchedData, param, query } from 'express-validator'
import { type Express } from 'express'

import { type TypedResponse } from '../../../TypedEndpoint'
import checkParameters from '../../../checkParameters'
import getDatabase from '../../../../database/getDatabase'
import { type paths } from '../../../../types/api.generated'

type endpoint = paths['/fridge/{fridgeId}/recipe/available']['get']
type AvailableRecipeResponse = TypedResponse<endpoint, 200>

export default function installFridgeAvailableRecipeEndpoint (app: Express): void {
  app.get('/api/v1/fridge/:fridgeId/recipe/available',
    param('fridgeId').isInt(),
    query('maxMissingIngredients').optional().isInt({ min: 0 }),
    query('checkAmounts').optional().isBoolean(),
    checkParameters,
    (req, res: AvailableRecipeResponse) => {
      // TODO: Use `getParameters` if it can be made to work with optional parameters
      const rawParams = matchedData(req)
      const fridgeId = Number.parseInt(rawParams.fridgeId)
      const checkAmounts = rawParams.checkAmounts === 'true'
      const maxMissingIngredients = rawParams.maxMissingIngredients !== undefined ? Number.parseInt(rawParams.maxMissingIngredients) : 0

      res.json(getDatabase().getAvailableRecipes(fridgeId, checkAmounts, maxMissingIngredients))
    })
}
