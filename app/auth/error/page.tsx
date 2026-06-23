import Link from 'next/link'
import { AuthShell } from '@/components/auth-shell'

export default function AuthErrorPage() {
  return (
    <AuthShell
      title="Something went wrong"
      subtitle="We couldn't complete that authentication request. The link may have expired or already been used."
      footer={
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm leading-relaxed text-destructive">
        Please try signing in again, or restart the registration process.
      </div>
    </AuthShell>
  )
}
