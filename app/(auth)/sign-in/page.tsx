'use client'
import { Suspense } from "react"
import { signInWithCredentials, requestLoginCode } from '@/lib/auth/auth'
import { signInSchema } from '@/lib/validations'
import AuthForm from "@/components/AuthForm"

function SignInContent() {
  return (
    <div>
      <AuthForm
        type="SIGNIN"
        schema={signInSchema}
        defaultValues={{ email: "", password: "" }}
        onSubmit={requestLoginCode}
        onVerify={(data, code) => signInWithCredentials({ ...data, code })}
        onResend={requestLoginCode}
      />
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInContent />
    </Suspense>
  )
}