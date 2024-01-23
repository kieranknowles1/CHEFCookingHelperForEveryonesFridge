import { type Express, type Request } from 'express'
import { BadRequest } from 'express-openapi-validator/dist/openapi.validator'

import type IChefDatabase from '../../database/IChefDatabase'
import { type TypedResponse } from '../TypedEndpoint'
import { type paths } from '../../types/api.generated'

type endpoint = paths['/login']['post']

export default function registerLoginEndpoint (app: Express, db: IChefDatabase): void {
  app.post('/api/v1/login',
    (req: Request, res: TypedResponse<endpoint, 200>) => {
      const header = req.header('Authorization')
      // NOTE: express-openapi-validator will throw an error if the header is missing
      // This is a sanity check and helps make typescript happy
      if (header === null) {
        throw new BadRequest({ path: 'header', message: 'Missing Authorization header' })
      }

      res.json({ token: '1234' })
    })
}
