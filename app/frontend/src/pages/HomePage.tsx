import React from 'react'

const ICON_OPTIONS = ['👩‍🍳', '👩🏻‍🍳', '👩🏼‍🍳', '👩🏽‍🍳', '👩🏾‍🍳', '👩🏿‍🍳', '👨‍🍳', '👨🏻‍🍳', '👨🏼‍🍳', '👨🏽‍🍳', '👨🏾‍🍳', '👨🏿‍🍳']

export default function HomePage (): React.JSX.Element {
  const [icon] = React.useState(ICON_OPTIONS[Math.floor(Math.random() * ICON_OPTIONS.length)])
  console.log(icon)

  return (
    <main>
      <h1>{icon} - Cooking Helper for Everyone&apos;s Fridge</h1>
    </main>
  )
}
