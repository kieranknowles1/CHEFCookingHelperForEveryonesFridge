import { type DatabaseUnit } from '../Unit'

// NOTE: This should technically be `number | bigint`, but openapi-typescript generates `number` for `integer`
// Using `number` here saves on casting
export type RowId = number
export type GetResult<TRow> = TRow | undefined
export type AllResult<TRow> = TRow[]

export interface IIngredientRow {
  id: RowId
  name: string
  preferredUnit: DatabaseUnit
  density: number | null
  assumeUnlimited: number
}

export interface IRecipeRow {
  id: RowId
  name: string
  directions: string
  link: string
}

export interface IRecipeIngredientRow {
  recipe_id: RowId
  ingredient_id: RowId

  amount: number | null
  original_line: string
}

export interface IFridgeIngredientRow {
  fridge_id: RowId
  ingredient_id: RowId

  amount: number
}
