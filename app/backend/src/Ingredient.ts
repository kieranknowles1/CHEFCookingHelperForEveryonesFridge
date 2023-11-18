import { type DatabaseUnit } from './Unit'
import { type RowId } from './database/types'

export type IngredientId = RowId
export interface IngredientAmount {
  amount: number | null
  originalLine: string
}
export type IngredientMap = Map<IngredientId, IngredientAmount>

export class UnparsedIngredientError extends Error {
  constructor (ingredient: Ingredient) {
    super(`Could not get amount for '${ingredient.name}'`)
  }
}

export interface IIngredient {
  name: string
  preferredUnit: DatabaseUnit
  density: number | null
  assumeUnlimited: boolean
}

export default class Ingredient implements IIngredient {
  constructor (raw: IIngredient, id: IngredientId) {
    this.id = id
    this.name = raw.name
    this.preferredUnit = raw.preferredUnit
    this.density = raw.density
    this.assumeUnlimited = raw.assumeUnlimited
  }

  id: IngredientId
  name: string
  preferredUnit: DatabaseUnit
  density: number | null
  assumeUnlimited: boolean
}

export function ingredientMapFactory (): IngredientMap {
  return new Map<IngredientId, IngredientAmount>()
}
