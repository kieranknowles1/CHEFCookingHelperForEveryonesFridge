import assert from 'assert'

import { describe, it } from 'mocha'

import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'

import createTestDatabase from './createTestDatabase'

describe('database/UserDatabaseImpl', () => {
  let database: IChefDatabase
  let connection: IConnection

  beforeEach(() => {
    ({ database, connection } = createTestDatabase())
  })

  describe('get', () => {
    it('should get a user', () => {
      connection.exec("INSERT INTO user (id, username) VALUES (1234, 'testy mc testface')")

      const user = database.users.get(1234)
      assert.deepStrictEqual(user, {
        id: 1234,
        name: 'testy mc testface'
      })
    })
  })
})
