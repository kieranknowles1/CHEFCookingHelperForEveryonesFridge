import type Tag from './Tag'

export default interface User {
  id: number
  name: string

  // ID -> tag
  bannedTags: Map<number, Tag>
  // ID -> name
  bannedIngredients: Map<number, string>
}

export interface UserCredentials {
  id: number
  name: string
  passwordHash: string
}
