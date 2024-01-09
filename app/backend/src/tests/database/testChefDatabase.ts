import assert from 'assert'

import { describe, it } from 'mocha'

import type IChefDatabase from '../../database/IChefDatabase'
import type IConnection from '../../database/IConnection'
import { type IWritableDatabase } from '../../database/IChefDatabase'

import createTestDatabase from './createTestDatabase'

const embedded = { sentence: 'test', embedding: Float32Array.from([1, 2, 3]) }

describe('database/ChefDatabaseImpl', () => {
  let connection: IConnection
  let database: IChefDatabase
  beforeEach(() => {
    ({ connection, database } = createTestDatabase())
  })

  describe('checkIntegrity', () => {
    it('should succeed for a valid database', () => {
      database.checkIntegrity()
      assert.ok(true)
    })

    it('should fail for a database with foreign key errors', () => {
      connection.exec('PRAGMA foreign_keys = OFF')
      database.wrapTransaction(writable => {
        writable.setIngredientAmount(123, 123, 123)
      })
      connection.exec('PRAGMA foreign_keys = ON')

      assert.throws(() => { database.checkIntegrity() })
    })
  })

  describe('wrapTransaction', () => {
    it('should wrap a transaction', () => {
      database.wrapTransaction(writable => {
        writable.addEmbedding(embedded)
      })
      assert.deepStrictEqual(database.getEmbedding(embedded.sentence), embedded)
    })

    it('should rollback and rethrow on error', () => {
      assert.throws(() => {
        database.wrapTransaction(writable => {
          writable.addEmbedding(embedded)
          throw new Error('test')
        })
      }, /test/)
      assert.deepStrictEqual(database.getEmbedding('test'), null)
    })

    it('should invalidate the writable after commit', () => {
      let writable: IWritableDatabase
      database.wrapTransaction(w => {
        writable = w
      })
      assert.throws(() => { writable.addEmbedding(embedded) })
    })
  })
})
