import { type Server } from 'http'
import assert from 'assert'

import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp from './createTestApp'

describe('404', () => {
  let server: Server
  before(() => {
    server = createTestApp().listen()
  })

  it('should return 404 for unknown path', async () => {
    const res = await request(server, { })
      .get('/unknown')
    assert.strictEqual(res.status, 404)
  })

  it('should return JSON', async () => {
    const res = await request(server, { })
      .get('/unknown')
    assert.strictEqual(res.type, 'application/json')
  })

  after(() => {
    server.close()
  })
})
