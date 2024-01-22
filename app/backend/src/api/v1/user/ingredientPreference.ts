import { type Express } from 'express'

import type IChefDatabase from '../../../database/IChefDatabase'
import { type TypedRequest } from '../../TypedEndpoint'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/user/{userId}/preference/ingredient/{ingredientId}']['post']

export default function registerUserIngredientPreferenceEndpoint (app: Express, db: IChefDatabase): void {
  app.post('/api/v1/user/:userId/preference/ingredient/:ingredientId',
    (req: TypedRequest<endpoint>, res) => {
      const userId = parseInt(req.params.userId)
      const ingredientId = parseInt(req.params.ingredientId)

      const allow = req.query.allow

      db.wrapTransaction(writable => {
        writable.setIngredientPreference(userId, ingredientId, allow)
      })

      res.sendStatus(204)
    })
}
