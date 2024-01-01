import Fraction from 'fraction.js'

import { convertToPreferred, tryToMetric } from '../types/Unit'
import type CaseInsensitiveMap from '../types/CaseInsensitiveMap'
import type Ingredient from '../types/Ingredient'
import { type IngredientAmount } from '../types/Ingredient'
import assertNotNull from '../assertNotNull'
import logger from '../logger'

import type RawCsvRecipe from './RawCsvRecipe'
import UnparsedIngredientError from './UnparsedIngredientError'

const AMOUNT_PATTERN = /(?<amount>\d+\/\d+|\d+ \d+\/\d+|\d+)( (level|heaping|heaped|round|rounded))? (?<unit>\w+)/g

function amountFromMatch (match: RegExpMatchArray): number {
  assertNotNull(match.groups)
  return new Fraction(match.groups.amount).valueOf()
}

function convertUnit (ingredientLine: string, ingredient: Ingredient): number {
  const matches = Array.from(ingredientLine.matchAll(AMOUNT_PATTERN))

  if (matches.length === 0) { throw new UnparsedIngredientError(ingredient, ingredientLine) }

  if (ingredient.preferredUnit === 'whole') {
    // Nothing to do
    return amountFromMatch(matches[0])
  } else {
    // Convert to metric
    // Handle cases such as '1 to 2 tsp' by trying every match and using the first one that works
    for (const match of matches) {
      const amount = amountFromMatch(match)
      assertNotNull(match.groups)
      const unit = match.groups.unit
      const converted = tryToMetric(amount, unit)
      if (converted !== null) {
        return convertToPreferred(converted[0], converted[1], ingredient)
      }
    }
    // No case was handled, throw error
    // This is a higher priority, so also log more detail
    logger.warn(`Could not convert '${ingredientLine}' to metric.`)
    throw new UnparsedIngredientError(ingredient)
  }
}

function getAmount (originalName: string, ingredient: Ingredient, amounts: string[]): IngredientAmount {
  if (ingredient.preferredUnit === 'none') {
    return {
      amount: null,
      originalLine: originalName
    }
  }

  const nameLower = originalName.toLowerCase()
  const found = amounts.find(e => e.toLowerCase().includes(nameLower))

  if (found === undefined) { throw new UnparsedIngredientError(ingredient) }
  return {
    amount: convertUnit(found, ingredient),
    originalLine: found
  }
}

interface IngredientEntry {
  ingredient: Ingredient
  amount: number | null
  originalLine: string
}

export default function parseIngredients (row: RawCsvRecipe, ingredients: CaseInsensitiveMap<Ingredient>): IngredientEntry[] {
  const entries: IngredientEntry[] = []

  // NER contains names, ingredients contains names and amounts
  const names = JSON.parse(row.NER) as string[]
  const amounts = JSON.parse(row.ingredients) as string[]

  for (const originalName of names) {
    const ingredient = ingredients.get(originalName)
    if (ingredient === undefined) {
      throw new Error(`Ingredient ${originalName} does not exist in database`)
    }
    entries.push({
      ingredient,
      amount: getAmount(originalName, ingredient, amounts).amount,
      originalLine: originalName
    })
  }

  return entries
}
