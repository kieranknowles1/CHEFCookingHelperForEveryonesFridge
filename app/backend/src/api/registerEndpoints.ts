import { type Express } from 'express'

import type IChefDatabase from '../database/IChefDatabase'

import errorHandler from './errorHandler'
import notFoundHandler from './notFoundHandler'
import registerBarcodeEndpoint from './v1/barcode/barcode'
import registerFridgeInfoEndpoint from './v1/fridge/info'
import registerFridgeIngredientAllAmountEndpoint from './v1/fridge/ingredient/all/amount'
import registerFridgeIngredientEndpoint from './v1/fridge/ingredient/amount'
import registerFridgeMadeRecipeEndpoint from './v1/fridge/recipe/madeRecipe'
import registerIngredientAllEndpoint from './v1/ingredient/all'
import registerMealTypeListEndpoint from './v1/mealtype/list'
import registerRecipeEndpoint from './v1/recipe/recipe'
import registerRecipeSearchEndpoint from './v1/recipe/search'
import registerUserInfoEndpoint from './v1/user/info'

/**
 * Register all endpoints and error handlers for the API.
 */
export default function registerEndpoints (app: Express, db: IChefDatabase): void {
  registerBarcodeEndpoint(app, db)
  registerFridgeMadeRecipeEndpoint(app, db)
  registerFridgeInfoEndpoint(app, db)
  registerFridgeIngredientAllAmountEndpoint(app, db)
  registerFridgeIngredientEndpoint(app, db)
  registerIngredientAllEndpoint(app, db)
  registerMealTypeListEndpoint(app, db)
  registerRecipeSearchEndpoint(app, db)
  registerRecipeEndpoint(app, db)
  registerUserInfoEndpoint(app, db)

  app.use(notFoundHandler)
  app.use(errorHandler)
}
