import assert from 'assert'

import { describe, it } from 'mocha'
import { error } from 'express-openapi-validator'
import { faker } from '@faker-js/faker'

import decodeBasicAuth from '../../utils/decodeBasicAuth'

function createHeader (username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`
}

describe('decodeBasicAuth', () => {
  it('should decode a basic auth header', () => {
    const result = decodeBasicAuth(createHeader('user', 'pass'))
    assert.deepStrictEqual(result, { username: 'user', password: 'pass' })
  })

  it('should not accept different auth types', () => {
    assert.throws(() => decodeBasicAuth('Bearer token'), error.Unauthorized)
  })

  it('should not accept a malformed header', () => {
    const encoded = btoa('something_with_no_colon')
    assert.throws(() => decodeBasicAuth(`Basic ${encoded}`), error.Unauthorized)
  })

  it('should not accept a malformed base64 string', () => {
    const badStr = 'not_base64'
    assert.throws(() => decodeBasicAuth(`Basic ${badStr}`), error.Unauthorized)
  })

  it('should not accept a password that is too long to hash', () => {
    const longPassword = faker.lorem.words(100)
    assert.throws(() => decodeBasicAuth(createHeader('user', longPassword)), error.BadRequest)
  })
})
