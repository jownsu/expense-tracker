import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { getTest } from '@/lib/api'
import { authClient } from '@/lib/auth'

export default function Home() {
  const { data: session } = authClient.useSession()
  const test = useQuery({ queryKey: ['test'], queryFn: getTest })

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Hi, {session?.user.name}</h1>
      <p className="text-muted-foreground" data-testid="api-test">
        {test.isPending ? 'Calling /api/test…' : test.error ? `/api/test: ${test.error.message}` : `/api/test: ${test.data.message}`}
      </p>
      <Button variant="outline" onClick={() => authClient.signOut()}>
        Sign out
      </Button>
    </div>
  )
}
