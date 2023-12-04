import React from 'react'

type OmitProps = 'type' | 'value' | 'pattern'
export type NumberInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, OmitProps>

/**
 * Input field that only accepts numbers
 * Based on Jimmay's code from https://stackoverflow.com/questions/43687964/only-numbers-input-number-in-react
 * Supports most properties of a standard `input` element with the exception of
 * `type`, `value`, and `pattern`.
 */
export default function NumberInput (props: NumberInputProps): React.JSX.Element {
  const [value, setValue] = React.useState('')

  function isValidInput (val: string): boolean {
    return val === '' || val === '-'
  }

  function updateNumber (e: React.ChangeEvent<HTMLInputElement>): void {
    // If the current value passes the validity test then apply that to state
    // If the current val is just the negation sign, or it's been provided an empty string,
    // then apply that value to state - we still have to validate this input before processing
    // it to some other component or data structure, but it frees up our input the way a user
    // would expect to interact with this component
    if (e.target.validity.valid || isValidInput(e.target.value)) {
      setValue(e.target.value)
      // Forward event to the original handler if the input was valid
      if (props.onChange !== undefined) {
        props.onChange(e)
      }
    }
  }

  return (
    <input
      {...props}
      type='tel'
      value={value}
      onChange={updateNumber}
      pattern="^-?[0-9]\d*\.?\d*$"
    />
  )
}
