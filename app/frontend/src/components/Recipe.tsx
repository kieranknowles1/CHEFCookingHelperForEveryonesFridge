import React from 'react'

export interface RecipeProps {
  id: number
  name: string
}

// TODO: Click to get details
export default function Recipe (props: RecipeProps): React.JSX.Element {
  return (
    <li className='bg-raisin_black-600 rounded p-1'>
      {props.name}
    </li>
  )
}
