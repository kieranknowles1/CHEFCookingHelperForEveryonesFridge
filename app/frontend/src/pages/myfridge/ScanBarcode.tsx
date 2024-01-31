import React from 'react'

import LoadingSpinner, { type LoadingStatus } from '../../components/LoadingSpinner'
import BarcodeScanner from '../../components/inputs/BarcodeScanner'
import apiClient from '../../apiClient'
import monitorOutcome from '../../utils/monitorOutcome'

// TODO: Implement
export default function ScanBarcode (): React.JSX.Element {
  const [status, setStatus] = React.useState<LoadingStatus>('notstarted')

  function handleScan (code: number): void {
    apiClient.GET(
      '/barcode/{code}',
      { params: { path: { code } } }
    ).then(
      monitorOutcome(setStatus)
    ).then(data => {

    }).catch(console.error)
  }

  return (
    <div>
      <BarcodeScanner onScan={handleScan} />
      <LoadingSpinner status={status}/>
    </div>
  )
}
