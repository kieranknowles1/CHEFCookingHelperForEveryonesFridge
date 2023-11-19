import { type Express } from 'express'
import { body, validationResult } from 'express-validator'

export default function installAddIngredientEndpoint (app: Express): void {
  app.post(
    '/api/v1/ingredient/add',
    body('fridgeId').isInt(),
    body('ingredientId').isInt(),
    body('amount').isFloat({ min: 0 }),
    (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }

      // TODO: Implement

      res.status(204)
    }
  )
}
