import CiMap from '@glossa-glo/case-insensitive-map'
import type ICsvRecipeRow from './ICsvRecipeRow.js'
import Fraction from 'fraction.js'

import { type DatabaseUnit, tryToMetric, convertToPreferred } from './Unit'
import ChefDatabase from './ChefDatabase'
import logger, { LogLevel } from './logger'

export type IngredientId = number
export interface IngredientAmount {
  amount: number | null
  originalLine: string
}
export type IngredientMap = CiMap<IngredientId, IngredientAmount>

const AMOUNT_PATTERN = /(\d+\/\d+|\d+ \d+\/\d+|\d+) (\w+)/g

export class UnparsedIngredientError extends Error {
  constructor (ingredient: Ingredient) {
    super(`Could not get amount for '${ingredient.name}'`)
  }
}

export interface IIngredient {
  name: string
  preferredUnit: DatabaseUnit
  density: number | null
  assumeUnlimited: boolean
}

export default class Ingredient implements IIngredient {
  private static amountFromMatch (match: RegExpMatchArray): number {
    return new Fraction(match[1]).valueOf()
  }

  private static convertUnit (originalName: string, ingredientLine: string, ingredient: Ingredient, amounts: string[]): number {
    const matches = Array.from(ingredientLine.matchAll(AMOUNT_PATTERN))

    if (matches.length === 0) { throw new UnparsedIngredientError(ingredient) }

    if (ingredient.preferredUnit === 'whole') {
      // Nothing to do
      return this.amountFromMatch(matches[0])
    } else {
      // Convert to metric
      // Handle cases such as '1 to 2 tsp' by trying every match and using the first one that works
      for (const match of matches) {
        const amount = this.amountFromMatch(match)
        const unit = match[2]
        const converted = tryToMetric(amount, unit)
        if (converted !== null) {
          return convertToPreferred(converted[0], converted[1], ingredient)
        }
      }
      // No case was handled, throw error
      // This is a higher priority, so also log more detail
      logger.log(LogLevel.warn, `Could not convert '${ingredientLine}' to metric.`)
      throw new UnparsedIngredientError(ingredient)
    }
  }

  private static getAmount (originalName: string, ingredient: Ingredient, amounts: string[]): IngredientAmount {
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
      amount: this.convertUnit(originalName, found, ingredient, amounts),
      originalLine: found
    }
  }

  static parseCsvRow (row: ICsvRecipeRow): IngredientMap {
    const map = ingredientMapFactory()

    // NER contains names, ingredients contains names and amounts
    const names = JSON.parse(row.NER) as string[]
    const amounts = JSON.parse(row.ingredients) as string[]

    for (const originalName of names) {
      const ingredient = ChefDatabase.Instance.findIngredientByName(originalName)
      if (ingredient === null) {
        throw new Error(`Ingredient ${originalName} does not exist in database`)
      }
      map.set(ingredient.id, this.getAmount(originalName, ingredient, amounts))
    }

    return map
  }

  constructor (raw: IIngredient, id: IngredientId) {
    this.id = id
    this.name = raw.name
    this.preferredUnit = raw.preferredUnit
    this.density = raw.density
    this.assumeUnlimited = raw.assumeUnlimited
  }

  id: IngredientId
  name: string
  preferredUnit: DatabaseUnit
  density: number | null
  assumeUnlimited: boolean
}

export function ingredientMapFactory (): IngredientMap {
  return new CiMap<IngredientId, IngredientAmount>()
}
