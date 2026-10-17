import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { getHealth } from '@/lib/api'
import { authClient } from '@/lib/auth'

// Illustrative only: shows the envelope model, not real data.
const SAMPLE = [
  { name: 'Needs', percent: 50, left: '9,320', spent: 0.61 },
  { name: 'Wants', percent: 25, left: '4,180', spent: 0.65 },
  { name: 'Savings', percent: 25, left: '12,000', spent: 0 },
]

export default function Login() {
  const { data: session, isPending } = authClient.useSession()
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth, retry: 3 })
  const [params] = useSearchParams()
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState(params.get('error') ? "Sign-in didn't finish. Please try again." : '')

  if (session) return <Navigate to="/" replace />

  async function signIn() {
    setError('')
    setRedirecting(true)
    const res = await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.origin,
      errorCallbackURL: `${window.location.origin}/login`,
    })
    if (res.error) {
      setRedirecting(false)
      setError(res.error.message ?? "Couldn't reach Google. Please try again.")
    }
  }

  const month = new Date().toLocaleString('en-PH', { month: 'long' })
  const busy = isPending || redirecting

  return (
    <main className="flex min-h-svh flex-col lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <section className="flex flex-1 flex-col justify-between gap-8 bg-primary px-6 pt-7 pb-8 text-primary-foreground sm:gap-10 sm:px-10 lg:p-14">
        <p className="text-sm font-semibold tracking-tight">Expense Tracker</p>

        <div className="flex max-w-md flex-col gap-8">
          <h1 className="text-[2rem] leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-4xl lg:text-5xl">
            Know what's left, before you spend it.
          </h1>

          <div aria-hidden="true" className="flex flex-col gap-4 text-sm">
            <p className="text-primary-foreground/75">{month} · ₱48,000 income</p>
            <ul className="flex flex-col gap-3.5">
              {SAMPLE.map((e, i) => (
                <li key={e.name} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-4 tabular-nums">
                    <span>
                      {e.name} <span className="text-primary-foreground/75">{e.percent}%</span>
                    </span>
                    <span>
                      ₱{e.left} <span className="text-primary-foreground/75">left</span>
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-primary-foreground/15">
                    <div
                      className="ledger-bar h-full origin-left rounded-full bg-highlight"
                      style={{ transform: `scaleX(${e.spent})`, animationDelay: `${150 + i * 90}ms` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="hidden text-sm text-primary-foreground/75 lg:block">Your money, one month at a time.</p>
      </section>

      <section className="flex flex-col px-6 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-10 lg:justify-center lg:p-14">
        <div className="flex w-full max-w-sm flex-col gap-6 lg:mx-auto">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-muted-foreground">
              Your envelopes, transactions and savings, on your phone and laptop.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button size="lg" className="h-11 gap-3 text-[0.9375rem]" onClick={signIn} disabled={busy}>
              <span className="grid size-6 place-items-center rounded-full bg-white">
                <GoogleIcon />
              </span>
              {redirecting ? 'Opening Google…' : isPending ? 'Checking your session…' : 'Continue with Google'}
            </Button>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <ServerStatus status={health.isPending ? 'waking' : health.data?.ok ? 'ok' : 'down'} />
        </div>
      </section>
    </main>
  )
}

// Free Render instances sleep when idle; a first request can take ~30s.
function ServerStatus({ status }: { status: 'waking' | 'ok' | 'down' }) {
  const copy = {
    waking: 'Waking the server, this can take up to a minute…',
    ok: 'Server is ready.',
    down: "Can't reach the server. Check your connection and refresh.",
  }[status]
  const dot = { waking: 'bg-highlight motion-safe:animate-pulse', ok: 'bg-primary', down: 'bg-destructive' }[status]

  return (
    <p data-testid="api-health" aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground">
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${dot}`} />
      {copy}
    </p>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  )
}
