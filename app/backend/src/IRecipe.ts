import { type IngredientMap } from './IIngredient'

export default interface IRecipe {
  name: string
  directions: string
  link: string
  ingredients: IngredientMap
}
