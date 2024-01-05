import { type Express } from 'express'

import type IChefDatabase from '../database/IChefDatabase'

import errorHandler from './errorHandler'
import notFoundHandler from './notFoundHandler'
import registerBarcodeEndpoint from './v1/barcode/barcode'
import registerFridgeAvailableRecipeEndpoint from './v1/fridge/recipe/available'
import registerFridgeInfoEndpoint from './v1/fridge/info'
import registerFridgeIngredientAllAmountEndpoint from './v1/fridge/ingredient/all/amount'
import registerFridgeIngredientEndpoint from './v1/fridge/ingredient/amount'
import registerIngredientAllEndpoint from './v1/ingredient/all'
import registerMealTypeListEndpoint from './v1/mealtype/list'
import registerRecipeEndpoint from './v1/recipe/recipe'
import registerSimilarRecipeEndpoint from './v1/recipe/similar'
import registerUserInfoEndpoint from './v1/user/info'

/**
 * Register all endpoints and error handlers for the API.
 */
export default function registerEndpoints (app: Express, db: IChefDatabase): void {
  registerBarcodeEndpoint(app, db)
  registerFridgeAvailableRecipeEndpoint(app, db)
  registerFridgeInfoEndpoint(app, db)
  registerFridgeIngredientAllAmountEndpoint(app, db)
  registerFridgeIngredientEndpoint(app, db)
  registerIngredientAllEndpoint(app, db)
  registerMealTypeListEndpoint(app, db)
  registerRecipeEndpoint(app, db)
  registerSimilarRecipeEndpoint(app, db)
  registerUserInfoEndpoint(app, db)

  app.use(notFoundHandler)
  app.use(errorHandler)
}
