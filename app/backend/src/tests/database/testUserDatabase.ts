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

  describe('getAvailableFridges', () => {
    it('should get the fridges available to a user', () => {
      const fridges = database.users.getAvailableFridges(1)
      assert.deepStrictEqual(fridges, [testValues.fridge])
    })

    it('should not return fridges that the user does not have access to', () => {
      const fridges = database.users.getAvailableFridges(2)
      assert.deepStrictEqual(fridges, [])
    })
  })
})
