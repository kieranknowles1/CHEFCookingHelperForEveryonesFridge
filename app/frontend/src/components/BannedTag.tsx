import React from 'react'

export interface BannedTagProps {
  name: string
  description: string
}

export default function BannedTag (props: BannedTagProps): React.JSX.Element {
  return (
    <li>
      {props.name}: {props.description}
    </li>
  )
}
