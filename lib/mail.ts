// lib/mail.ts
import { Resend } from "resend"
import type { CodePurpose } from "./login-code"

const resend = new Resend(process.env.RESEND_API_KEY)
const from = "Shoni <elsonify@gmail.com>"

export async function sendCode(to: string, code: string, purpose: CodePurpose) {
  const verify = purpose === "verify"
  await resend.emails.send({
    from,
    to,
    subject: verify ? `Verify your email: ${code}` : `Your sign-in code: ${code}`,
    text: `Your ${verify ? "verification" : "sign-in"} code is ${code}. It expires in 10 minutes. If this wasn't you, you can ignore this email.`,
  })
}

export async function sendAccountExistsNotice(to: string) {
  await resend.emails.send({
    from,
    to,
    subject: "Someone tried to create an account with your email",
    text: "An account with this email already exists. If this was you, just sign in or reset your password. If not, you can ignore this email.",
  })
}