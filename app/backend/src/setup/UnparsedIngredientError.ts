import type Ingredient from '../types/Ingredient'

export default class UnparsedIngredientError extends Error {
  static readonly name = 'UnparsedIngredientError'
  constructor (ingredient: Ingredient, detail?: string) {
    super(`Could not get amount for '${ingredient.name}' ${detail}`)
  }
}
