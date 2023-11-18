/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */


export interface paths {
  "/recipe/{id}": {
    /** Get a recipe by ID */
    get: {
      parameters: {
        path: {
          id: number;
        };
      };
      responses: {
        /** @description OK */
        200: {
          content: {
            "application/json": components["schemas"]["Recipe"];
          };
        };
      };
    };
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /**
     * @example g
     * @enum {unknown}
     */
    Unit: "none" | "whole" | "ml" | "g";
    Recipe: {
      /** @example 12345 */
      id: number;
      /** @example Chicken Pie */
      name: string;
      /** @example The great thing about chicken pie is that you don't need to know how to make it, just get some chicken. And put it in a pie. */
      directions: string;
      /** @example example.com */
      link: string;
      ingredients: components["schemas"]["IngredientEntry"][];
    };
    Ingredient: {
      /** @example 12345 */
      id: number;
      /** @example Chicken */
      name: string;
      preferredUnit: components["schemas"]["Unit"];
    };
    IngredientEntry: {
      ingredient: components["schemas"]["Ingredient"];
      /** @example 250 */
      amount?: number;
      /** @example 250g of chicken */
      originalLine: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export type operations = Record<string, never>;
