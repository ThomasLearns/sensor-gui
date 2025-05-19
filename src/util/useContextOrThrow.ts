import { Context, useContext } from 'solid-js'

export function useContextOrThrow<ContextData>(
  context: Context<ContextData>,
  errorMessage?: string
) {
  const loadedContext = useContext(context)
  if (loadedContext === undefined) {
    if (errorMessage !== undefined) throw new Error(errorMessage)
    else throw new Error('Could not use context')
  }
  return loadedContext
}
