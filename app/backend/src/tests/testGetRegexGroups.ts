import assert from 'assert'

import { describe, it } from 'mocha'

import getRegexGroups from '../getRegexGroups'

describe('getRegexGroups', () => {
  it('should return the groups from a match', () => {
    const match = 'test string'.match(/(?<first>\w+) (?<second>\w+)/)
    assert(match !== null)
    assert.deepStrictEqual(getRegexGroups(match), match.groups)
  })
  it('should throw an error if there are no groups', () => {
    const match = 'test string'.match(/\w+ \w+/)
    assert(match !== null)
    assert.throws(() => getRegexGroups(match))
  })
})
