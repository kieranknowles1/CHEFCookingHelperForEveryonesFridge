import { type Express } from 'express'

import type IChefDatabase from '../database/IChefDatabase'

import registerBarcodeEndpoint from './v1/barcode/barcode'
import registerFridgeAvailableRecipeEndpoint from './v1/fridge/recipe/available'
import registerFridgeIngredientAllAmountEndpoint from './v1/fridge/ingredient/all/amount'
import registerFridgeIngredientEndpoint from './v1/fridge/ingredient/amount'
import registerIngredientAllEndpoint from './v1/ingredient/all'
import registerRecipeEndpoint from './v1/recipe/recipe'
import registerSimilarRecipeEndpoint from './v1/recipe/similar'

/**
 * Register all endpoints for the API.
 */
export default function registerEndpoints (app: Express, db: IChefDatabase): void {
  registerBarcodeEndpoint(app, db)
  registerFridgeAvailableRecipeEndpoint(app, db)
  registerFridgeIngredientAllAmountEndpoint(app, db)
  registerFridgeIngredientEndpoint(app, db)
  registerIngredientAllEndpoint(app, db)
  registerRecipeEndpoint(app, db)
  registerSimilarRecipeEndpoint(app, db)
}
