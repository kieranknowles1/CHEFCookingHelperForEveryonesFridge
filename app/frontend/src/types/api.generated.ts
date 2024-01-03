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
          code: number;
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
          code: number;
        };
      };
      requestBody?: {
        content: {
          "application/json": {
            /** @example GenericMart Chicken 1kg */
            productName?: string;
            /** @example 12345 */
            ingredientId?: number;
            /** @example 1000 */
            amount?: number;
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
      };
    };
  };
  "/recipe/{id}": {
    /** Get a recipe by ID */
    get: {
      parameters: {
        path: {
          id: components["parameters"]["recipeId"];
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
  "/recipe/{id}/similar": {
    /**
     * Get similar recipes
     * @description Returns a list of recipes similar to the given recipe \ Items are sorted by similarity score, descending \ Only recipes of the same type are returned Note that if multiple recipes have the same name, only one will be returned
     */
    get: {
      parameters: {
        query: {
          limit: components["parameters"]["limitRequired"];
          minSimilarity?: components["parameters"]["minSimilarity"];
        };
        path: {
          id: components["parameters"]["recipeId"];
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": components["schemas"]["SimilarRecipe"][];
          };
        };
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
              owner: components["schemas"]["User"];
            };
          };
        };
        404: components["responses"]["NotFound"];
      };
    };
  };
  "/fridge/{fridgeId}/ingredient/all/amount": {
    /** Get all ingredients in the fridge */
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
  "/fridge/{fridgeId}/recipe/available": {
    /**
     * Get a list of available recipes
     * @description Returns the IDs of all recipes that can be made with the available ingredients
     */
    get: {
      parameters: {
        query?: {
          /** @description Maximum number of ingredients that can be missing. Defaults to 0. */
          maxMissingIngredients?: number;
          /** @description Whether to check that there is enough of each ingredient. Defaults to true. */
          checkAmounts?: boolean;
          /** @description If specified, only return recipes of this type */
          mealType?: string;
        };
        path: {
          fridgeId: components["parameters"]["fridgeId"];
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": {
                /** @example Just Soup */
                name: string;
                /** @example 1234 */
                id: number;
                /**
                 * @description Number of ingredients missing or not enough of
                 * @example 1
                 */
                missingIngredientAmount: number;
              }[];
          };
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
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
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
     * @enum {unknown}
     */
    Unit: "none" | "whole" | "ml" | "g";
    SimilarRecipe: {
      /** @example Just Soup */
      name: string;
      /** @example 1234 */
      id: number;
      /** @example 0.5 */
      similarity: number;
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
    };
    RecipeIngredientEntry: WithRequired<{
      /** @example 250g of chicken */
      originalLine: string;
    } & components["schemas"]["IngredientEntry"], "originalLine">;
    FridgeIngredientEntry: WithRequired<components["schemas"]["IngredientEntry"], "amount">;
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
    fridgeId: number;
    ingredientId: number;
    recipeId: number;
    userId: number;
    limitRequired: number;
    minSimilarity?: number;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export type operations = Record<string, never>;
