import { type Express, type Request } from 'express'
import { BadRequest } from 'express-openapi-validator/dist/openapi.validator'
import expressAsyncHandler from 'express-async-handler'

import type IChefDatabase from '../../database/IChefDatabase'
import { type TypedResponse } from '../TypedEndpoint'
import decodeBasicAuth from '../../utils/decodeBasicAuth'
import generateHash from '../../utils/generateHash'
import issueToken from '../../utils/issueToken'
import { type paths } from '../../types/api.generated'

type endpoint = paths['/signup']['post']

export default function registerSignUpEndpoint (app: Express, db: IChefDatabase): void {
  app.post('/api/v1/signup',
    expressAsyncHandler(async (req: Request, res: TypedResponse<endpoint, 200>) => {
      const header = req.header('Authorization')
      // NOTE: express-openapi-validator will throw an error if the header is missing
      // This is a sanity check and helps make typescript happy
      if (header === undefined) {
        throw new BadRequest({ path: 'header', message: 'Missing Authorization header' })
      }

      const { username, password } = decodeBasicAuth(header)
      const hash = await generateHash(password)

      const id = db.wrapTransaction(writable => {
        return writable.addUser(username, hash)
      })

      res.json({
        token: issueToken(id),
        userId: id
      })
    }))
}
