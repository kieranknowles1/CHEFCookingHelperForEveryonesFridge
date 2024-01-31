import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../../components/LoadingSpinner'
import apiClient, { createAuthHeaders } from '../../apiClient'
import BarcodeScanner from '../../components/inputs/BarcodeScanner'
import UserContext from '../../contexts/UserContext'
import monitorOutcome from '../../utils/monitorOutcome'
import { type paths } from '../../types/api.generated'

type Barcode = paths['/barcode/{code}']['get']['responses']['200']['content']['application/json']

// TODO: Implement
export default function ScanBarcode (): React.JSX.Element {
  const context = React.useContext(UserContext)

  if (context?.fridgeId === undefined) {
    throw new Error('Must be logged in and have a selected fridge to scan barcodes.')
  }

  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')
  const [scanned, setScanned] = React.useState<Barcode | null>(null)
  const [added, setAdded] = React.useState<boolean>(false)

  const handleScan = (code: number): void => {
    const fridgeId = context.fridgeId
    // Should never happen, but tsc complains otherwise
    if (fridgeId === undefined) {
      throw new Error('No fridge selected.')
    }

    setAdded(false)
    apiClient.GET(
      '/barcode/{code}',
      { params: { path: { code } } }
    ).then(
      monitorOutcome(setStatus)
    ).then(async (data) => {
      setScanned(data)
      return await apiClient.POST(
        '/fridge/{fridgeId}/ingredient/{ingredientId}/modify', {
          headers: createAuthHeaders(context),
          params: { path: { fridgeId, ingredientId: data.ingredient.id }, query: { delta: data.amount } }
        }
      )
    }).then(
      monitorOutcome(setStatus)
    ).then(() => {
      setAdded(true)
    }).catch(console.error)
  }

  return (
    <div>
      <BarcodeScanner onScan={handleScan} />
      <LoadingSpinner status={status}/>
      {scanned !== null && (
        <p>Scanned: {scanned.productName} - {scanned.amount} {scanned.ingredient.preferredUnit} {scanned.ingredient.name}</p>
      )}
      {added && (
        <p>Added to fridge.</p>
      )}
    </div>
  )
}
