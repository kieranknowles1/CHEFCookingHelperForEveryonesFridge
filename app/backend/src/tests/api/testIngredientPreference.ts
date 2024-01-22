import assert from 'assert'

import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

describe('/api/v1/user/:userId/preference/ingredient/:tagId/', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  describe('POST', () => {
    it('should set a disallowed ingredient', async () => {
      await request(app.server)
        .post('/api/v1/user/1/preference/ingredient/1?allow=false')
        .expect(204)

      const user = app.db.users.get(1)

      assert(user.bannedIngredients.has(1))
    })

    it('should clear a disallowed ingredient', async () => {
      await request(app.server)
        .post('/api/v1/user/1/preference/ingredient/1?allow=true')
        .expect(204)

      const user = app.db.users.get(1)

      assert(!user.bannedIngredients.has(1))
    })
  })
})
