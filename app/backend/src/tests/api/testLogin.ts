import { describe, it } from 'mocha'
import { faker } from '@faker-js/faker'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

const correctUsername = 'Testy McTestFace'
const correctPassword = '12345'

function tryLogin(app: TestApp, username: string, password: string): request.Test {
  const headers = {
    Authorization: `Basic ${btoa(username + ':' + password)}`
  }

  return request(app.server)
    .post('/api/v1/login')
    .set(headers)
}

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
      await tryLogin(app, correctUsername, correctPassword)
        .expect(200)
    })

    it('should be case-insensitive for username', async () => {
      await tryLogin(app, correctUsername.toUpperCase(), correctPassword)
        .expect(200)
    })

    it('should return 401 for invalid login', async () => {
      await tryLogin(app, correctUsername, 'wrong_one')
        .expect(401)
    })

    it('should reject a header that is not Authorization: Basic', async () => {
      await request(app.server)
        .post('/api/v1/login')
        .set({ Authorization: 'Bearer 123' })
        .expect(401)
    })

    it('should reject a password that is too long to hash', async () => {
      await tryLogin(app, correctUsername, faker.lorem.words(100))
        .expect(400)
    })
  })
})
