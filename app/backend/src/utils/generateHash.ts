import bcrypt from 'bcrypt'

import constants from '../constants'

export default async function generateHash (plaintext: string): Promise<string> {
  return await bcrypt.hash(plaintext, constants.PASSWORD_SALT_ROUNDS)
}
