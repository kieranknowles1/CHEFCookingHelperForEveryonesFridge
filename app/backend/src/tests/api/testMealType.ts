import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

describe('/api/v1/mealtype/list', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  describe('GET', () => {
    it('should return all meal types', async () => {
      const expected = [
        'Breakfast',
        'Lunch',
        'Dinner',
        'Snack',
        'Dessert'
      ]

      await request(app.server)
        .get('/api/v1/mealtype/list')
        .expect(200, expected)
    })
  })
})
