import { type Express } from 'express'

import type IChefDatabase from '../../../../database/IChefDatabase'
import { type TypedRequest } from '../../../TypedEndpoint'
import { type paths } from '../../../../types/api.generated'

type endpoint = paths['/fridge/{fridgeId}/recipe/{recipeId}/deduct']['post']

export default function registerFridgeDeductRecipeEndpoint (app: Express, db: IChefDatabase): void {
  app.post('/api/v1/fridge/:fridgeId/recipe/:recipeId/deduct',
    (req: TypedRequest<endpoint>, res) => {
      const fridgeId = Number.parseInt(req.params.fridgeId)
      const recipeId = Number.parseInt(req.params.recipeId)

      const recipe = db.recipes.get(recipeId)

      db.wrapTransaction(writable => {
        for (const [ingredient, amount] of recipe.ingredients) {
          // Skip ingredients with no amounts. This is considered to be
          // valid behavior, since the ingredient could be something like
          // "Salt and pepper to taste"
          if (amount.amount === null) {
            continue
          }

          const available = db.fridges.getIngredientAmount(fridgeId, ingredient)
          const newAmount = Math.max(0, available - amount.amount)
          writable.setIngredientAmount(fridgeId, ingredient, newAmount)
        }
      })

      res.status(204).send()
    })
}