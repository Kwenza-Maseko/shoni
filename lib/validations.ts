import z from "zod/v4";

export const signUpSchema = z.object({
  fullName: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
  phoneNumber: z.string().min(10)
});

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})