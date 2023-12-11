import type IIngredient from '../types/IIngredient'

export default class UnparsedIngredientError extends Error {
  constructor (ingredient: IIngredient, detail?: string) {
    super(`Could not get amount for '${ingredient.name}' ${detail}`)
  }
}
