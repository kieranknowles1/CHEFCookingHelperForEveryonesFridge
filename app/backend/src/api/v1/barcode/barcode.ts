import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import type IChefDatabase from '../../../database/IChefDatabase'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/barcode/{code}']['get']

export default function registerBarcodeEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/barcode/:code',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const code = Number.parseInt(req.params.code)

      // 404s if not found
      const data = db.getBarcode(code)
      res.json(data)
    })
}
