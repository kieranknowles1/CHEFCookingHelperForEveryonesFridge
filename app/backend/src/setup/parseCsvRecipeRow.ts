import { type IRecipeNoId } from '../types/IRecipe'

import type ICsvRecipeRow from './ICsvRecipeRow'
import parseIngredients from './parseIngredients'

export default function parseCsvRecipeRow (row: ICsvRecipeRow): IRecipeNoId {
  const directionsArray = JSON.parse(row.directions) as string[]
  const directions = directionsArray.join('\n')
  const ingredients = parseIngredients(row)
  return {
    name: row.title,
    directions,
    link: row.link,
    ingredients
  }
}
