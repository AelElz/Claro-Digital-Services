import { createContext, useContext } from 'react'

/*
 * Kept apart from the provider because Fast Refresh only tracks a module
 * when everything it exports is a component. Mixing the hook in with
 * RouterProvider silently breaks hot reload for every consumer.
 */
export const RouterContext = createContext({ path: '/', navigate: () => {} })

export const useRouter = () => useContext(RouterContext)
