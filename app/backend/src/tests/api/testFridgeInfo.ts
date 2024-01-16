import { describe, it } from 'mocha'
import request from 'supertest'

import { type paths } from '../../types/api.generated'

import createTestApp, { type TestApp } from './createTestApp'

type FridgeInfoResponse = paths['/fridge/{fridgeId}']['get']['responses']['200']['content']['application/json']

describe('/api/v1/fridge/:id', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  describe('GET', () => {
    it('should return information about the fridge', async () => {
      const expected: FridgeInfoResponse = {
        id: 1,
        name: 'The Test Fridge',
        owner: app.db.users.get(1)
      }

      await request(app.server)
        .get('/api/v1/fridge/1')
        .expect(200, expected)
    })
  })
})
