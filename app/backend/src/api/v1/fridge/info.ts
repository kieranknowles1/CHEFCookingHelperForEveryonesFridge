import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import type IChefDatabase from '../../../database/IChefDatabase'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/fridge/{fridgeId}']['get']

export default function registerFridgeInfoEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/fridge/:fridgeId',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const fridgeId = parseInt(req.params.fridgeId)

      const fridge = db.fridges.get(fridgeId)
      const owner = db.users.get(fridge.ownerId)

      res.json({
        id: fridge.id,
        name: fridge.name,
        owner: {
          id: owner.id,
          name: owner.name
        }
      })
    })
}
