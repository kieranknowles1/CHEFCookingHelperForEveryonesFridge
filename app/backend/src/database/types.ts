import { type DatabaseUnit } from '../types/Unit'

// NOTE: This should technically be `number | bigint`, but openapi-typescript generates `number` for `integer`
// Using `number` here saves on casting
export type RowId = number

export interface IEmbeddingRow {
  sentence: string
  embedding: Buffer
}

export interface IIngredientRow {
  id: RowId
  name: string
  preferredUnit: DatabaseUnit
  density: number | null
  assumeUnlimited: number
}

export interface IMealTypeRow {
  id: RowId
  name: string
}

export interface IRecipeRow {
  id: RowId
  name: string
  directions: string
  link: string
  meal_type_id: RowId
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

export interface IBarcodeRow {
  code: RowId
  ingredient_id: RowId

  product_name: string
  amount: number
}
