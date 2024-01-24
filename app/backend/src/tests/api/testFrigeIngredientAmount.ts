import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

describe('/api/v1/fridge/:fridgeId/ingredient/all/amount', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  describe('GET', () => {
    it('should return 200 for valid fridgeId', async () => {
      await request(app.server)
        .get('/api/v1/fridge/1/ingredient/all/amount')
        .set('Authorization', app.authHeaderValue)
        .expect(200)
    })
  })
})

describe('/api/v1/fridge/:fridgeId/ingredient/:ingredientId/amount', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  describe('GET', () => {
    it('should return the amount of an ingredient', async () => {
      app.db.wrapTransaction(writable => {
        writable.setIngredientAmount(1, 1, 12345)
      })
      await request(app.server)
        .get('/api/v1/fridge/1/ingredient/1/amount')
        .set('Authorization', app.authHeaderValue)
        .expect(200, '12345')
    })
  })

  describe('POST', () => {
    it('should set the amount of an ingredient', async () => {
      await request(app.server)
        .post('/api/v1/fridge/1/ingredient/1/amount?amount=54321')
        .set('Authorization', app.authHeaderValue)
        .expect(204)

      await request(app.server)
        .get('/api/v1/fridge/1/ingredient/1/amount')
        .set('Authorization', app.authHeaderValue)
        .expect(200, '54321')
    })
  })
})
