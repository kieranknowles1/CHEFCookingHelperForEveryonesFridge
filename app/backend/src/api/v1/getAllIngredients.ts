import { type Express } from 'express'

import type IChefDatabase from '../../database/IChefDatabase'
import { type TypedResponse } from '../TypedEndpoint'
import { type paths } from '../../types/api.generated'

type endpoint = paths['/ingredient/all']['get']

export default function registerIngredientAllEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/ingredient/all',
    (_, res: TypedResponse<endpoint, 200>) => {
      const data = db.ingredients.getAll()
      res.json(Array.from(data.values()))
    })
}
