import { Switch } from '@headlessui/react'
import React from 'react'

export interface TagOptionProps {
  name: string
  description: string
  allowed: boolean
  setAllowed: (allowed: boolean) => void
}

export default function TagOption (props: TagOptionProps): React.JSX.Element {
  return (
    <li>
      <Switch
        checked={props.allowed}
        onChange={() => { props.setAllowed(!props.allowed) }}
        className={`
          ${props.allowed ? 'bg-savoy_blue-500 hover:bg-savoy_blue-400' : 'bg-dim_gray-500 hover:bg-dim_gray-400'}
          relative inline-flex h-5 w-11 items-center rounded-full transition-colors duration-200
        `}
      >
        {/* Only visible to screen readers */}
        <span className='sr-only'>Allow</span>
        {/* Show the switch itself */}
        <span className={`${props.allowed ? 'translate-x-5' : 'translate-x-0'}
          inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200
        `} />
      </Switch>
      {' '}{props.name}: {props.description}. {props.allowed ? <span className='text-citron-400'>Allowed</span> : <span className='text-dim_gray-800'>Disallowed</span>}
    </li>
  )
}
