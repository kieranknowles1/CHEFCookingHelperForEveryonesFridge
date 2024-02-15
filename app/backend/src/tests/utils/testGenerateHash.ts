import assert from 'assert'

import { describe, it } from 'mocha'

import generateHash from '../../utils/generateHash'

describe('generateHash', () => {
  it('should generate a hash', async () => {
    const result = await generateHash('password')
    assert(result.length > 0)
  })

  it('should not be deterministic', async () => {
    const hash1 = await generateHash('password')
    const hash2 = await generateHash('password')
    assert(hash1 !== hash2)
  })
})
