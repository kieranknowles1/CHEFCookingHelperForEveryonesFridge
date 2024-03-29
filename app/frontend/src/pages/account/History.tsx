import React from 'react'

import UserContext, { type UserState } from '../../contexts/UserContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import useHistory from '../../hooks/useHistory'

import HistoryItem from './HistoryItem'

export interface HistoryProps {
  userId: number
  setUserState: (userState: UserState | null) => void
}

/**
 * Component for displaying the history of the user's made recipes.
 * Renders a table with the following columns:
 * - Recipe
 * - List of people served
 * - Date made
 *
 * Clicking on a recipe name will take the user to the recipe page.
 */
export default function History (props: HistoryProps): React.JSX.Element {
  const context = React.useContext(UserContext)

  if (context === null) {
    throw new Error('UserContext is null')
  }

  const rowStyle = 'border border-gray-400 p-1'
  const cellStyle = 'border border-gray-400 p-1'

  const [history, status] = useHistory(
    props.userId,
    undefined,
    context,
    props.setUserState
  )

  return (
    <table className='table-auto border'>
      <thead className={rowStyle}>
        <tr>
          <th className={cellStyle}>Recipe</th>
          <th className={cellStyle}>People Served</th>
          <th className={cellStyle}>Date Made</th>
        </tr>
      </thead>
      <tbody>
        {/* Show the spinner across all columns instead of just the first one */}
        {status !== 'done' && (
          <tr><td colSpan={3}><LoadingSpinner status={status} /></td></tr>
        )}
        {history.map(item =>
          <HistoryItem
            key={item.id}
            rowStyle={rowStyle}
            cellStyle={cellStyle}
            madeRecipe={item}
          />
        )}
      </tbody>
    </table>
  )
}
