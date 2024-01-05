import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

describe('GET /api/v1/barcode/:barcode', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  it('should return 200 for valid barcode', async () => {
    app.connection.exec(`
      INSERT INTO barcode (code, ingredient_id, product_name, amount) VALUES ('12345', 1, 'stuff', 1);
    `)

    await request(app.server, { })
      .get('/api/v1/barcode/12345')
      .expect(200)
  })

  it('should return 404 for invalid barcode', async () => {
    await request(app.server, { })
      .get('/api/v1/barcode/404')
      .expect(404)
  })
})