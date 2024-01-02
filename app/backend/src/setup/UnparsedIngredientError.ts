import type Ingredient from '../types/Ingredient'

import DataImportError from './DataImportError'

export default class UnparsedIngredientError extends DataImportError {
  constructor (ingredient: Ingredient, detail?: string) {
    super(`Could not get amount for '${ingredient.name}' ${detail ?? ''}`, detail)
    this.name = UnparsedIngredientError.name
  }
}
