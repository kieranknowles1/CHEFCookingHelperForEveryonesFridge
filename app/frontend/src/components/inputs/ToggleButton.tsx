import React from 'react'
import { Switch } from '@headlessui/react'

export interface ToggleButtonProps {
  checked: boolean
  onChange: (checked: boolean) => void
  // The label that will be read by screen readers
  screenReaderLabel: string
}

/**
 * Toggle button component using headlessui
 */
export default function ToggleButton (props: ToggleButtonProps): React.JSX.Element {
  return (
    <Switch
      checked={props.checked}
      onChange={props.onChange}
      className={`
        ${props.checked ? 'bg-savoy_blue-500 hover:bg-savoy_blue-400' : 'bg-dim_gray-500 hover:bg-dim_gray-400'}
        relative inline-flex h-5 w-11 items-center rounded-full transition-colors duration-200
      `}
    >
      {/* Only visible to screen readers */}
      <span className='sr-only'>{props.screenReaderLabel}</span>
      {/* Show the switch itself */}
      <span className={`${props.checked ? 'translate-x-5' : 'translate-x-0'}
        inline-block w-4 h-4 transform bg-white rounded-full transition ease-in-out duration-200
      `} />
    </Switch>
  )
}
