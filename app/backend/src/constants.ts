import path from 'path'

import { type Algorithm } from 'jsonwebtoken'

/**
 * Application constants that should not be configurable.
 */
export default {
  API_SPEC_PATH: './api.yml',
  SQL_DUMMY_DATA_PATH: path.join(process.cwd(), 'data/dummydata.sql'),
  SQL_INITIAL_DATA_PATH: path.join(process.cwd(), 'data/initialdata.sql'),

  // Number of rounds to use for bcrypt password hashing.
  // More rounds means more secure, but slower (O(2^rounds))
  PASSWORD_SALT_ROUNDS: 12,

  // Maximum number of bytes for a password. Limited by bcrypt.
  // Longer passwords are not allowed because they would be truncated
  MAX_PASSWORD_BYTES: 72,

  // Need a type assertion here as this is an object literal. This is safe in this case.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  JWT_ALGORITHM: 'HS256' as Algorithm
}
