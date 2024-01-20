import React from 'react'

/**
 * // TODO: I'm using this in a few places that shouldn't need the user to be logged in. Currently, the app will crash on these pages.
 * `React.useContext` that throws if the value of the context is null
 */
export default function useSafeContext<TContext> (context: React.Context<TContext | null>): TContext {
  const value = React.useContext(context)
  if (value === null) {
    throw new Error('Context has no provider')
  }
  return value
}
