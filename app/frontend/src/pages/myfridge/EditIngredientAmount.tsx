import { BiMinus, BiPlus } from 'react-icons/bi'
import { MdClose } from 'react-icons/md'
import React from 'react'

import UserContext from '../../contexts/UserContext'
import apiClient, { createAuthHeaders } from '../../apiClient'

export interface EditIngredientAmountProps {
  ingredientId: number
  currentAmount: number
  setCurrentAmount: React.Dispatch<number>
  onCancel: () => void
  // Callback for when the form has successfully been submitted
  onSubmit: () => void
}

export default function EditIngredientAmount (props: EditIngredientAmountProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  if (context === null) {
    throw new Error('UserContext is null')
  }

  const [deltaAmount, setDeltaAmount] = React.useState(0)

  const onSubmit = (type: 'add' | 'remove'): void => {
    const change = type === 'add' ? deltaAmount : -deltaAmount
    const newAmount = props.currentAmount + change

    if (newAmount < 0) {
      alert('New amount must be greater than or equal to 0.')
      return
    }

    apiClient.POST(
      '/fridge/{fridgeId}/ingredient/{ingredientId}/amount',
      {
        params: {
          path: { fridgeId: context.fridgeId, ingredientId: props.ingredientId },
          query: { amount: newAmount }
        },
        headers: createAuthHeaders(context)
      }
    ).then(() => {
      props.setCurrentAmount(newAmount)
      props.onSubmit()
    }).catch(err => {
      console.error(err)
      alert('Failed to update ingredient amount.')
    })
  }

  return (
    <form onSubmit={e => { e.preventDefault() }}>
      <label>Amount: <input
        type='number'
        min={0}
        onChange={event => { setDeltaAmount(Number.parseFloat(event.target.value)) }}
        autoFocus
        required
      /></label>
      <button type='button' className='float-right bg-red-900 hover:bg-red-950' onClick={props.onCancel}>
        <MdClose size={24} className='inline' />
      </button>
      <br />
      <div className='w-full grid grid-cols-2'>
      <button className='w-full bg-lime-900 rounded hover:bg-lime-950' type='submit' onClick={() => { onSubmit('add') }}>
        <BiPlus size={24} className='inline' /> Add
      </button>
      <button className='w-full bg-red-900 rounded hover:bg-red-950' type='button' onClick={() => { onSubmit('remove') }}>
        <BiMinus size={24} className='inline' /> Remove
      </button>
      </div>
    </form>
  )
}
