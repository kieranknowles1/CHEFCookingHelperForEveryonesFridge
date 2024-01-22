import assert from 'assert'

import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

describe('/api/v1/user/:userId/preference/tag/:tagId/', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  describe('POST', () => {
    it('should set a disallowed tag', async () => {
      await request(app.server)
        .post('/api/v1/user/1/preference/tag/1?allow=false')
        .expect(204)

      const user = app.db.users.get(1)

      assert(user.bannedTags.has(1))
    })

    it('should clear a disallowed tag', async () => {
      await request(app.server)
        .post('/api/v1/user/1/preference/tag/1?allow=true')
        .expect(204)

      const user = app.db.users.get(1)

      assert(!user.bannedTags.has(1))
    })
  })
})
