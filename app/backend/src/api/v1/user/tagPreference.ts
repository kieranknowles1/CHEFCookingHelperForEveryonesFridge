import { type Express } from 'express'

import type IChefDatabase from '../../../database/IChefDatabase'
import { type TypedRequest } from '../../TypedEndpoint'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/user/{userId}/preference/tag/{tagId}']['post']

export default function registerUserTagPreferenceEndpoint (app: Express, db: IChefDatabase): void {
  app.post('/api/v1/user/:userId/preference/tag/:tagId',
    (req: TypedRequest<endpoint>, res) => {
      const userId = parseInt(req.params.userId)
      const tagId = parseInt(req.params.tagId)

      const allow = req.query.allow

      db.wrapTransaction(writable => {
        writable.setTagPreference(userId, tagId, allow)
      })

      res.sendStatus(204)
    })
}
