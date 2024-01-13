/**
 * Utility to get the URL to link to a recipe's page for use in a <Link> component
 */
export default function getRecipeUrl (recipeId: number): string {
  return `/recipe/${recipeId}`
}
