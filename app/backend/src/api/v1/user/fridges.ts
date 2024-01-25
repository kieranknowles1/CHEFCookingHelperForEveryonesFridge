import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import type IChefDatabase from '../../../database/IChefDatabase'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/user/{userId}/fridges']['get']

export default function registerUserFridgesEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/user/:userId/fridges',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const userId = parseInt(req.params.userId)

      const fridges = db.users.getAvailableFridges(userId)

      res.json(fridges)
    })
}
