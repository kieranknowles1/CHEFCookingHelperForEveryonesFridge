import { type Express } from 'express'
import { body, validationResult } from 'express-validator'
import ChefDatabase from '../../database/ChefDatabase'

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

      const fridgeId = Number.parseInt(req.body.fridgeId)
      const ingredientId = Number.parseInt(req.body.ingredientId)
      const amount = Number.parseFloat(req.body.amount)

      const currentAmount = ChefDatabase.Instance.getIngredientAmount(fridgeId, ingredientId)

      ChefDatabase.Instance.wrapTransaction(writable => {
        writable.setIngredientAmount(fridgeId, ingredientId, currentAmount + amount)
      })
      res.status(204).send()
    }
  )
}
