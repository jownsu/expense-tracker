import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { getPing } from '@/lib/api'

function App() {
  const { isPending, error, data } = useQuery({
    queryKey: ['ping'],
    queryFn: getPing,
  })

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Expense Tracker</h1>
      <p className="text-muted-foreground" data-testid="api-status">
        {isPending
          ? 'Connecting to API…'
          : error
            ? `API error: ${error.message}`
            : `API says: ${data.message} (${data.service})`}
      </p>
      <Button>Click me</Button>
    </div>
  )
}

export default App
