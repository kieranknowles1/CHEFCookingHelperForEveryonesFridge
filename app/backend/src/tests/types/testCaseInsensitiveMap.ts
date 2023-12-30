import assert from 'assert'

import { describe, it } from 'mocha'

import CaseInsensitiveMap from '../../types/CaseInsensitiveMap'

describe('CaseInsensitiveMap', () => {
  describe('set', () => {
    it('should set a value', () => {
      const map = new CaseInsensitiveMap()
      map.set('a', 1)
      assert.strictEqual(map.get('a'), 1)
    })
    it('should replace a value that differs only in case', () => {
      const map = new CaseInsensitiveMap()
      map.set('a', 1)
      map.set('A', 2)
      assert.strictEqual(map.get('a'), 2)
      assert.strictEqual(map.size, 1)
    })
  })

  describe('get', () => {
    let map: CaseInsensitiveMap<number>
    beforeEach(() => {
      map = new CaseInsensitiveMap()
      map.set('a', 1)
    })
    it('should get a value', () => {
      assert.strictEqual(map.get('a'), 1)
    })
    it('should get a value that differs only in case', () => {
      assert.strictEqual(map.get('A'), 1)
    })
    it('should return undefined for a non-existent key', () => {
      assert.strictEqual(map.get('b'), undefined)
    })
  })

  describe('has', () => {
    let map: CaseInsensitiveMap<number>
    beforeEach(() => {
      map = new CaseInsensitiveMap()
      map.set('a', 1)
    })
    it('should return true for an existing key', () => {
      assert.strictEqual(map.has('a'), true)
    })
    it('should return true for a key that differs only in case', () => {
      assert.strictEqual(map.has('A'), true)
    })
    it('should return false for a non-existent key', () => {
      assert.strictEqual(map.has('b'), false)
    })
  })
})
