import type { ParameterType, TypedRequest } from '../../../../TypedEndpoint'

export default interface IngredientRequest<TQuery extends ParameterType, TBody>
  extends TypedRequest<TQuery, { fridgeId: string, ingredientId: string }, TBody> {}
