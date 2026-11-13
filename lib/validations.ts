import z from "zod/v4";

export const signUpSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().trim().toLowerCase().max(254),
  password: z.string().min(8).max(72),
  phoneNumber: z.string().min(10)
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().max(254),
  password: z.string().min(8).max(72),
})
