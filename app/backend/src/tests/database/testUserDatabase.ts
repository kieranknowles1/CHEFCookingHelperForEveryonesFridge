import assert from 'assert'

import { describe, it } from 'mocha'

import type IChefDatabase from '../../database/IChefDatabase'
import InvalidIdError from '../../database/InvalidIdError'

import createTestDatabase, { testValues } from './createTestDatabase'

describe('database/UserDatabaseImpl', () => {
  let database: IChefDatabase

  beforeEach(() => {
    ({ database } = createTestDatabase())
  })

  describe('get', () => {
    it('should get a user', () => {
      const user = database.users.get(1)
      assert.deepStrictEqual(user, testValues.user)
    })

    it('should throw if the user does not exist', () => {
      assert.throws(() => { database.users.get(314159) }, InvalidIdError)
    })
  })
})
