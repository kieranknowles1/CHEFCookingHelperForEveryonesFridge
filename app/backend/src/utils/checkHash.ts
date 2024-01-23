import bcrypt from 'bcrypt'

export default async function checkHash (plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}
