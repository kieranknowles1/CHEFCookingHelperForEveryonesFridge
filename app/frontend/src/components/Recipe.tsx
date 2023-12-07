import { Link } from 'react-router-dom'
import React from 'react'

export interface RecipeProps {
  id: number
  name: string
}

// TODO: Click to get details
export default function Recipe (props: RecipeProps): React.JSX.Element {
  return (
    <Link to={`/recipe/${props.id}`} className='bg-raisin_black-600 rounded p-1'>
      <li>
        {props.name}
      </li>
    </Link>
  )
}
