import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import { type components, type paths } from '../../../types/api.generated'
import type IChefDatabase from '../../../database/IChefDatabase'

type endpoint = paths['/recipe/{id}']['get']
type IngredientEntry = components['schemas']['RecipeIngredientEntry']

/**
 * Endpoint to get a specific recipe by its ID
 */
export default function registerRecipeEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/recipe/:id',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const id = Number.parseInt(req.params.id)
      const recipe = db.getRecipe(id)

      const ingredients: IngredientEntry[] = []
      for (const entry of recipe.ingredients.entries()) {
        const ingredient = db.getIngredient(entry[0])
        const amount = entry[1]
        ingredients.push({
          ingredient: {
            assumeUnlimited: ingredient.assumeUnlimited,
            id: ingredient.id,
            name: ingredient.name,
            preferredUnit: ingredient.preferredUnit,
            density: ingredient.density
          },
          amount: amount.amount ?? undefined,
          originalLine: amount.originalLine
        })
      }

      res.status(200).json({
        id: recipe.id,
        name: recipe.name.sentence,
        directions: recipe.directions,
        link: recipe.link,
        ingredients,
        mealType: recipe.mealType.sentence
      })
    })
}
