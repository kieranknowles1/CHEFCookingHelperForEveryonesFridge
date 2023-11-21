import { type Express } from 'express'
import { param } from 'express-validator'

import { type TypedRequest, type TypedResponse } from '../../../../TypedEndpoint'
import getDatabase from '../../../../database/getDatabase'
import { type paths } from '../../../../types/api.generated'

type AvailableRecipeRequest = TypedRequest<undefined, { fridgeId: string }, undefined>
// TODO: Support this pattern with TypedResponse and use everywhere
type AvailableRecipeResponse = TypedResponse<paths['/fridge/{fridgeId}/recipe/available']['get']['responses']['200']['content']['application/json']>

export default function installAvailableRecipeEndpoint (app: Express): void {
  app.get('/api/v1/fridge/:fridgeId/recipe/available',
    param('fridgeId').isInt(),
    (req: AvailableRecipeRequest, res: AvailableRecipeResponse) => {
      const fridgeId = Number.parseInt(req.params?.fridgeId)
      console.log(fridgeId)
      res.json(getDatabase().getAvailableRecipes(fridgeId))
    })
}
