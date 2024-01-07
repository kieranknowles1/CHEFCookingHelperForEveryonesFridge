import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import type IChefDatabase from '../../../database/IChefDatabase'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/recipe/{id}/similar']['get']

/**
 * Endpoint to get similar recipes to a given recipe by its ID
 * // TODO: Filter by what is available in the fridge
 */
export default function registerSimilarRecipeEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/recipe/:id/similar',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const recipeId = Number.parseInt(req.params.id)
      const minSimilarity = Number.parseFloat(req.query.minSimilarity ?? '0.5')
      const limit = Number.parseInt(req.query.limit)

      const recipe = db.recipes.get(recipeId)

      const similar = db.recipes.getSimilar(
        recipe.name,
        minSimilarity,
        limit,
        recipe.mealType.sentence
      )

      // Filter out the prompt recipe
      res.json(similar.filter(s => s.name !== recipe.name.sentence))
    })
}
