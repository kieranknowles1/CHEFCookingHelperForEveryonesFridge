import type IIngredient from '../types/IIngredient'

export default class UnparsedIngredientError extends Error {
  static readonly name = 'UnparsedIngredientError'
  constructor (ingredient: IIngredient, detail?: string) {
    super(`Could not get amount for '${ingredient.name}' ${detail}`)
  }
}
