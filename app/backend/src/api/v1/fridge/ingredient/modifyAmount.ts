import { type Express } from 'express'

import type IChefDatabase from '../../../../database/IChefDatabase'
import { type TypedRequest } from '../../../TypedEndpoint'
import { type paths } from '../../../../types/api.generated'

type endpoint = paths['/fridge/{fridgeId}/ingredient/{ingredientId}/modify']['post']

export default function registerFridgeIngredientModifyEndpoint (app: Express, db: IChefDatabase): void {
  app.post(
    '/api/v1/fridge/:fridgeId/ingredient/:ingredientId/modify',
    (req: TypedRequest<endpoint>, res) => {
      const fridgeId = Number.parseInt(req.params.fridgeId)
      const ingredientId = Number.parseInt(req.params.ingredientId)

      const current = db.fridges.getIngredientAmount(fridgeId, ingredientId)
      const delta = req.query.delta

      db.wrapTransaction(writable => {
        writable.setIngredientAmount(fridgeId, ingredientId, current + delta)
      })
      res.status(204).send()
    }
  )
}
