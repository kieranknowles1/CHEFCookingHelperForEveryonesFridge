import assert from 'assert'

import { describe, it } from 'mocha'
import request from 'supertest'

import createTestApp, { type TestApp } from './createTestApp'

function makeRequest (app: TestApp, fridgeId: number, recipeId: number): request.Test {
  return request(app.server)
    .post(`/api/v1/fridge/${fridgeId}/recipe/${recipeId}/maderecipe?users=1&users=2`)
    .set({ Authorization: app.authHeaderValue })
}

describe('POST /fridge/:fridgeId/recipe/:recipeId/maderecipe', () => {
  let app: TestApp
  before(() => {
    app = createTestApp()
  })

  after(() => {
    app.server.close()
  })

  it('should return 204', async () => {
    await makeRequest(app, 1, 1)
      .expect(204)
  })

  it('should add exactly one row to the made_recipes table', async () => {
    function getRowCount (): number {
      const limit = 1024
      const count = app.db.users.getHistory({ userId: 1, recipeId: 1, limit }).length
      // Should never happen in practice since we use dummy data in tests. Just a sanity check.
      assert(count < limit, 'Row count is at requested limit')

      return count
    }
    const initialRowCount = getRowCount()

    await makeRequest(app, 1, 1)
      .expect(204)

    const finalRowCount = getRowCount()
    const diff = finalRowCount - initialRowCount
    assert.strictEqual(diff, 1, `Expected 1 row to be added, but ${diff} rows were added`)
  })
})
