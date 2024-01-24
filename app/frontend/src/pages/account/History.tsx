import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../../components/LoadingSpinner'
import apiClient, { createAuthHeaders } from '../../apiClient'
import { type components } from '../../types/api.generated'
import monitorStatus from '../../utils/monitorStatus'

import HistoryItem from './HistoryItem'
import UserContext from '../../contexts/UserContext'

type MadeRecipe = components['schemas']['MadeRecipe']

export interface HistoryProps {
  userId: number
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

  const [history, setHistory] = React.useState<MadeRecipe[]>([])
  const [status, setStatus] = React.useState<LoadingStatus>('loading')

  React.useEffect(() => {
    apiClient.GET(
      '/user/{userId}/history',
      {
        params: { path: { userId: props.userId } },
        headers: createAuthHeaders(context)
      }
    ).then(
      monitorStatus(setStatus)
    ).then(data => {
      setHistory(data)
    }).catch(err => {
      console.error(err)
    })
  }, [props.userId])

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
