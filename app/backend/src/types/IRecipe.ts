import { type RowId } from '../database/types'

import { type IngredientMap } from './IIngredient'

export interface IRecipeNoId {
  name: string
  directions: string
  link: string
  ingredients: IngredientMap
}

export default interface IRecipe extends IRecipeNoId {
  id: RowId
}