import React from 'react'
import { useZxing } from 'react-zxing'

// TODO: Implement
export default function ScanBarcode (): React.JSX.Element {
  const { ref } = useZxing({
    onDecodeResult (res) {
      // TODO: Make request and close if sucess. Prompt to input otherwise
      alert(res.getText())
    }
  })

  return (
    <div>
      <video ref={ref}/>
    </div>
  )
}
