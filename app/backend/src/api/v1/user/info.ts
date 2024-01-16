import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import type IChefDatabase from '../../../database/IChefDatabase'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/user/{userId}']['get']

export default function registerUserInfoEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/user/:userId',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const userId = parseInt(req.params.userId)

      const user = db.users.get(userId)

      res.json({
        id: user.id,
        name: user.name,
        bannedTags: Array.from(user.bannedTags.entries()).map(([id, data]) => ({ id, name: data.name, description: data.description })),
        bannedIngredients: Array.from(user.bannedIngredients.entries()).map(([id, name]) => ({ id, name }))
      })
    })
}
