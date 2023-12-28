import { type Express, type Request } from 'express'
import { param, query } from 'express-validator'

import { type TypedResponse } from '../../TypedEndpoint'
import checkParameters from '../../checkParameters'
import getDatabase from '../../../database/getDatabase'
import getParameters from '../../getParameters'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/recipe/{id}/similar']['get']

/**
 * Endpoint to get similar recipes to a given recipe by its ID
 * // TODO: Look into ways of making this endpoint faster. Maybe have multithreading? Would require a microservice in another language
 * // TODO: Filter by what is available in the fridge
 */
export default function installSimilarRecipeEndpoint (app: Express): void {
  app.get('/api/v1/recipe/:id/similar',
    param('id').isInt(),
    query('minSimilarity').isFloat({ min: 0, max: 1 }).optional(),
    query('limit').isInt({ min: 1 }),
    checkParameters,
    (req: Request, res: TypedResponse<endpoint, 200>) => {
      const params = getParameters<endpoint>(req, matched => ({
        id: Number.parseInt(matched.id),
        minSimilarity: matched.minSimilarity !== undefined ? Number.parseFloat(matched.minSimilarity) : undefined,
        limit: Number.parseInt(matched.limit)
      }))

      const db = getDatabase()

      const recipe = db.getRecipe(params.id)

      const similar = db.getSimilarRecipes(
        recipe.name,
        params.minSimilarity ?? 0.5,
        params.limit
      )

      // Filter out the prompt recipe
      res.json(similar.filter(s => s.name !== recipe.name.sentence))
    })
}
