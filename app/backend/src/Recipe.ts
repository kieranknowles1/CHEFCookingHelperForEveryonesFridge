import { type IngredientMap } from './Ingredient'

export interface IRecipe {
  name: string
  directions: string
  link: string
  ingredients: IngredientMap
}

export default class Recipe implements IRecipe {
  public constructor (raw: IRecipe) {
    this.name = raw.name
    this.directions = raw.directions
    this.link = raw.link
    this.ingredients = raw.ingredients
  }

  name: string
  directions: string
  link: string
  ingredients: IngredientMap
}
