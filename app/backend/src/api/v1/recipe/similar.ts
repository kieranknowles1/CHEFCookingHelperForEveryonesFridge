import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import getDatabase from '../../../database/getDatabase'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/recipe/{id}/similar']['get']

/**
 * Endpoint to get similar recipes to a given recipe by its ID
 * // TODO: Look into ways of making this endpoint faster. Maybe have multithreading? Would require a microservice in another language
 * // TODO: Filter by what is available in the fridge
 */
export default function installSimilarRecipeEndpoint (app: Express): void {
  app.get('/api/v1/recipe/:id/similar',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const db = getDatabase()

      const recipeId = Number.parseInt(req.params.id)
      const minSimilarity = Number.parseFloat(req.query.minSimilarity ?? '0.5')
      const limit = Number.parseInt(req.query.limit)

      const recipe = db.getRecipe(recipeId)

      const similar = db.getSimilarRecipes(
        recipe.name,
        minSimilarity ?? 0.5,
        limit
      )

      // Filter out the prompt recipe
      res.json(similar.filter(s => s.name !== recipe.name.sentence))
    })
}
