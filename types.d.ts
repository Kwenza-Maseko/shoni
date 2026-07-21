import { DefaultSession } from "next-auth"

export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  role: "LOANEE" | "LOANER"; 
  phoneNumber: string;
  createdAt: Date | null;         
  lastLogin: Date | null;        
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
}
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
  }
}

export type PublicUser = Omit<User, "password" | "passwordResetToken" | "passwordResetExpires">


export interface AuthCredentails {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
}