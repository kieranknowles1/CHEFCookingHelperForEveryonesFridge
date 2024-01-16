/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


/** WithRequired type helpers */
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export interface paths {
  "/mealtype/list": {
    /** Get a list of all meal types, ordered by typical meal time */
    get: {
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": string[];
          };
        };
        429: components["responses"]["TooManyRequests"];
      };
    };
  };
  "/barcode/{code}": {
    /** Get the item associated with a given barcode */
    get: {
      parameters: {
        path: {
          code: components["schemas"]["id"];
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": {
              /** @example GenericMart Chicken 1kg */
              productName: string;
              ingredient: components["schemas"]["Ingredient"];
              /** @example 1000 */
              amount: number;
            };
          };
        };
        404: components["responses"]["NotFound"];
      };
    };
    /** Insert a new barcode into the database */
    post: {
      parameters: {
        path: {
          code: components["schemas"]["id"];
        };
      };
      requestBody: {
        content: {
          "application/json": {
            /** @example GenericMart Chicken 1kg */
            productName: string;
            ingredientId: components["schemas"]["id"];
            /** @example 1000 */
            amount: number;
          };
        };
      };
      responses: {
        /** @description No Content */
        204: {
          content: never;
        };
      };
    };
  };
  "/ingredient/all": {
    /** Get details of all ingredients */
    get: {
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": components["schemas"]["Ingredient"][];
          };
        };
        429: components["responses"]["TooManyRequests"];
      };
    };
  };
  "/recipe/search": {
    /**
     * Search for recipes
     * @description Search for recipes by one or more matching terms. Results are unordered, unless the `search` parameter is specified, in which case they are ordered by similarity to the search term.
     */
    get: {
      parameters: {
        query?: {
          /** @description Search term */
          search?: string;
          /** @description Minimum similarity score, meaningless if `search` is not specified */
          minSimilarity?: number;
          /** @description If specified, only return recipes that can be made with the ingredients in the fridge */
          availableForFridge?: components["schemas"]["id"];
          /** @description Maximum number of ingredients that can be missing. Meaningless if `availableForFridge` is not specified. */
          maxMissingIngredients?: number;
          /** @description Whether to check that there is enough of each ingredient. Meaningless if `availableForFridge` is not specified. */
          checkAmounts?: boolean;
          /** @description Maximum number of results to return. */
          limit?: number;
          /** @description If specified, only return recipes of this type. By default, all recipes are returned. */
          mealType?: string;
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": components["schemas"]["SearchRecipe"][];
          };
        };
        429: components["responses"]["TooManyRequests"];
      };
    };
  };
  "/recipe/{recipeId}": {
    /** Get a recipe by ID */
    get: {
      parameters: {
        path: {
          recipeId: components["parameters"]["recipeId"];
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": components["schemas"]["Recipe"];
          };
        };
        404: components["responses"]["NotFound"];
      };
    };
  };
  "/fridge/{fridgeId}": {
    /** Get data about a fridge */
    get: {
      parameters: {
        path: {
          fridgeId: components["parameters"]["fridgeId"];
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": {
              /** @example 1 */
              id: number;
              /** @example My Fridge */
              name: string;
              owner: {
                /** @example 1 */
                id: number;
                /** @example John Smith */
                name: string;
              };
            };
          };
        };
        404: components["responses"]["NotFound"];
      };
    };
  };
  "/fridge/{fridgeId}/ingredient/all/amount": {
    /**
     * Get all ingredients in the fridge
     * @description Returns a list of all ingredients in the fridge, with their amounts Does not include ingredients with amount 0
     */
    get: {
      parameters: {
        path: {
          fridgeId: components["parameters"]["fridgeId"];
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": components["schemas"]["FridgeIngredientEntry"][];
          };
        };
        403: components["responses"]["Forbidden"];
      };
    };
  };
  "/fridge/{fridgeId}/ingredient/{ingredientId}/amount": {
    /** Get the amount of an ingredient in the fridge */
    get: {
      parameters: {
        path: {
          fridgeId: components["parameters"]["fridgeId"];
          ingredientId: components["parameters"]["ingredientId"];
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": number;
          };
        };
      };
    };
    /**
     * Update the amount of an ingredient in the fridge
     * @description Set the amount of `ingredientId` in `fridgeId` to `amount`
     */
    post: {
      parameters: {
        query: {
          /** @description Amount to set the ingredient to */
          amount: number;
        };
        path: {
          fridgeId: components["parameters"]["fridgeId"];
          ingredientId: components["parameters"]["ingredientId"];
        };
      };
      responses: {
        /** @description No Content */
        204: {
          content: never;
        };
      };
    };
  };
  "/fridge/{fridgeId}/recipe/{recipeId}/maderecipe": {
    /**
     * Log that a recipe has been made and deduct the ingredients from the fridge
     * @description Log that a recipe has been made and deduct the ingredients from the fridge. If there are not enough of an ingredient, its amount will be set to 0.
     */
    post: {
      parameters: {
        query: {
          /** @description List of users who ate the recipe */
          users: components["schemas"]["id"][];
        };
        path: {
          fridgeId: components["parameters"]["fridgeId"];
          recipeId: components["parameters"]["recipeId"];
        };
      };
      responses: {
        /** @description No Content */
        204: {
          content: never;
        };
        403: components["responses"]["Forbidden"];
      };
    };
  };
  "/user/{userId}": {
    /** Get a user by ID */
    get: {
      parameters: {
        path: {
          userId: components["parameters"]["userId"];
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": components["schemas"]["User"];
          };
        };
        404: components["responses"]["NotFound"];
      };
    };
  };
  "/user/{userId}/history": {
    /** Get a user's recipe history, ordered by most recent first */
    get: {
      parameters: {
        query?: {
          /** @description Maximum number of results to return. By default, 50 results are returned. */
          limit?: number;
          /** @description If specified, only return history entries for this recipe */
          recipe?: components["schemas"]["id"];
        };
        path: {
          userId: components["parameters"]["userId"];
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": components["schemas"]["MadeRecipe"][];
          };
        };
        404: components["responses"]["NotFound"];
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** @example 12345 */
    id: number;
    ErrorList: {
      /** @example 404 */
      status: number;
      /** @example /api/v1/path/to/endpoint */
      path: string;
      errors: components["schemas"]["Error"][];
    };
    Error: {
      /** @example /params/id */
      path: string;
      /** @example Must be integer */
      message: string;
      /** @example type.openapi.validation */
      errorCode?: string;
    };
    /**
     * @example g
     * @enum {string}
     */
    Unit: "none" | "whole" | "ml" | "g";
    SearchRecipe: {
      /** @example Just Soup */
      name: string;
      /** @example 1234 */
      id: number;
      /** @example 0.5 */
      similarity?: number;
      /**
       * @description Number of ingredients missing or not enough of. Only present if `availableForFridge` is specified.
       * @example 1
       */
      missingIngredientAmount?: number;
    };
    Recipe: {
      /** @example 12345 */
      id: number;
      /** @example Chicken Pie */
      name: string;
      /** @example The great thing about chicken pie is that you don't need to know how to make it, just get some chicken. And put it in a pie. */
      directions: string;
      /** @example example.com */
      link: string;
      ingredients: components["schemas"]["RecipeIngredientEntry"][];
      /** @example Dinner */
      mealType: string;
    };
    Ingredient: {
      /** @example 12345 */
      id: number;
      /** @example Chicken */
      name: string;
      preferredUnit: components["schemas"]["Unit"];
      /** @example 0.5 */
      density?: number;
      /** @example false */
      assumeUnlimited: boolean;
    };
    IngredientEntry: {
      ingredient: components["schemas"]["Ingredient"];
      /** @example 250 */
      amount?: number;
    };
    User: {
      /** @example 1 */
      id: number;
      /** @example John Smith */
      name: string;
      bannedTags: {
          /** @example 1 */
          id: number;
          /** @example Meat */
          name: string;
        }[];
      bannedIngredients: {
          /** @example 1 */
          id?: number;
          /** @example Mushrooms */
          name?: string;
        }[];
    };
    RecipeIngredientEntry: WithRequired<{
      /** @example 250g of chicken */
      originalLine: string;
    } & components["schemas"]["IngredientEntry"], "originalLine">;
    FridgeIngredientEntry: WithRequired<components["schemas"]["IngredientEntry"], "amount">;
    MadeRecipe: {
      id: components["schemas"]["id"];
      fridge: {
        /** @example My Fridge */
        name: string;
        id: components["schemas"]["id"];
      };
      recipe: {
        /** @example Chicken Pie */
        name: string;
        id: components["schemas"]["id"];
      };
      users: {
          /** @example John Smith */
          name: string;
          id: components["schemas"]["id"];
        }[];
      /**
       * Format: date-time
       * @example 2020-01-01T00:00:00.000Z
       */
      dateMade: string;
    };
  };
  responses: {
    /** @description Forbidden */
    Forbidden: {
      content: {
        "application/json": components["schemas"]["ErrorList"];
      };
    };
    /** @description Not Found */
    NotFound: {
      content: {
        "application/json": components["schemas"]["ErrorList"];
      };
    };
    /** @description Too Many Requests */
    TooManyRequests: {
      content: {
        "application/json": components["schemas"]["ErrorList"];
      };
    };
  };
  parameters: {
    fridgeId: components["schemas"]["id"];
    ingredientId: components["schemas"]["id"];
    recipeId: components["schemas"]["id"];
    userId: components["schemas"]["id"];
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export type operations = Record<string, never>;
