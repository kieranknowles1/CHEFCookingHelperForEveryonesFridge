import { Link } from 'react-router-dom'
import React from 'react'

export interface NavMenuProps {
  items: Array<{ path: string, name: string }>
}

/**
 * Create a nav menu from a list of entries, where each entry represents
 * an item in the menu.
 */
export default function NavMenu (props: NavMenuProps): React.JSX.Element {
  const itemStyle = 'bg-raisin_black-700 hover:bg-raisin_black-800 text-citron-700'
  return (
    <ul className='bg-raisin_black-600 flex flex-col md:flex-row justify-evenly'>
      {props.items.map(item =>
        <li key={item.path} className={itemStyle}><Link to={item.path}>{item.name}</Link></li>
      )}
    </ul>
  )
}
