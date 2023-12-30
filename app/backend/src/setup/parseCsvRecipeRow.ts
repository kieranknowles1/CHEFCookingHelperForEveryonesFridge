import type CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import type IIngredient from '../types/IIngredient'

import type IParsedCsvRecipe from './IParsedCsvRecipe'
import type IRawCsvRecipe from './IRawCsvRecipe'
import parseIngredients from './parseIngredients'

export default function parseCsvRecipeRow (row: IRawCsvRecipe, allIngredients: CaseInsensitiveMap<IIngredient>): IParsedCsvRecipe {
  const directionsArray = JSON.parse(row.directions) as string[]
  const directions = directionsArray.join('\n')
  const ingredients = parseIngredients(row, allIngredients)

  if (ingredients.length === 0) throw new Error('No ingredients found')
  // All ingredients unlimited, probably an import error
  let foundFinite = false
  for (const entry of ingredients.values()) {
    if (!entry.ingredient.assumeUnlimited) foundFinite = true
  }

  if (!foundFinite) throw new Error('All ingredients unlimited, probably a scraping error')

  return {
    name: row.title,
    directions,
    link: row.link,
    ingredients: new Map(ingredients.map(e => [
      e.ingredient.id,
      { amount: e.amount, originalLine: e.originalLine }
    ]))
  }
}
