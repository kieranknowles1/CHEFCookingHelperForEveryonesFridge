import assert from 'assert'

import { describe, it } from 'mocha'

import assertNotNull from '../assertNotNull'

describe('assertNotNull', () => {
  it('should throw if given null', () => {
    assert.throws(() => { assertNotNull(null) })
  })

  it('should throw if given undefined', () => {
    assert.throws(() => { assertNotNull(undefined) })
  })

  it('should not throw if given a value', () => {
    assert.doesNotThrow(() => { assertNotNull(1) })
  })
})
