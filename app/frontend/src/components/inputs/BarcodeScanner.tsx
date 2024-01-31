import React from 'react'
import { useZxing } from 'react-zxing'

export interface BarcodeScannerProps {
  onScan: (code: number) => void
}

export default function barcodeScanner (props: BarcodeScannerProps): React.JSX.Element {
  const { ref } = useZxing({
    onDecodeResult (res) {
      const code = Number.parseInt(res.getText())
      props.onScan(code)
    }
  })

  return (
    <video ref={ref}/>
  )
}
