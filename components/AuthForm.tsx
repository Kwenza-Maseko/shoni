"use client"

import { useForm, Controller, DefaultValues, SubmitHandler, FieldValues, Path, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ZodType } from "zod/v4"
import type { $ZodType } from "zod/v4/core"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { FIELD_NAMES, FIELD_TYPE } from "@/constants"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

type AuthResponse = { success: boolean; error?: string; role?: string }

interface Props<T extends FieldValues> {
    schema: ZodType<T> & $ZodType<T, FieldValues>
    defaultValues: T
    type: "SIGNIN" | "SIGNUP"
    onSubmit: (data: T) => Promise<AuthResponse>
    onVerify: (data: T, code: string) => Promise<AuthResponse>
    onResend: (data: T) => Promise<AuthResponse>
}

const RESEND_SECONDS = 60

const safeCallbackUrl = (url: string | null) =>
    url && url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\") ? url : "/"

const AuthForm = <T extends FieldValues>({
    type, schema, defaultValues, onSubmit, onVerify, onResend,
}: Props<T>) => {
    const isSignIn = type === "SIGNIN"
    const searchParams = useSearchParams()

    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<"credentials" | "code">("credentials")
    const [code, setCode] = useState("")
    const [cooldown, setCooldown] = useState(0)

    const form = useForm<T>({
        resolver: zodResolver(schema) as Resolver<T>,
        defaultValues: defaultValues as DefaultValues<T>,
    })

    useEffect(() => {
        if (cooldown <= 0) return
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
        return () => clearTimeout(t)
    }, [cooldown])

    const inCodeStep = step === "code"

    const handleSubmit: SubmitHandler<T> = async (data) => {
        setLoading(true)
        try {
            if (!inCodeStep) {
                const res = await onSubmit(data)
                if (res.success) {
                    setStep("code")
                    setCooldown(RESEND_SECONDS)
                    toast.success("We emailed you a 6-digit code")
                } else {
                    toast.error(res.error ?? "Something went wrong")
                }
                return
            }

            if (!/^\d{6}$/.test(code)) {
                toast.error("Enter the 6-digit code")
                return
            }

            const res = await onVerify(data, code)
            if (res.success) {
                if (isSignIn) {
                    toast.success("Signed in successfully")
                    window.location.href = safeCallbackUrl(searchParams.get("callbackUrl"))
                } else {
                    toast.success("Email verified. Please sign in.")
                    window.location.href = "/sign-in"
                }
            } else {
                toast.error(res.error ?? "Invalid or expired code")
            }
        } finally {
            setLoading(false)
        }
    }

    const resendCode = async () => {
        if (cooldown > 0 || loading) return
        setLoading(true)
        try {
            const res = await onResend(form.getValues())
            if (res.success) {
                setCode("")
                setCooldown(RESEND_SECONDS)
                toast.success("New code sent")
            } else {
                toast.error(res.error ?? "Failed to resend code")
            }
        } finally {
            setLoading(false)
        }
    }

    const backToCredentials = () => {
        setStep("credentials")
        setCode("")
        setCooldown(0)
    }

    const buttonLabel = loading
        ? inCodeStep ? "Verifying..." : "Please wait..."
        : inCodeStep ? (isSignIn ? "Verify & sign in" : "Verify email") : isSignIn ? "Continue" : "Sign up"

    return (
        <div className="w-100 px-8 flex flex-col items-center gap-8">
            <div className="flex flex-col gap-2 text-center">
                <h3 className="font-medium text-blue-500 uppercase">
                    {inCodeStep ? "Verify" : isSignIn ? "Sign in" : "Sign up"}
                </h3>
                <p className="text-center text-white text-xl font-semibold tracking-tight">
                    {inCodeStep ? "Check your email" : isSignIn ? "Welcome to Shoni" : "Create an account with us"}
                </p>
                {inCodeStep && (
                    <p className="text-sm text-slate-400">
                        We sent a 6-digit code to {String(form.getValues("email" as Path<T>) ?? "")}. Check spam if you don&apos;t see it.
                    </p>
                )}
            </div>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 w-full">
                {!inCodeStep ? (
                    <FieldGroup>
                        {Object.keys(defaultValues).map((fieldName) => (
                            <Controller
                                key={fieldName}
                                control={form.control}
                                name={fieldName as Path<T>}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <div className="flex justify-between w-full">
                                            <FieldLabel
                                                htmlFor={field.name}
                                                className="text-[11px] text-white uppercase tracking-wider"
                                            >
                                                {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}
                                            </FieldLabel>
                                        </div>
                                        <Input
                                            {...field}
                                            id={field.name}
                                            required
                                            aria-invalid={fieldState.invalid}
                                            type={FIELD_TYPE[field.name as keyof typeof FIELD_TYPE]}
                                            className="w-full px-3 py-5 text-sm border border-slate-700 rounded-lg outline-none focus:border-zinc-400 bg-slate-800 transition-colors"
                                        />
                                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                    </Field>
                                )}
                            />
                        ))}
                    </FieldGroup>
                ) : (
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="code" className="text-[11px] text-white uppercase tracking-wider">
                                Verification code
                            </FieldLabel>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                autoFocus
                                required
                                placeholder="123456"
                                className="w-full px-3 py-5 text-center text-lg tracking-[0.5em] border border-slate-700 rounded-lg outline-none focus:border-zinc-400 bg-slate-800 transition-colors"
                            />
                        </Field>

                        <div className="flex justify-between text-sm">
                            <button type="button" onClick={backToCredentials} className="text-slate-400 hover:text-white cursor-pointer">
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={resendCode}
                                disabled={cooldown > 0 || loading}
                                className="text-blue-500 hover:text-blue-400 disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                            </button>
                        </div>
                    </FieldGroup>
                )}

                <Button
                    type="submit"
                    className="w-full font-bold py-5 cursor-pointer bg-blue-500 p-5 hover:bg-blue-400"
                    disabled={loading || (inCodeStep && code.length !== 6)}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin h-5 w-5" />
                            {buttonLabel}
                        </div>
                    ) : (
                        buttonLabel
                    )}
                </Button>
            </form>
        </div>
    )
}

export default AuthForm