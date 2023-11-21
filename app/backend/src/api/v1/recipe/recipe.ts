import { type Express } from 'express'
import { param } from 'express-validator'

import { type components, type paths } from '../../../types/api.generated'
import { type TypedResponse } from '../../../TypedEndpoint'
import checkParameters from '../../../checkParameters'
import getDatabase from '../../../database/getDatabase'
import getParameters from '../../../getParameters'

type endpoint = paths['/recipe/{id}']['get']
type IngredientEntry = components['schemas']['RecipeIngredientEntry']

type RecipeResponse = TypedResponse<endpoint, 200>

/**
 * Endpoint to get a specific recipe by its ID
 */
export default function installRecipeEndpoint (app: Express): void {
  app.get('/api/v1/recipe/:id',
    param('id').isInt(),
    checkParameters,
    (req, res: RecipeResponse) => {
      const params = getParameters<endpoint>(req)
      const recipe = getDatabase().getRecipe(params.id)

      const ingredients: IngredientEntry[] = []
      for (const entry of recipe.ingredients.entries()) {
        const ingredient = getDatabase().getIngredient(entry[0])
        const amount = entry[1]
        ingredients.push({
          ingredient,
          amount: amount.amount ?? undefined,
          originalLine: amount.originalLine
        })
      }

      res.json({
        id: recipe.id,
        name: recipe.name,
        directions: recipe.directions,
        link: recipe.link,
        ingredients
      })
    })
}
