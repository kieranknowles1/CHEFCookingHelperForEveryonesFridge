import assert from 'assert'

// Need to register the tfjs backend for the sqlite extension to work
import '@tensorflow/tfjs'

import { describe, it } from 'mocha'
import { faker } from '@faker-js/faker'

import SqliteConnection from '../../database/SqliteConnection'
import { bufferFromFloat32Array } from '../../database/bufferFloat32Array'
import extendDatabase from '../../ml/extendDatabase'

/**
 * Allow a bit of tolerance for floating point errors
 */
function fuzzyEqual (a: number, b: number, epsilon = 0.0001): boolean {
  return Math.abs(a - b) < epsilon
}

function fakeEmbedding (): Buffer {
  const array = Float32Array.from({ length: 512 }, () => faker.number.float({ min: 0, max: 1 }))
  return bufferFromFloat32Array(array)
}

describe('ml/extendDatabase', function () {
  let db: SqliteConnection
  before(function () {
    db = new SqliteConnection(':memory:')
    extendDatabase(db)
  })

  describe('ml_similarity', function () {
    it('should return 1 for identical embeddings', function () {
      const buffer = fakeEmbedding()
      const statement = db.prepare<{ sim: number }>('SELECT ml_similarity(:b1, :b2) AS sim')
      const result = statement.get({ b1: buffer, b2: buffer })?.sim

      assert(result !== undefined)
      assert(fuzzyEqual(result, 1))
    })

    it('should fail if the embeddings are not blobs', function () {
      const statement = db.prepare<{ sim: number }>('SELECT ml_similarity(:b1, :b2) AS sim')
      assert.throws(() => statement.get({ b1: 'a', b2: 'b' }))
    })

    it('should fail if the embeddings are not the same length', function () {
      const statement = db.prepare<{ sim: number }>('SELECT ml_similarity(:b1, :b2) AS sim')
      const buffer1 = fakeEmbedding()
      const buffer2 = fakeEmbedding().subarray(0, 123)
      assert.throws(() => statement.get({ b1: buffer1, b2: buffer2 }))
    })

    it('should be symmetric', function () {
      const buffer1 = fakeEmbedding()
      const buffer2 = fakeEmbedding()
      const statement = db.prepare<{ sim: number }>('SELECT ml_similarity(:b1, :b2) AS sim')

      const result1 = statement.get({ b1: buffer1, b2: buffer2 })?.sim
      const result2 = statement.get({ b1: buffer2, b2: buffer1 })?.sim

      assert(result1 !== undefined)
      assert(result2 !== undefined)
      assert(fuzzyEqual(result1, result2))
    })
  })
})
