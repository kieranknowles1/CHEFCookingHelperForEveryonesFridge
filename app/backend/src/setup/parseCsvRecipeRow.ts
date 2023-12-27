import getDatabase from '../database/getDatabase'

import type IParsedCsvRecipe from './IParsedCsvRecipe'
import type IRawCsvRecipe from './IRawCsvRecipe'
import parseIngredients from './parseIngredients'

export default function parseCsvRecipeRow (row: IRawCsvRecipe): IParsedCsvRecipe {
  const directionsArray = JSON.parse(row.directions) as string[]
  const directions = directionsArray.join('\n')
  const ingredients = parseIngredients(row)

  if (ingredients.size === 0) throw new Error('No ingredients found')
  // All ingredients unlimited, probably an import error
  let foundFinite = false
  for (const id of ingredients.keys()) {
    const ingredient = getDatabase().getIngredient(id)
    if (!ingredient.assumeUnlimited) foundFinite = true
  }

  if (!foundFinite) throw new Error('All ingredients unlimited, probably a scraping error')

  return {
    name: row.title,
    directions,
    link: row.link,
    ingredients
  }
}
