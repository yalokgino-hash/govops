import Link from 'next/link'
import { AuthShell } from '@/components/auth-shell'

export default function SignUpSuccessPage() {
  return (
    <AuthShell
      title="Check your inbox"
      subtitle="We sent you a confirmation link. Confirm your email to activate your GovOps account, then sign in."
      footer={
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        Once your email is verified, you can sign in with either your email address or the username
        you chose.
      </div>
    </AuthShell>
  )
}
