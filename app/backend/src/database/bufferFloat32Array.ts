/**
 * Convert a Buffer to a Float32Array
 * Required so that the buffer is correctly parsed as an array of raw floats, not an array of 8-bit integers.
 */
export function bufferToFloat32Array (buffer: Buffer): Float32Array {
  return new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Float32Array.BYTES_PER_ELEMENT)
}

/**
 * Convert a Float32Array to a Buffer
 */
export function bufferFromFloat32Array (array: Float32Array): Buffer {
  return Buffer.from(array.buffer, array.byteOffset, array.byteLength)
}
