import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

describe('/api/v1/recipe/:id', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  it('should return the expected recipe', async () => {
    await request(app.server)
      .get('/api/v1/recipe/1/')
      .expect(200, {
        id: 1,
        name: 'A and B salad',
        directions: 'Put the A and B together.',
        link: 'https://example.com',
        mealType: 'Breakfast',
        ingredients: [
          {
            amount: 10,
            originalLine: '10 Apples',
            ingredient: {
              assumeUnlimited: false,
              density: 123,
              id: 1,
              name: 'Apples',
              preferredUnit: 'whole'
            }
          },
          {
            amount: 5,
            originalLine: '5 Bananas',
            ingredient: {
              assumeUnlimited: false,
              density: 456,
              id: 2,
              name: 'Bananas',
              preferredUnit: 'whole'
            }
          }
        ]
      })
  })

  it('should return 404 for a non-existent recipe', async () => {
    await request(app.server)
      .get('/api/v1/recipe/999/')
      .expect(404)
  })
})
