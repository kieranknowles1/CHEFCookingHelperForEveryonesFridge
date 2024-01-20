import React from 'react'

import ToggleButton from './inputs/ToggleButton'

export interface TagOptionProps {
  name: string
  description: string
  allowed: boolean
  setAllowed: (allowed: boolean) => void
}

export default function TagOption (props: TagOptionProps): React.JSX.Element {
  return (
    <li>
      <ToggleButton
        checked={props.allowed}
        onChange={props.setAllowed}
        screenReaderLabel={`Toggle ${props.name} as a dietary restriction`}
      />
      {' '}{props.name}: {props.description}. {props.allowed ? <span className='text-citron-400'>Allowed</span> : <span className='text-dim_gray-800'>Disallowed</span>}
    </li>
  )
}
