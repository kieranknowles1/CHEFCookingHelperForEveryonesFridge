import React from 'react'

export interface BannedIngredientProps {
  name: string
}

export default function BannedIngredient (props: BannedIngredientProps): React.JSX.Element {
  return (
    <li>
      {props.name}
    </li>
  )
}
