import { type Express } from 'express'

import { type TypedResponse } from '../../TypedEndpoint'
import getDatabase from '../../../database/getDatabase'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/ingredient/all']['get']

export default function installIngredientAllEndpoint (app: Express): void {
  app.get('/api/v1/ingredient/all',
    (_, res: TypedResponse<endpoint, 200>) => {
      const data = getDatabase().getAllIngredients()
      res.json(Array.from(data.values()))
    })
}