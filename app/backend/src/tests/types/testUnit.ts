import assert from 'assert'

import { describe, it } from 'mocha'

import { convertToPreferred, tryToMetric } from '../../types/Unit'
import type IIngredient from '../../types/IIngredient'
import UnparsedIngredientError from '../../setup/UnparsedIngredientError'

describe('Unit', () => {
  describe('tryToMetric', () => {
    context('with a metric unit', () => {
      it('should keep grams as grams', () => {
        assert.deepStrictEqual(tryToMetric(1, 'g'), [1, 'g'])
        assert.deepStrictEqual(tryToMetric(1, 'gm'), [1, 'g'])
        assert.deepStrictEqual(tryToMetric(1, 'gms'), [1, 'g'])
        assert.deepStrictEqual(tryToMetric(1, 'gr'), [1, 'g'])
        assert.deepStrictEqual(tryToMetric(1, 'grams'), [1, 'g'])
      })
      it('should be case insensitive', () => {
        assert.deepStrictEqual(tryToMetric(1, 'G'), [1, 'g'])
      })
      it('should convert kilograms to grams', () => {
        assert.deepStrictEqual(tryToMetric(2, 'kg'), [2000, 'g'])
      })

      it('should keep milliliters as milliliters', () => {
        assert.deepStrictEqual(tryToMetric(1, 'milliliters'), [1, 'ml'])
        assert.deepStrictEqual(tryToMetric(1, 'ml'), [1, 'ml'])
      })
      it('should convert liters to milliliters', () => {
        assert.deepStrictEqual(tryToMetric(2, 'liter'), [2000, 'ml'])
      })
      it('should convert cubic centimeters to milliliters', () => {
        assert.deepStrictEqual(tryToMetric(2, 'cc'), [2, 'ml'])
      })

      context('with an imperial unit', () => {
        it('should convert cups to milliliters', () => {
          assert.deepStrictEqual(tryToMetric(2, 'c'), [500, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'cup'), [500, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'cups'), [500, 'ml'])
        })
        it('should convert cans to milliliters', () => {
          assert.deepStrictEqual(tryToMetric(2, 'can'), [800, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'cans'), [800, 'ml'])
        })
        it('should convert dozens to whole', () => {
          assert.deepStrictEqual(tryToMetric(2, 'doz'), [24, 'whole'])
          assert.deepStrictEqual(tryToMetric(2, 'dozen'), [24, 'whole'])
        })
        it('should convert gallons to milliliters', () => {
          assert.deepStrictEqual(tryToMetric(2, 'gal'), [7600, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'gallon'), [7600, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'gallons'), [7600, 'ml'])
        })
        it('should convert pounds to grams', () => {
          assert.deepStrictEqual(tryToMetric(2, 'lb'), [900, 'g'])
          assert.deepStrictEqual(tryToMetric(2, 'lbs'), [900, 'g'])
          assert.deepStrictEqual(tryToMetric(2, 'pound'), [900, 'g'])
          assert.deepStrictEqual(tryToMetric(2, 'pounds'), [900, 'g'])
        })
        it('should convert ounces to grams', () => {
          assert.deepStrictEqual(tryToMetric(2, 'ounce'), [60, 'g'])
          assert.deepStrictEqual(tryToMetric(2, 'ounces'), [60, 'g'])
          assert.deepStrictEqual(tryToMetric(2, 'oz'), [60, 'g'])
        })
        it('should convert pints to milliliters', () => {
          assert.deepStrictEqual(tryToMetric(2, 'pint'), [940, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'pints'), [940, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'pt'), [940, 'ml'])
        })
        it('should convert quarts to milliliters', () => {
          assert.deepStrictEqual(tryToMetric(2, 'qt'), [1900, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'qts'), [1900, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'quart'), [1900, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'quarts'), [1900, 'ml'])
        })
        it('should convert sticks to grams', () => {
          assert.deepStrictEqual(tryToMetric(2, 'stick'), [220, 'g'])
          assert.deepStrictEqual(tryToMetric(2, 'sticks'), [220, 'g'])
          assert.deepStrictEqual(tryToMetric(2, 'stk'), [220, 'g'])
        })
        it('should convert tablespoons to milliliters', () => {
          assert.deepStrictEqual(tryToMetric(2, 'tablespoon'), [30, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'tablespoons'), [30, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'tbls'), [30, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'tbsb'), [30, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'tbsp'), [30, 'ml'])
        })
        it('should convert teaspoons to milliliters', () => {
          assert.deepStrictEqual(tryToMetric(2, 'teaspoon'), [10, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'teaspoons'), [10, 'ml'])
          assert.deepStrictEqual(tryToMetric(2, 'tsp'), [10, 'ml'])
        })
      })

      context('with an unknown unit', () => {
        it('should return null', () => {
          assert.deepStrictEqual(tryToMetric(2, "something even the americans don't use"), null)
        })
      })
    })
  })

  describe('convertToPreferred', () => {
    let ingredient: IIngredient
    beforeEach(() => {
      ingredient = {
        id: 1,
        name: 'Test Ingredient',
        preferredUnit: 'g',
        density: undefined,
        assumeUnlimited: false
      }
    })

    context('ingredient in grams with density', () => {
      beforeEach(() => {
        ingredient.density = 2
        ingredient.preferredUnit = 'g'
      })

      it('should make no change if the unit is already the preferred unit', () => {
        assert.strictEqual(convertToPreferred(1, 'g', ingredient), 1)
      })
      it('should multiply by the density when converting from milliliters', () => {
        assert.strictEqual(convertToPreferred(1, 'ml', ingredient), 2)
      })
      it('should throw an error when converting from an unknown unit', () => {
        assert.throws(() => convertToPreferred(1, 'whole', ingredient), UnparsedIngredientError)
      })
    })

    context('ingredient in milliliters with density', () => {
      beforeEach(() => {
        ingredient.density = 2
        ingredient.preferredUnit = 'ml'
      })

      it('should make no change if the unit is already the preferred unit', () => {
        assert.strictEqual(convertToPreferred(1, 'ml', ingredient), 1)
      })
      it('should divide by the density when converting from grams', () => {
        assert.strictEqual(convertToPreferred(2, 'g', ingredient), 1)
      })
    })

    context('ingredient with no density', () => {
      beforeEach(() => {
        ingredient.density = undefined
      })
      it('should throw an error when converting', () => {
        assert.throws(() => convertToPreferred(1, 'ml', ingredient))
      })
    })
  })
})
