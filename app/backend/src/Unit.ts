import type Ingredient from 'Ingredient'

// NOTE: Must match check constraint on ingredient table in schema.sql
export type MetricUnit = 'ml' | 'g'
export type DatabaseUnit = MetricUnit | 'none' | 'whole'

/**
 * Convert US units to an standardised UK cooking unit
 * // TODO: Put in reference list?
 * Source: https://annaolson.ca/baking-conversions/
 */
export function toMetric (amount: number, unit: string, ingredient: Ingredient): [number, MetricUnit] {
  switch (unit.toLowerCase()) {
    case 'c': // Cups
      return [amount * 250, 'ml']
    case 'can': // Can of milk
      return [amount * 300, 'ml']
    case 'oz': // Ounce
      return [amount * 30, 'g']
    case 'stick': // Stick of butter
      return [amount * 110, 'g']
    case 'tbsp': // Tablespoon
      return [amount * 15, 'ml']
  }
  throw new Error(`Unhandled unit ${unit} for ${ingredient.name}`)
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
  }

  throw new Error(`Unhandled conversion ${unit} to ${ingredient.preferredUnit}`)
}
