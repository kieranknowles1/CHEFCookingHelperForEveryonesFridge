import { type Express, type Request } from 'express'
import { BadRequest } from 'express-openapi-validator/dist/openapi.validator'
import expressAsyncHandler from 'express-async-handler'

import type IChefDatabase from '../../database/IChefDatabase'
import NotAuthorizedError from '../NotAuthorizedError'
import { type TypedResponse } from '../TypedEndpoint'
import checkHash from '../../utils/checkHash'
import decodeBasicAuth from '../../utils/decodeBasicAuth'
import { type paths } from '../../types/api.generated'

type endpoint = paths['/login']['post']

function throwNotAuthorized (): never {
  throw new NotAuthorizedError('Invalid username or password')
}

export default function registerLoginEndpoint (app: Express, db: IChefDatabase): void {
  app.post('/api/v1/login',
    expressAsyncHandler(async (req: Request, res: TypedResponse<endpoint, 200> & TypedResponse<endpoint, 401>) => {
      const header = req.header('Authorization')
      // NOTE: express-openapi-validator will throw an error if the header is missing
      // This is a sanity check and helps make typescript happy
      if (header === undefined) {
        throw new BadRequest({ path: 'header', message: 'Missing Authorization header' })
      }

      const { username, password } = decodeBasicAuth(header)

      console.log(username, password)

      const credentials = db.users.getCredentials(username)
      if (credentials === null) {
        throwNotAuthorized()
      }

      const valid = await checkHash(password, credentials.passwordHash)
      if (!valid) {
        throwNotAuthorized()
      }

      res.json({
        token: 'TODO'
      })
    }))
}
