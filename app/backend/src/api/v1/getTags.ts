import { type Express } from 'express'

import type IChefDatabase from '../../database/IChefDatabase'
import { type TypedResponse } from '../TypedEndpoint'
import { type paths } from '../../types/api.generated'

type endpoint = paths['/tag/list']['get']

export default function registerGetTagsEndpoint (app: Express, db: IChefDatabase): void {
  app.get('/api/v1/tag/list',
    (_, res: TypedResponse<endpoint, 200>) => {
      const tags = db.getTags()
      res.json(tags)
    })
}
