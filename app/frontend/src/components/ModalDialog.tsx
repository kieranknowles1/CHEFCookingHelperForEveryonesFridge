import { Dialog } from '@headlessui/react'
import React from 'react'

export interface ModalDialogProps {
  children: React.ReactNode
  open: boolean
  setOpen: React.Dispatch<boolean>
}

/**
 * Create a modal dialog that dims the background when open.
 * Children are rendered in a `<Dialog.Panel>` environment
 */
export default function ModalDialog (props: ModalDialogProps): React.JSX.Element {
  return (
    <Dialog
      open={props.open}
      onClose={() => { props.setOpen(false) }}
      className='relative z-50'
    >
      {/** Backdrop */}
      <div className='fixed inset-0 bg-black/30' aria-hidden />
      <div className='fixed inset-0 w-screen h-screen items-center justify-center p-4'>
        <Dialog.Panel className='mx-auto max-w-lg rounded bg-raisin_black-700'>
          {props.children}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
