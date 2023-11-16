import { type IngredientMap } from './Ingredient'
import type ICsvRecipeRow from './ICsvRecipeRow'
import parseIngredients from './parseIngredients'

export interface IRecipe {
  name: string
  directions: string
  link: string
  ingredients: IngredientMap
}

export default class Recipe implements IRecipe {
  public static fromCsvRow (row: ICsvRecipeRow): Recipe {
    return new Recipe(row)
  }

  private constructor (row: ICsvRecipeRow) {
    this.name = row.title
    const directionsArray = JSON.parse(row.directions) as string[]
    this.directions = directionsArray.join('\n')
    this.link = row.link

    this.ingredients = parseIngredients(row)
  }

  name: string
  directions: string
  link: string

  ingredients: IngredientMap
}
