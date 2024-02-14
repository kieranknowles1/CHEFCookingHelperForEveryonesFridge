import { describe, it } from 'mocha'
import { faker } from '@faker-js/faker'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

describe('/api/v1/login', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  describe('POST', () => {
    it('should return 200 for valid login', async () => {
      const username = 'Testy McTestFace'
      const password = '12345'
      const headers = {
        Authorization: `Basic ${btoa(username + ':' + password)}`
      }

      await request(app.server)
        .post('/api/v1/login')
        .set(headers)
        .expect(200)
    })

    it('should be case-insensitive for username', async () => {
      const username = 'TESTY MCTESTFACE'
      const password = '12345'
      const headers = {
        Authorization: `Basic ${btoa(username + ':' + password)}`
      }

      await request(app.server)
        .post('/api/v1/login')
        .set(headers)
        .expect(200)
    })

    it('should return 401 for invalid login', async () => {
      const username = 'Testy McTestFace'
      const password = 'wrong_one'
      const headers = {
        Authorization: `Basic ${btoa(username + ':' + password)}`
      }

      await request(app.server)
        .post('/api/v1/login')
        .set(headers)
        .expect(401)
    })

    it('should reject a header that is not Authorization: Basic', async () => {
      const headers = {
        Authorization: 'Bearer 12345'
      }

      await request(app.server)
        .post('/api/v1/login')
        .set(headers)
        .expect(401)
    })

    it('should reject a password that is too long to hash', async () => {
      const username = 'Testy McTestFace'
      const password = faker.lorem.words(100)

      const headers = {
        Authorization: `Basic ${btoa(username + ':' + password)}`
      }

      await request(app.server)
        .post('/api/v1/login')
        .set(headers)
        .expect(400)
    })
  })
})
