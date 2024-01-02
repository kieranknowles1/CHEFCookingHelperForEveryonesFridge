import assert from 'assert'

import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

describe('404', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  it('should return 404 for unknown path', async () => {
    const res = await request(app.server, { })
      .get('/unknown')
    assert.strictEqual(res.status, 404)
  })

  it('should return JSON', async () => {
    const res = await request(app.server, { })
      .get('/unknown')
    assert.strictEqual(res.type, 'application/json')
  })

  after(() => {
    app.server.close()
  })
})
