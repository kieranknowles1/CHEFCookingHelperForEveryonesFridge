import { type RowId } from '../database/types'

import { type DatabaseUnit } from './Unit'

export type IngredientId = RowId
export interface IngredientAmount {
  amount: number | null
  originalLine: string
}
export type IngredientMap = Map<IngredientId, IngredientAmount>

export default interface IIngredient {
  id: IngredientId
  name: string
  preferredUnit: DatabaseUnit
  density: number | undefined
  assumeUnlimited: boolean
}

export function ingredientMapFactory (): IngredientMap {
  return new Map<IngredientId, IngredientAmount>()
}
