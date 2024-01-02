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
    app.connection.exec(`
      INSERT INTO user (id, username) VALUES (1, 'testUser');
      INSERT INTO fridge (id, name, owner_id) VALUES (1, 'testFridge', 1);
      INSERT INTO fridge_ingredient (fridge_id, ingredient_id, amount) VALUES (1, 1, 1);
    `)

    await request(app.server, { })
      .get('/api/v1/fridge/1/ingredient/all/amount')
      .expect(200)
  })
})
