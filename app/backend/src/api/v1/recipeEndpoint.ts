import type { Request } from 'express'

import type { components } from '../../types/api.generated'
import type TypedResponse from '../../TypedResponse'
import ChefDatabase from '../../database/ChefDatabase'
type RecipeResponse = TypedResponse<components['schemas']['Recipe']>
type IngredientEntry = components['schemas']['IngredientEntry']

/**
 * Endpoint to get a specific recipe by its ID
 */
export default function recipeEndpoint (req: Request, res: RecipeResponse): void {
  // TODO: Class to parse args and throw errors if missing
  const id = Number.parseInt(req.params.id)

  const recipe = ChefDatabase.Instance.getRecipe(id)

  const ingredients: IngredientEntry[] = []
  for (const entry of recipe.ingredients.entries()) {
    const ingredient = ChefDatabase.Instance.getIngredient(entry[0])
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
}
