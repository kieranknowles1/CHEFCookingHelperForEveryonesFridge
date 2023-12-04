import React from 'react'

/**
 * `React.useContext` that throws if the value of the context is null
 */
export default function useSafeContext<TContext> (context: React.Context<TContext | null>): TContext {
  const value = React.useContext(context)
  if (value === null) {
    throw new Error('Context has no provider')
  }
  return value
}
