import { type IngredientMap } from './IIngredient'
import { type RowId } from './database/types'

export interface IRecipeNoId {
  name: string
  directions: string
  link: string
  ingredients: IngredientMap
}

export default interface IRecipe extends IRecipeNoId {
  id: RowId
}
