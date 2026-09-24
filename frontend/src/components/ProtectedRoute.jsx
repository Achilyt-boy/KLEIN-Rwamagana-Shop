import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/authContext'

// Blocks a route until we know who the user is; sends anonymous
// visitors to the login page and remembers where they were headed.
export default function ProtectedRoute({ children }) {
  const { user, booting } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <div className="grid min-h-64 place-items-center text-zinc-400">…</div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
