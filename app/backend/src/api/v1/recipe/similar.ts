import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import type IChefDatabase from '../../../database/IChefDatabase'
import { type paths } from '../../../types/api.generated'
import getSimilarity from '../../../ml/getSimilarity'

type endpoint = paths['/recipe/{recipeId}/similar']['get']

/**
 * Endpoint to get similar recipes to a given recipe by its ID
 * // TODO: Filter by what is available in the fridge
 */
export default function registerSimilarRecipeEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/recipe/:recipeId/similar',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const recipeId = Number.parseInt(req.params.recipeId)
      const minSimilarity = req.query.minSimilarity ?? 0.5
      const fridgeId = req.query.availableForFridge

      const comparisonRecipe = db.recipes.get(recipeId)

      if (fridgeId === undefined) {
        const similar = db.recipes.getSimilar(
          comparisonRecipe.name,
          minSimilarity,
          req.query.limit,
          comparisonRecipe.mealType.sentence
        )

        // Filter out the prompt recipe
        res.json(similar.filter(s => s.name !== comparisonRecipe.name.sentence))
      } else {
        const available = db.fridges.getAvailableRecipes(fridgeId, true, 0, comparisonRecipe.mealType.sentence)
        const similar = available.map(r => ({
          ...r,
          similarity: getSimilarity(comparisonRecipe.name.embedding, r.name.embedding)
        })).filter(
          r => r.similarity >= minSimilarity
        ).filter(
          r => r.id !== recipeId
        ).sort(
          (a, b) => b.similarity - a.similarity
        )

        res.json(similar.slice(0, req.query.limit).map(r => ({
          ...r,
          name: r.name.sentence
        })))
      }
    })
}
