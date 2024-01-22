import { type Express, type Request } from 'express'

import type IChefDatabase from '../../database/IChefDatabase'
import { type TypedResponse } from '../TypedEndpoint'
import { type paths } from '../../types/api.generated'

type endpoint = paths['/mealtype/list']['get']

export default function registerMealTypeListEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/mealtype/list',
    (req: Request, res: TypedResponse<endpoint, 200>) => {
      const mealTypes = db.getMealTypeNames()
      res.json(mealTypes)
    })
}
