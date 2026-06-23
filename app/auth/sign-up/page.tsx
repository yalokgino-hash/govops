'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthShell } from '@/components/auth-shell'
import { TextField, SelectField, SubmitButton, FormError } from '@/components/field'

const DEPARTMENTS = [
  'Operations',
  'Public Works',
  'Finance',
  'Human Resources',
  'Information Technology',
  'Health & Safety',
  'Permitting',
  'Communications',
]

type Phase = 0 | 1 | 2

export default function SignUpPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>(0)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [department, setDepartment] = useState(DEPARTMENTS[0])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function goToDepartment(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!fullName.trim()) return setError('Please enter your full name.')
    if (!email.includes('@')) return setError('Please enter a valid email address.')
    if (username.trim().length < 3) return setError('Username must be at least 3 characters.')
    setPhase(1)
  }

  function goToPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!department) return setError('Please select a department.')
    setPhase(2)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')

    setLoading(true)
    const supabase = createClient()
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName.trim(),
            department,
            username: username.trim(),
          },
        },
      })
      if (signUpError) throw signUpError

      // Email confirmation is auto-handled, so sign in immediately for a seamless flow.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) throw signInError

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.')
    } finally {
      setLoading(false)
    }
  }

  const subtitles = [
    'Step 1 of 3 — Tell us who you are.',
    'Step 2 of 3 — Which department are you with?',
    'Step 3 of 3 — Secure your account.',
  ]

  return (
    <AuthShell
      title="Create your account"
      subtitle={subtitles[phase]}
      footer={
        <span>
          Already registered?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <Stepper phase={phase} />

      {phase === 0 && (
        <form onSubmit={goToDepartment} className="flex flex-col gap-4">
          <TextField
            id="fullName"
            label="Full name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <TextField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@agency.gov"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            id="username"
            label="Username"
            type="text"
            autoComplete="username"
            placeholder="jdoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {error ? <FormError message={error} /> : null}
          <SubmitButton>Continue</SubmitButton>
        </form>
      )}

      {phase === 1 && (
        <form onSubmit={goToPassword} className="flex flex-col gap-4">
          <SelectField
            id="department"
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </SelectField>
          {error ? <FormError message={error} /> : null}
          <div className="flex gap-3">
            <BackButton onClick={() => setPhase(0)} />
            <SubmitButton>Continue</SubmitButton>
          </div>
        </form>
      )}

      {phase === 2 && (
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            id="confirm"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {error ? <FormError message={error} /> : null}
          <div className="flex gap-3">
            <BackButton onClick={() => setPhase(1)} />
            <SubmitButton disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </SubmitButton>
          </div>
        </form>
      )}
    </AuthShell>
  )
}

function Stepper({ phase }: { phase: Phase }) {
  const labels = ['Identity', 'Department', 'Password']
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Registration progress">
      {labels.map((label, i) => {
        const active = i === phase
        const done = i < phase
        return (
          <li key={label} className="flex flex-1 flex-col gap-1.5">
            <span
              className={`h-1.5 rounded-full transition-colors ${
                done || active ? 'bg-primary' : 'bg-border'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 items-center justify-center rounded-lg border border-input bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
    >
      Back
    </button>
  )
}
