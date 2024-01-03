import assert from 'assert'

import { describe, it } from 'mocha'

import CaseInsensitiveSet from '../../types/CaseInsensitiveSet'

describe('CaseInsensitiveSet', () => {
  describe('add', () => {
    it('should add a value', () => {
      const set = new CaseInsensitiveSet()
      set.add('a')
      assert.strictEqual(set.has('a'), true)
    })

    it('should replace a value that differs only in case', () => {
      const set = new CaseInsensitiveSet()
      set.add('a')
      set.add('A')
      assert.strictEqual(set.has('a'), true)
      assert.strictEqual(set.size, 1)
    })
  })

  describe('delete', () => {
    it('should delete a value', () => {
      const set = new CaseInsensitiveSet()
      set.add('a')
      set.delete('a')
      assert.strictEqual(set.has('a'), false)
    })

    it('should delete a value that differs only in case', () => {
      const set = new CaseInsensitiveSet()
      set.add('a')
      set.delete('A')
      assert.strictEqual(set.has('a'), false)
    })

    it('should return false if the value did not exist', () => {
      const set = new CaseInsensitiveSet()
      assert.strictEqual(set.delete('a'), false)
    })
  })

  describe('has', () => {
    it('should return true if the value exists', () => {
      const set = new CaseInsensitiveSet()
      set.add('a')
      assert.strictEqual(set.has('a'), true)
    })

    it('should return true if the value differs only in case', () => {
      const set = new CaseInsensitiveSet()
      set.add('a')
      assert.strictEqual(set.has('A'), true)
    })

    it('should return false if the value does not exist', () => {
      const set = new CaseInsensitiveSet()
      assert.strictEqual(set.has('a'), false)
    })
  })
})
