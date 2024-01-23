import path from 'path'

/**
 * Application constants that should not be configurable.
 */
export default {
  API_SPEC_PATH: './api.yml',
  SQL_DUMMY_DATA_PATH: path.join(process.cwd(), 'data/dummydata.sql'),

  // Number of rounds to use for bcrypt password hashing.
  // More rounds means more secure, but slower (O(2^rounds))
  PASSWORD_SALT_ROUNDS: 12,

  // Maximum number of bytes for a password. Limited by bcrypt.
  // Longer passwords are not allowed because they would be truncated
  MAX_PASSWORD_BYTES: 72
}
