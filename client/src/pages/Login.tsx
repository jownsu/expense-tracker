import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { getHealth } from '@/lib/api'
import { authClient } from '@/lib/auth'

export default function Login() {
  const { data: session, isPending } = authClient.useSession()
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth })

  if (isPending) return null
  if (session) return <Navigate to="/" replace />

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Expense Tracker</h1>
      <Button onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin })}>
        Sign in with Google
      </Button>
      <p className="text-muted-foreground text-sm" data-testid="api-health">
        {health.isPending ? 'Checking API…' : health.data?.ok ? 'API: OK ✅' : 'API: unreachable ⚠️'}
      </p>
    </div>
  )
}
