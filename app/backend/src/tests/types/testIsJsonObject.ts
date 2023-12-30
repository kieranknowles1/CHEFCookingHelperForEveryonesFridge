import assert from 'assert'

import { describe, it } from 'mocha'

import { isJsonObject } from '../../types/isJsonObject'

describe('isJsonObject', () => {
  it('should return true for an empty object', () => {
    assert.strictEqual(isJsonObject({}), true)
  })
  it('should return true for an object with string keys', () => {
    assert.strictEqual(isJsonObject({ a: 1, b: 2 }), true)
  })
  it('should return false for a non-object', () => {
    assert.strictEqual(isJsonObject([1, 2, 3]), false)
  })
  it('should return false for null', () => {
    assert.strictEqual(isJsonObject(null), false)
  })
  it('should return false for undefined', () => {
    assert.strictEqual(isJsonObject(undefined), false)
  })
})
