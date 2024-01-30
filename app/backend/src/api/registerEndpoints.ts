import { type Express } from 'express'

import type IChefDatabase from '../database/IChefDatabase'

import errorHandler from './errorHandler'
import notFoundHandler from './notFoundHandler'
import registerBarcodeEndpoint from './v1/barcode'
import registerFridgeAuthMiddleware from './v1/fridge/auth'
import registerFridgeInfoEndpoint from './v1/fridge/info'
import registerFridgeIngredientAllAmountEndpoint from './v1/fridge/ingredient/allAmounts'
import registerFridgeIngredientEndpoint from './v1/fridge/ingredient/amount'
import registerFridgeMadeRecipeEndpoint from './v1/fridge/madeRecipe'
import registerGetTagsEndpoint from './v1/getTags'
import registerIngredientAllEndpoint from './v1/getAllIngredients'
import registerLoginEndpoint from './v1/login'
import registerMealTypeListEndpoint from './v1/getMealTypes'
import registerRecipeEndpoint from './v1/recipe/recipe'
import registerRecipeSearchEndpoint from './v1/recipe/search'
import registerSignUpEndpoint from './v1/signup'
import registerUserAuthMiddleware from './v1/user/auth'
import registerUserFridgesEndpoint from './v1/user/fridges'
import registerUserHistoryEndpoint from './v1/user/history'
import registerUserInfoEndpoint from './v1/user/info'
import registerUserIngredientPreferenceEndpoint from './v1/user/ingredientPreference'
import registerUserTagPreferenceEndpoint from './v1/user/tagPreference'

/**
 * Register all endpoints and error handlers for the API.
 */
export default function registerEndpoints (app: Express, db: IChefDatabase): void {
  registerBarcodeEndpoint(app, db)

  registerGetTagsEndpoint(app, db)
  registerIngredientAllEndpoint(app, db)
  registerMealTypeListEndpoint(app, db)
  registerRecipeSearchEndpoint(app, db)
  registerRecipeEndpoint(app, db)
  registerLoginEndpoint(app, db)
  registerSignUpEndpoint(app, db)

  // Fridge endpoints. Requires authentication as a user with access to the fridge.
  registerFridgeAuthMiddleware(app, db)
  registerFridgeMadeRecipeEndpoint(app, db)
  registerFridgeInfoEndpoint(app, db)
  registerFridgeIngredientAllAmountEndpoint(app, db)
  registerFridgeIngredientEndpoint(app, db)

  // User endpoints. Requires authentication as the requested user.
  registerUserAuthMiddleware(app)
  registerUserFridgesEndpoint(app, db)
  registerUserHistoryEndpoint(app, db)
  registerUserInfoEndpoint(app, db)
  registerUserIngredientPreferenceEndpoint(app, db)
  registerUserTagPreferenceEndpoint(app, db)

  app.use(notFoundHandler)
  app.use(errorHandler)
}
