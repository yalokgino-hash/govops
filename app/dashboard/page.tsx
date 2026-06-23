import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, department, username, email, created_at')
    .eq('id', user.id)
    .single()

  const fullName = profile?.full_name || (user.user_metadata?.full_name as string) || 'Team member'
  const department = profile?.department || (user.user_metadata?.department as string) || '—'
  const username = profile?.username || (user.user_metadata?.username as string) || '—'
  const email = profile?.email || user.email || '—'
  const firstName = fullName.split(' ')[0]
  const initials = fullName
    .split(' ')
    .map((p: string) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const stats = [
    { label: 'Open tasks', value: '12', hint: '3 due today' },
    { label: 'Pending approvals', value: '5', hint: 'Awaiting review' },
    { label: 'Active requests', value: '28', hint: 'Across your dept.' },
    { label: 'Compliance', value: '98%', hint: 'On track' },
  ]

  const activity = [
    { title: 'Permit #4821 approved', meta: 'Permitting · 2h ago' },
    { title: 'Budget revision submitted', meta: 'Finance · 5h ago' },
    { title: 'Safety inspection scheduled', meta: 'Health & Safety · Yesterday' },
    { title: 'New service request assigned', meta: 'Operations · Yesterday' },
  ]

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldIcon />
            </div>
            <span className="font-mono text-sm font-semibold tracking-widest text-foreground">
              GOVOPS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{fullName}</p>
              <p className="text-xs text-muted-foreground">{department}</p>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
              aria-hidden="true"
            >
              {initials || 'U'}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <section className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Here&apos;s what&apos;s happening across the {department} department today.
          </p>
        </section>

        <section
          className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
          aria-label="Operations summary"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold text-card-foreground">Recent activity</h2>
              </div>
              <ul>
                {activity.map((a, i) => (
                  <li
                    key={a.title}
                    className={`flex items-center gap-3 px-5 py-4 ${
                      i !== activity.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.meta}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <div className="rounded-xl border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-base font-semibold text-card-foreground">Your profile</h2>
              </div>
              <dl className="divide-y divide-border">
                <ProfileRow label="Full name" value={fullName} />
                <ProfileRow label="Username" value={username} />
                <ProfileRow label="Email" value={email} />
                <ProfileRow label="Department" value={department} />
              </dl>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium text-card-foreground">{value}</dd>
    </div>
  )
}

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
