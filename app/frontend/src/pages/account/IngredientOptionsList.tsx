import { Dialog } from '@headlessui/react'
import React from 'react'

import ModalDialog from '../../components/ModalDialog'
import { type components } from '../../types/api.generated'

import AddBannedIngredient from './AddBannedIngredient'

type UserBannedIngredients = components['schemas']['User']['bannedIngredients']

export interface IngredientOptionsListProps {
  bannedIngredients: UserBannedIngredients
}

export default function IngredientOptionsList (props: IngredientOptionsListProps): React.JSX.Element {
  const [addOpen, setAddOpen] = React.useState(false)

  return (
    <>
      <button onClick={() => { setAddOpen(true) }}>Add disliked ingredient</button>
      <ModalDialog
        open={addOpen}
        setOpen={setAddOpen}
      >
        <Dialog.Title>Add disliked ingredient</Dialog.Title>
        <AddBannedIngredient
          currentBannedIngredients={new Set(props.bannedIngredients.map(i => i.id))}
          onSubmit={() => {
            // TODO: Refresh list of banned ingredients
            setAddOpen(false)
          }}
        />
      </ModalDialog>
      <ul className='list-inside list-disc'>
        {props.bannedIngredients.length === 0 && <p>No disliked ingredients.</p>}
        {props.bannedIngredients.map(ingredient => (
          <li key={ingredient.id}>
            {ingredient.name}
          </li>
        ))}
      </ul>
    </>
  )
}
