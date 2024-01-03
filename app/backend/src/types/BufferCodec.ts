import * as t from 'io-ts'

/**
 * io-ts codec for a Buffer
 */
export default new t.Type<Buffer, Buffer, unknown>(
  'Buffer',
  (input: unknown): input is Buffer => Buffer.isBuffer(input),
  (input: unknown, context: t.Context) => Buffer.isBuffer(input) ? t.success(input) : t.failure(input, context),
  t.identity
)
