import nodemailer from "nodemailer"
import type { CodePurpose } from "./login-code"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const from = `Shoni <${process.env.GMAIL_USER}>`

async function send(opts: { to: string; subject: string; text: string }) {
  try {
    await transporter.sendMail({ from, ...opts })
  } catch (error) {
    
    console.error("Mail error:", (error as Error).message)
    throw new Error("Email failed to send")
  }
}

export async function sendCode(to: string, code: string, purpose: CodePurpose) {
  const verify = purpose === "verify"
  await send({
    to,
    subject: verify ? `Verify your email: ${code}` : `Your sign-in code: ${code}`,
    text: `Your ${verify ? "verification" : "sign-in"} code is ${code}. It expires in 10 minutes. If this wasn't you, you can ignore this email.`,
  })
}

export async function sendAccountExistsNotice(to: string) {
  await send({
    to,
    subject: "Someone tried to create an account with your email",
    text: "An account with this email already exists. If this was you, just sign in or reset your password. If not, you can ignore this email.",
  })
}