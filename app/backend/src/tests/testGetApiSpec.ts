import assert from 'assert'

import { describe, it } from 'mocha'

import getApiSpec from '../getApiSpec'

const VALID_SPEC = `
openapi: '3.0.0'
title: Test API
info:
  version: 1.0.0
  title: Test API
  description: A test API
paths:
  /test:
    get:
      summary: Test endpoint
      responses:
        '200':
          description: OK
`

const INVALID_SPEC = `
---
 - This is an array
 - Arrays are not allowed
`

const BAD_YAML = `
---
openapi: '3.0.0'
title: Test API
info: {
`

describe('getApiSpec', () => {
  it('should accept a YAML object', () => {
    const spec = getApiSpec(VALID_SPEC)
    assert.strictEqual(spec.openapi, '3.0.0')
  })
  it('should reject a non-object', () => {
    assert.throws(() => getApiSpec(INVALID_SPEC))
  })
  it('should reject an invalid YAML string', () => {
    assert.throws(() => getApiSpec(BAD_YAML))
  })
})
