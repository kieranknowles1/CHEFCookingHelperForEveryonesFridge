import { Dialog } from '@headlessui/react'
import React from 'react'

import ModalDialog from '../../components/ModalDialog'
import { type components } from '../../types/api.generated'

import AddBannedIngredient from './AddBannedIngredient'
import BannedIngredient from './BannedIngredient'

type UserBannedIngredients = components['schemas']['User']['bannedIngredients']

export interface IngredientOptionsListProps {
  bannedIngredients: UserBannedIngredients
  setBannedIngredients: (bannedIngredients: UserBannedIngredients) => void
}

export default function IngredientOptionsList (props: IngredientOptionsListProps): React.JSX.Element {
  const [addOpen, setAddOpen] = React.useState(false)

  function handleRemove (id: number): void {
    props.setBannedIngredients(props.bannedIngredients.filter(i => i.id !== id))
  }

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
          onSubmit={ingredient => {
            setAddOpen(false)

            // Add to the end of the list, much easier than trying to sort it
            props.setBannedIngredients([...props.bannedIngredients, ingredient])
          }}
        />
      </ModalDialog>
      <ul className='list-inside list-disc'>
        {props.bannedIngredients.length === 0 && <p>No disliked ingredients.</p>}
        {props.bannedIngredients.map(ingredient => (
          <BannedIngredient
            key={ingredient.id}
            name={ingredient.name}
            id={ingredient.id}
            onRemove={() => { handleRemove(ingredient.id) }}
          />
        ))}
      </ul>
    </>
  )
}
