import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

describe('GET /api/v1/fridge/:fridgeId/ingredient/all/amount', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  it('should return 200 for valid fridgeId', async () => {
    await request(app.server, { })
      .get('/api/v1/fridge/1/ingredient/all/amount')
      .expect(200)
  })
})
