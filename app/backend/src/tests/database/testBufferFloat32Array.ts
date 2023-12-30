import assert from 'assert'

import { describe, it } from 'mocha'
import { faker } from '@faker-js/faker'

import { bufferFromFloat32Array, bufferToFloat32Array } from '../../database/bufferFloat32Array'

describe('bufferFloat32Array', () => {
  it('should convert a Float32Array to a Buffer and back without changes', () => {
    const input = Float32Array.from({ length: 10 }, () => faker.number.float({ min: 0, max: 1 }))

    const buffer = bufferFromFloat32Array(input)

    const output = bufferToFloat32Array(buffer)

    assert.deepStrictEqual(output, input)
  })
})
