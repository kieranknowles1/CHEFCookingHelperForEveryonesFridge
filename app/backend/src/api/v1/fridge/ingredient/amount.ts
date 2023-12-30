import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../../TypedEndpoint'
import type IChefDatabase from '../../../../database/IChefDatabase'
import { type paths } from '../../../../types/api.generated'

type ingredientGetEndpoint = paths['/fridge/{fridgeId}/ingredient/{ingredientId}/amount']['get']
type ingredientPostEndpoint = paths['/fridge/{fridgeId}/ingredient/{ingredientId}/amount']['post']

const PATH = '/api/v1/fridge/:fridgeId/ingredient/:ingredientId/amount'

export default function installFridgeIngredientEndpoint (app: Express, db: IChefDatabase): void {
  app.get(
    PATH,
    (req: TypedRequest<ingredientGetEndpoint>, res: TypedResponse<ingredientGetEndpoint, 200>) => {
      const fridgeId = Number.parseInt(req.params.fridgeId)
      const ingredientId = Number.parseInt(req.params.ingredientId)

      const amount = db.getIngredientAmount(fridgeId, ingredientId)
      res.json(amount)
    }
  )

  app.post(
    PATH,
    (req: TypedRequest<ingredientPostEndpoint>, res) => {
      const fridgeId = Number.parseInt(req.params.fridgeId)
      const ingredientId = Number.parseInt(req.params.ingredientId)
      const amount = Number.parseFloat(req.query.amount)

      db.wrapTransaction(writable => {
        writable.setIngredientAmount(fridgeId, ingredientId, amount)
      })
      res.status(204).send()
    }
  )
}
