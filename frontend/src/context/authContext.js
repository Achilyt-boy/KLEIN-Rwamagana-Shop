import { createContext, useContext } from 'react'

// Kept in a plain .js file (no components) so fast refresh keeps
// working while AuthContext.jsx only holds the provider.
export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}
