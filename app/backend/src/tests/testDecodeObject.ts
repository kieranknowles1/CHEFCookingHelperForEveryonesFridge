import assert from 'assert'

import * as t from 'io-ts'
import { describe, it } from 'mocha'

import decodeObject from '../decodeObject'

describe('decodeObject', () => {
  it('should decode valid object', () => {
    const obj = { a: 1, b: '2' }
    const type = t.type({
      a: t.number,
      b: t.string
    })
    const decoded = decodeObject(type, obj)
    assert.deepStrictEqual(decoded, obj)
  })

  it('should throw on invalid object', () => {
    const obj = { a: 1, b: 2 }
    const type = t.type({
      a: t.number,
      // Number in obj instead of string
      b: t.string
    })
    assert.throws(() => decodeObject(type, obj))
  })
})
