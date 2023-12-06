import { type Express } from 'express'
import { param } from 'express-validator'

import { type TypedResponse } from '../../TypedEndpoint'
import checkParameters from '../../checkParameters'
import getDatabase from '../../../database/getDatabase'
import getParameters from '../../getParameters'
import { type paths } from '../../../types/api.generated'

type path = paths['/barcode/{code}']

type GetResponse = TypedResponse<path['get'], 200>

export default function installBarcodeEndpoint (app: Express): void {
  app.get('/api/v1/barcode/:code',
    param('code').isInt(),
    checkParameters,
    (req, res: GetResponse) => {
      const params = getParameters<path['get']>(req, matched => ({
        code: Number.parseInt(matched.code)
      }))

      // 404s if not found
      const data = getDatabase().getBarcode(params.code)
      res.json(data)
    })
}
