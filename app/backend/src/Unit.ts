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
    case 'grams':
      return [amount, 'g']
    // Imperial
    case 'c': // Cups
    case 'cup':
    case 'cups':
      return [amount * 250, 'ml']
    case 'can': // Can of milk
    case 'cans':
      return [amount * 300, 'ml']
    case 'gal': // Gallon
      return [amount * 3800, 'ml']
    case 'lb': // Pound
      return [amount * 450, 'g']
    case 'oz': // Ounce
    case 'ounce':
    case 'ounces':
      return [amount * 30, 'g']
    case 'pt': // Pint
      return [amount * 470, 'ml']
    case 'qt': // Quart
    case 'quart':
    case 'quarts':
      return [amount * 950, 'ml']
    case 'stick': // Stick of butter
    case 'sticks':
      return [amount * 110, 'g']
    case 'tbsp': // Tablespoon
    case 'tablespoon':
    case 'tablespoons':
      return [amount * 15, 'ml']
    case 'tsp': // Teaspoon
    case 'teaspoon':
    case 'teaspoons':
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
