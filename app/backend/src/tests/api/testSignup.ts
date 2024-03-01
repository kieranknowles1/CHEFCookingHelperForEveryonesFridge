import assert from 'assert'

import { describe, it } from 'mocha'
import { decode } from 'jsonwebtoken'
import { faker } from '@faker-js/faker'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

function makeRequest (app: TestApp, username: string, password: string): request.Test {
  return request(app.server)
    .post('/api/v1/signup')
    .set('Authorization', createHeader(username, password))
}

function createHeader (username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`
}

describe('/api/v1/signup', () => {
  let app: TestApp
  const username = faker.internet.userName()
  const password = faker.internet.password()
  beforeEach(() => {
    app = createTestApp()
  })

  afterEach(() => {
    app.server.close()
  })

  it('should sign up a new user', async () => {
    await makeRequest(app, username, password)
      .expect(201)

    await request(app.server)
      .post('/api/v1/login')
      .set('Authorization', createHeader(username, password))
      .expect(200)
  })

  it('should return a valid token for the new user', async () => {
    const response = await makeRequest(app, username, password)
      .expect(201)

    const { token, userId } = response.body
    assert.strictEqual(typeof token, 'string', 'Token is not a string')
    assert.strictEqual(typeof userId, 'number', 'userId is not a number')

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- above assert checks the type
    const decoded = decode(token)
    assert(typeof decoded === 'object' && decoded !== null)

    assert.strictEqual(decoded.sub, userId.toString())

    await request(app.server)
      .get(`/api/v1/user/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  it('should not allow signing up with an existing username, case insensitive', async () => {
    await makeRequest(app, username, password)
      .expect(201)

    await makeRequest(app, username.toLowerCase(), password)
      .expect(400)

    await makeRequest(app, username.toUpperCase(), password)
      .expect(400)
  })
})
