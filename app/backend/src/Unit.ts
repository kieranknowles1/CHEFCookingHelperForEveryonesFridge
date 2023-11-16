import type Ingredient from 'Ingredient'

// NOTE: Must match check constraint on ingredient table in schema.sql
export type MetricUnit = 'ml' | 'g'
export type DatabaseUnit = MetricUnit | 'none' | 'whole'

/**
 * Convert US units to an standardised UK cooking unit
 * // TODO: Put in reference list?
 * Source: https://annaolson.ca/baking-conversions/
 *
 * @returns The amount and the metric unit, or null on failure
 */
export function tryToMetric (amount: number, unit: string): [number, MetricUnit] | null {
  switch (unit.toLowerCase()) {
    // Metric
    case 'g':
    case 'gm':
    case 'gr':
    case 'grams':
      return [amount, 'g']

    case 'kg':
      return [amount * 1000, 'g']

    case 'milliliters':
    case 'ml':
      return [amount, 'ml']

    case 'liter':
      return [amount * 1000, 'ml']

    case 'cc':
      return [amount, 'ml']

    // Imperial
    case 'c': // Cups
    case 'cup':
    case 'cups':
      return [amount * 250, 'ml']
    case 'can': // Can of milk
    case 'cans':
      return [amount * 300, 'ml']
    case 'gal': // Gallon
    case 'gallon':
    case 'gallons':
      return [amount * 3800, 'ml']
    case 'lb': // Pound
    case 'lbs':
    case 'pound':
    case 'pounds':
      return [amount * 450, 'g']
    case 'ounce':
    case 'ounces':
    case 'oz':
      return [amount * 30, 'g']
    case 'pint':
    case 'pints':
    case 'pt':
      return [amount * 470, 'ml']
    case 'qt': // Quart
    case 'qts':
    case 'quart':
    case 'quarts':
      return [amount * 950, 'ml']
    case 'stick': // Stick of butter
    case 'sticks':
      return [amount * 110, 'g']
    case 'tablespoon':
    case 'tablespoons':
    case 'tbls':
    case 'tbs':
    case 'tbsb':
    case 'tbsp':
      return [amount * 15, 'ml']
    case 'teaspoon':
    case 'teaspoons':
    case 'tsp':
      return [amount * 5, 'ml']
  }
  return null
}

export function convertToPreferred (amount: number, unit: MetricUnit, ingredient: Ingredient): number {
  if (unit === ingredient.preferredUnit) {
    return amount
  }
  if (ingredient.density === null) {
    throw new Error(`Ingredient '${ingredient.name}' does not have a density specified`)
  }

  if (unit === 'ml' && ingredient.preferredUnit === 'g') {
    return amount * ingredient.density
  } else if (unit === 'g' && ingredient.preferredUnit === 'ml') {
    return amount / ingredient.density
  }

  throw new Error(`Unhandled conversion ${unit} to ${ingredient.preferredUnit}`)
}
