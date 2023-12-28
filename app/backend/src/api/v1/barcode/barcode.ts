import { type Express } from 'express'

import { type TypedRequest, type TypedResponse } from '../../TypedEndpoint'
import getDatabase from '../../../database/getDatabase'
import { type paths } from '../../../types/api.generated'

type endpoint = paths['/barcode/{code}']['get']

export default function installBarcodeEndpoint (app: Express): void {
  app.get('/api/v1/barcode/:code',
    (req: TypedRequest<endpoint>, res: TypedResponse<endpoint, 200>) => {
      const code = Number.parseInt(req.params.code)

      // 404s if not found
      const data = getDatabase().getBarcode(code)
      res.json(data)
    })
}
