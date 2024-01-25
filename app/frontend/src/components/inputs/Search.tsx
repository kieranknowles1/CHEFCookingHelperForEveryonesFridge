import { BiSearch } from 'react-icons/bi'
import React from 'react'

export interface SearchProps {
  setQuery: React.Dispatch<string>
}

/**
 * Search input. Use `React.useEffect` to update items based on the query
 */
export default function Search (props: SearchProps): React.JSX.Element {
  return (
    <label>
      <BiSearch size={24} className='inline' /> Search: <input
        type='search'
        onChange={e => { props.setQuery(e.target.value) }}
      />
    </label>
  )
}
