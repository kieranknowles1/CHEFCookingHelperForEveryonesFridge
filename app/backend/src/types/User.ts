export default interface User {
  id: number
  name: string

  // ID -> name
  bannedTags: Map<number, string>
  // ID -> name
  bannedIngredients: Map<number, string>
}
