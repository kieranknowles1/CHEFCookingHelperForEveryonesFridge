import React from 'react'

export interface SetTitleProps {
  title: string
}

/**
 * Set title of the page when component is mounted
 */
export default function PageTitle (props: SetTitleProps): null {
  React.useEffect(() => {
    document.title = `${props.title} - CHEF`
  }, [props.title])

  return null
}
