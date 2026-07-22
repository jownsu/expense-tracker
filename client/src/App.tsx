import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { getPing, getHealth } from '@/lib/api'
import { authClient } from '@/lib/auth'

function App() {
  const ping = useQuery({ queryKey: ['ping'], queryFn: getPing })
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth })
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Expense Tracker</h1>

      <div className="flex flex-col items-center gap-2" data-testid="auth">
        {isPending ? (
          <p className="text-muted-foreground">Checking session…</p>
        ) : user ? (
          <>
            <p>Signed in as {user.name ?? user.email}</p>
            <Button variant="outline" onClick={() => authClient.signOut()}>
              Sign out
            </Button>
          </>
        ) : (
          <Button onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin })}>
            Sign in with Google
          </Button>
        )}
      </div>

      <p className="text-muted-foreground" data-testid="api-health">
        {health.isPending
          ? 'Checking API health…'
          : health.error
            ? 'API health: unreachable ⚠️'
            : health.data.ok
              ? 'API health: OK ✅'
              : 'API health: not OK ⚠️'}
      </p>

      <p className="text-muted-foreground" data-testid="api-status">
        {ping.isPending
          ? 'Connecting to API…'
          : ping.error
            ? `API error: ${ping.error.message}`
            : `API says: ${ping.data.message} (${ping.data.service})`}
      </p>

      <Button>Click me</Button>
    </div>
  )
}

export default App
