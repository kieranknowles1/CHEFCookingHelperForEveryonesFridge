import Icon from '@mdi/react'
import React from 'react'
import { mdiMagnify } from '@mdi/js'

export interface SearchProps {
  setQuery: React.Dispatch<string>
}

/**
 * Search input. Use `React.useEffect` to update items based on the query
 */
export default function Search (props: SearchProps): React.JSX.Element {
  return (
    <label>
      <Icon path={mdiMagnify} size={1} className='inline' /> Search: <input
        type='search'
        onChange={e => { props.setQuery(e.target.value) }}
      />
    </label>
  )
}
