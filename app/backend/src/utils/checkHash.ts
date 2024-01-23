import bcrypt from 'bcrypt'

export default async function checkHash (plaintext: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plaintext, hash)
}
