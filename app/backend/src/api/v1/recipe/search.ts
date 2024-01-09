import { type Express } from 'express'

import type IChefDatabase from '../../../database/IChefDatabase'
import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import getEmbedding from '../../../ml/getEmbedding'
import { type paths } from '../../../types/api.generated'
import expressAsyncHandler from 'express-async-handler'
import logger from '../../../logger'

type endpoint = paths['/recipe/search']['get']

export default function registerRecipeSearchEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/recipe/search',
    expressAsyncHandler(async (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const {
        search,
        minSimilarity = 0.5,

        availableForFridge,
        maxMissingIngredients = 0,
        checkAmounts = true,

        limit = 10,
        mealType
      } = req.query

      const searchEmbedding = search !== undefined ? await getEmbedding(search) : undefined

      logger.info('Searching with params')
      console.log(req.query)

      res.json(db.recipes.search({
        search: searchEmbedding,
        minSimilarity,

        availableForFridge,
        maxMissingIngredients,
        checkAmounts,

        limit,
        mealType
      }))
    }))
}
