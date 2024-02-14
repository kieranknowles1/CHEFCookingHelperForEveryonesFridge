import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

describe('/api/v1/user/:userId/', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  describe('GET', () => {
    it('should return the expected user info', async () => {
      await request(app.server)
        .get('/api/v1/user/1/')
        .set('Authorization', app.authHeaderValue)
        .expect(200, {
          id: 1,
          name: 'Testy McTestface',
          bannedIngredients: [{ id: 1, name: 'Apples' }],
          bannedTags: [{ id: 1, name: 'Nuts', description: 'Any kind of nut that you may be allergic to' }]
        })
    })
  })
})
