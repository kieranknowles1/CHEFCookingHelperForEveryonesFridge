import Fraction from 'fraction.js'

import { type IngredientAmount, type IngredientMap, ingredientMapFactory } from '../types/IIngredient'
import { convertToPreferred, tryToMetric } from '../types/Unit'
import type IIngredient from '../types/IIngredient'
import getDatabase from '../database/getDatabase'
import getRegexGroups from '../getRegexGroups'
import logger from '../logger'

import type IRawCsvRecipe from './IRawCsvRecipe'
import UnparsedIngredientError from './UnparsedIngredientError'

const AMOUNT_PATTERN = /(?<amount>\d+\/\d+|\d+ \d+\/\d+|\d+)( (level|heaping|heaped|round|rounded))? (?<unit>\w+)/g

function amountFromMatch (match: RegExpMatchArray): number {
  return new Fraction(getRegexGroups(match).amount).valueOf()
}

function convertUnit (ingredientLine: string, ingredient: IIngredient): number {
  const matches = Array.from(ingredientLine.matchAll(AMOUNT_PATTERN))

  if (matches.length === 0) { throw new UnparsedIngredientError(ingredient) }

  if (ingredient.preferredUnit === 'whole') {
    // Nothing to do
    return amountFromMatch(matches[0])
  } else {
    // Convert to metric
    // Handle cases such as '1 to 2 tsp' by trying every match and using the first one that works
    for (const match of matches) {
      const amount = amountFromMatch(match)
      const unit = getRegexGroups(match).unit
      const converted = tryToMetric(amount, unit)
      if (converted !== null) {
        return convertToPreferred(converted[0], converted[1], ingredient)
      }
    }
    // No case was handled, throw error
    // This is a higher priority, so also log more detail
    logger.warning(`Could not convert '${ingredientLine}' to metric.`)
    throw new UnparsedIngredientError(ingredient)
  }
}

function getAmount (originalName: string, ingredient: IIngredient, amounts: string[]): IngredientAmount {
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

export default function parseIngredients (row: IRawCsvRecipe): IngredientMap {
  const map = ingredientMapFactory()

  // NER contains names, ingredients contains names and amounts
  const names = JSON.parse(row.NER) as string[]
  const amounts = JSON.parse(row.ingredients) as string[]

  for (const originalName of names) {
    const ingredient = getDatabase().findIngredientByName(originalName)
    if (ingredient === null) {
      throw new Error(`Ingredient ${originalName} does not exist in database`)
    }
    map.set(ingredient.id, getAmount(originalName, ingredient, amounts))
  }

  return map
}
