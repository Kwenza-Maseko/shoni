"use client"

import { useForm, Controller, DefaultValues, SubmitHandler, FieldValues, Path, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ZodType } from "zod/v4"
import type { $ZodType } from "zod/v4/core"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from 'next/link'
import { useState } from 'react'
import { FIELD_NAMES, FIELD_TYPE } from '@/constants'
import { toast } from "sonner"
import { useSearchParams } from 'next/navigation'

type AuthResponse = {
    success: boolean
    error?: string
    role?: string
}

interface Props<T extends FieldValues> {
    schema: ZodType<T> & $ZodType<T, FieldValues>
    defaultValues: T
    onSubmit: (data: T) => Promise<AuthResponse>
    type: "SIGNIN" | "SIGNUP"
}

const AuthForm = <T extends FieldValues>({
    type,
    schema,
    defaultValues,
    onSubmit
}: Props<T>) => {
    const isSignIn = type === "SIGNIN"
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)

    const form = useForm<T>({
        resolver: zodResolver(schema) as Resolver<T>,
        defaultValues: defaultValues as DefaultValues<T>,
    })

    const passwordValue = (form.watch("password" as Path<T>) as string) ?? ""

    const handleSubmit: SubmitHandler<T> = async (data) => {
        setLoading(true)
        const result = await onSubmit(data)
        setLoading(false)

        if (result.success) {
            toast.success(isSignIn ? "Signed in successfully" : "Account created successfully")
            const callbackUrl = searchParams.get("callbackUrl") ?? "/"
            window.location.href = callbackUrl
        } else {
            toast.error(result.error ?? `Failed to ${isSignIn ? "sign in" : "sign up"}`)
        }
    }

    return (
        <div className="w-100 px-8 flex flex-col items-center gap-8">

            <div className="flex flex-col gap-2 text-center">
                <h3 className="font-medium text-blue-500 uppercase">
                    {isSignIn ? "Sign in" : "Sign up"}
                </h3>
                <p className="text-center text-blue-500 text-lg font-semibold tracking-tight">
                    {isSignIn ? "Welcome to Shoni" : "Create an account with us"}
                </p>
            </div>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 w-full">
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

                <Button
                    type="submit"
                    className="w-full font-bold py-5 cursor-pointer bg-blue-500 p-5 hover:bg-blue-400"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin h-5 w-5" />
                            {isSignIn ? "Signing in..." : "Signing up..."}
                        </div>
                    ) : (
                        isSignIn ? "Sign in" : "Sign up"
                    )}
                </Button>
            </form>
        </div>
    )
}

export default AuthForm