import assert from 'assert'

import { describe, it } from 'mocha'
import { decode } from 'jsonwebtoken'
import { faker } from '@faker-js/faker'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

function createHeader (username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`
}

describe('/api/v1/signup', () => {
  let app: TestApp
  beforeEach(() => {
    app = createTestApp()
  })

  afterEach(() => {
    app.server.close()
  })

  it('should sign up a new user', async () => {
    const username = faker.internet.userName()
    const password = faker.internet.password()

    await request(app.server)
      .post('/api/v1/signup')
      .set('Authorization', createHeader(username, password))
      .expect(201)

    await request(app.server)
      .post('/api/v1/login')
      .set('Authorization', createHeader(username, password))
      .expect(200)
  })

  it('should return a valid token for the new user', async () => {
    const username = faker.internet.userName()
    const password = faker.internet.password()

    const response = await request(app.server)
      .post('/api/v1/signup')
      .set('Authorization', createHeader(username, password))
      .expect(201)

    const { token, userId } = response.body
    assert(typeof token === 'string')
    assert(typeof userId === 'string')

    const decoded = decode(token)
    assert(typeof decoded === 'object' && decoded !== null)

    assert.strictEqual(decoded.sub, userId)
  })

  it('should not allow signing up with an existing username, case insensitive', async () => {
    const username = faker.internet.userName()
    const password = faker.internet.password()

    await request(app.server)
      .post('/api/v1/signup')
      .set('Authorization', createHeader(username, password))
      .expect(201)

    await request(app.server)
      .post('/api/v1/signup')
      .set('Authorization', createHeader(username.toLowerCase(), password))
      .expect(400)

    await request(app.server)
      .post('/api/v1/signup')
      .set('Authorization', createHeader(username.toUpperCase(), password))
      .expect(400)
  })
})
