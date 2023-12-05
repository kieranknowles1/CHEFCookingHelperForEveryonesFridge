import { type Express } from 'express'
import { param } from 'express-validator'

import { type TypedResponse } from '../../../TypedEndpoint'
import checkParameters from '../../../checkParameters'
import getDatabase from '../../../../database/getDatabase'
import getParameters from '../../../getParameters'
import { type paths } from '../../../../types/api.generated'

type endpoint = paths['/fridge/{fridgeId}/recipe/available']['get']
type AvailableRecipeResponse = TypedResponse<endpoint, 200>

export default function installFridgeAvailableRecipeEndpoint (app: Express): void {
  app.get('/api/v1/fridge/:fridgeId/recipe/available',
    param('fridgeId').isInt(),
    checkParameters,
    (req, res: AvailableRecipeResponse) => {
      const params = getParameters<endpoint>(req, matched => ({
        fridgeId: Number.parseInt(matched.fridgeId)
      }))
      res.json(getDatabase().getAvailableRecipes(params.fridgeId))
    })
}
