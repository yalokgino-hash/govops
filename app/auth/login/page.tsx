'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthShell } from '@/components/auth-shell'
import { TextField, SubmitButton, FormError } from '@/components/field'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()

    try {
      let email = identifier.trim()

      // If the user typed a username instead of an email, resolve it to an email.
      if (!email.includes('@')) {
        const { data, error: rpcError } = await supabase.rpc('email_for_username', {
          p_username: email,
        })
        if (rpcError) throw rpcError
        if (!data) {
          throw new Error('No account found for that username.')
        }
        email = data as string
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your GovOps operations dashboard with your email or username."
      footer={
        <span>
          {"Don't have an account? "}
          <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          id="identifier"
          label="Email or username"
          type="text"
          autoComplete="username"
          placeholder="you@agency.gov or jdoe"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <FormError message={error} /> : null}
        <SubmitButton disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</SubmitButton>
      </form>
    </AuthShell>
  )
}
