import { describe, it } from 'mocha'
import request from 'supertest'

import { type paths } from '../../types/api.generated'

import createTestApp, { type TestApp } from './createTestApp'

type BarcodeBody = paths['/barcode/{code}']['post']['requestBody']['content']['application/json']
type BarcodeResponse = paths['/barcode/{code}']['get']['responses']['200']['content']['application/json']

describe('GET /api/v1/barcode/:barcode', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  describe('GET', () => {
    it('should return 200 for valid barcode', async () => {
      await request(app.server)
        .get('/api/v1/barcode/12345')
        .expect(200)
    })

    it('should return 404 for invalid barcode', async () => {
      await request(app.server)
        .get('/api/v1/barcode/404')
        .expect(404)
    })
  })

  describe('POST', () => {
    it('should add a new barcode', async () => {
      const payload: BarcodeBody = {
        amount: 100,
        productName: 'Test Product',
        ingredientId: 1
      }
      const expected: BarcodeResponse = {
        amount: payload.amount,
        productName: payload.productName,
        ingredient: app.db.ingredients.get(payload.ingredientId)
      }

      await request(app.server)
        .post('/api/v1/barcode/720')
        .send(payload)
        .expect(204)

      await request(app.server)
        .get('/api/v1/barcode/720')
        .expect(200, expected)
    })
  })
})
