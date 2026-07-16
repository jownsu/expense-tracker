import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { getPing, getHealth } from '@/lib/api'

function App() {
  const ping = useQuery({ queryKey: ['ping'], queryFn: getPing })
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth })

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Expense Tracker</h1>

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
