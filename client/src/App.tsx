import { Navigate, Outlet, Route, Routes } from 'react-router'
import { authClient } from '@/lib/auth'
import Home from '@/pages/Home'
import Login from '@/pages/Login'

// Route guard: renders child routes only for a logged-in user.
// UX only — the real protection is requireAuth on the API.
function RequireAuth() {
  const { data: session, isPending } = authClient.useSession()
  if (isPending) return <p className="p-4 text-muted-foreground">Checking session…</p>
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
