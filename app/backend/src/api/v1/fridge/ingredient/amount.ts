import { param, query, validationResult } from 'express-validator'
import type { Express } from 'express'

import ChefDatabase from '../../../../database/ChefDatabase'
import type { TypedRequest } from '../../../../TypedEndpoint'

type AddIngredientPostRequest = TypedRequest<{ amount: string }, { fridgeId: string, ingredientId: string }, undefined>

export default function installIngredientEndpoint (app: Express): void {
  app.post(
    '/api/v1/fridge/:fridgeId/ingredient/:ingredientId/amount',
    param('fridgeId').isInt(),
    param('ingredientId').isInt(),
    query('amount').isFloat({ min: 0 }),
    (req: AddIngredientPostRequest, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      const fridgeId = Number.parseInt(req.params.fridgeId)
      const ingredientId = Number.parseInt(req.params.ingredientId)
      const amount = Number.parseFloat(req.query.amount)

      ChefDatabase.Instance.wrapTransaction(writable => {
        writable.setIngredientAmount(fridgeId, ingredientId, amount)
      })
      res.status(204).send()
    }
  )
}
