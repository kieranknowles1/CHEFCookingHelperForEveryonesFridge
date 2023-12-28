import { type Express } from 'express'
import { param } from 'express-validator'

import { type components, type paths } from '../../../types/api.generated'
import { type TypedResponse } from '../../TypedEndpoint'
import checkParameters from '../../checkParameters'
import getDatabase from '../../../database/getDatabase'
import getParameters from '../../getParameters'

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
      const params = getParameters<endpoint>(req, matched => ({
        id: Number.parseInt(matched.id)
      }))
      const recipe = getDatabase().getRecipe(params.id)

      const ingredients: IngredientEntry[] = []
      for (const entry of recipe.ingredients.entries()) {
        const ingredient = getDatabase().getIngredient(entry[0])
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
        ingredients
      })
    })
}
