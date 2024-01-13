import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import type IChefDatabase from '../../../database/IChefDatabase'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/user/{userId}/history']['get']

export default function registerUserHistoryEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/user/:userId/history',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const userId = parseInt(req.params.userId)
      const limit = req.query.limit ?? 50

      const history = db.users.getHistory(userId, limit)

      res.json(history.map(row => ({
        ...row,
        dateMade: row.dateMade.toISOString()
      })))
    })
}
