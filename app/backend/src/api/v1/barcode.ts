import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../TypedEndpoint'
import type IChefDatabase from '../../database/IChefDatabase'
import { type paths } from '../../types/api.generated'

type GetEndpoint = paths['/barcode/{code}']['get']
type PostEndpoint = paths['/barcode/{code}']['post']

export default function registerBarcodeEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/barcode/:code',
    (req: TypedRequest<GetEndpoint>, res: TypedResponse<GetEndpoint, 200>) => {
      const code = Number.parseInt(req.params.code)

      // 404s if not found
      const data = db.getBarcode(code)
      res.json({
        // Not returned by this endpoint as it was specified as a path parameter
        // code: data.code,
        amount: data.amount,
        productName: data.productName,
        ingredient: data.ingredient
      })
    })

  app.post('/api/v1/barcode/:code',
    (req: TypedRequest<PostEndpoint>, res) => {
      const code = Number.parseInt(req.params.code)
      const data = req.body

      db.wrapTransaction(writable => {
        writable.setBarcode(code, data)
      })
      res.sendStatus(204)
    })
}
