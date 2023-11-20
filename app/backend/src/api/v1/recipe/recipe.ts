import { param, validationResult } from 'express-validator'
import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../../TypedEndpoint'
import { type components } from '../../../types/api.generated'
import getDatabase from '../../../database/getDatabase'

type RecipeResponse = TypedResponse<components['schemas']['Recipe']>
type IngredientEntry = components['schemas']['RecipeIngredientEntry']

type RecipeRequest = TypedRequest<undefined, { id: string }, undefined>

/**
 * Endpoint to get a specific recipe by its ID
 */
export default function installRecipeEndpoint (app: Express): void {
  app.get('/api/v1/recipe/:id', param('id').isInt(), (req: RecipeRequest, res: RecipeResponse) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() })
      return
    }

    const id = Number.parseInt(req.params.id)

    const recipe = getDatabase().getRecipe(id)

    const ingredients: IngredientEntry[] = []
    for (const entry of recipe.ingredients.entries()) {
      const ingredient = getDatabase().getIngredient(entry[0])
      const amount = entry[1]
      ingredients.push({
        ingredient: {
          id: ingredient.id as number,
          name: ingredient.name,
          preferredUnit: ingredient.preferredUnit
        },
        amount: amount.amount ?? undefined,
        originalLine: amount.originalLine
      })
    }

    res.json({
      id: recipe.id as number,
      name: recipe.name,
      directions: recipe.directions,
      link: recipe.link,
      ingredients
    })
  })
}
