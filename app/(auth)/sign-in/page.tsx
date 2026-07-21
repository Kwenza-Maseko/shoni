'use client'
import { Suspense } from "react"
import { signInWithCredentials } from '@/lib/auth/auth'
import { signInSchema } from '@/lib/validations'
import AuthForm from "@/components/AuthForm"

function SignInContent() {
  return (
    <div>
      <AuthForm
        type="SIGNIN"
        schema={signInSchema}
        defaultValues={{
          email: "",
          password: ""
        }}
        onSubmit={signInWithCredentials}
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