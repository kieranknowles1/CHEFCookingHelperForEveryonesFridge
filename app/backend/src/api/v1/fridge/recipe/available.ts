import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../../TypedEndpoint'
import type IChefDatabase from '../../../../database/IChefDatabase'
import { type paths } from '../../../../types/api.generated'

type endpoint = paths['/fridge/{fridgeId}/recipe/available']['get']

export default function registerFridgeAvailableRecipeEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/fridge/:fridgeId/recipe/available',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const fridgeId = parseInt(req.params.fridgeId)
      const checkAmounts = req.query.checkAmounts === 'true'
      const maxMissingIngredients = parseInt(req.query.maxMissingIngredients ?? '0')
      const mealType = req.query.mealType ?? null

      res.json(db.getAvailableRecipes(
        fridgeId,
        checkAmounts,
        maxMissingIngredients,
        mealType
      ))
    })
}
