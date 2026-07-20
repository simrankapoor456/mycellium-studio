import { z } from "zod";

const EmailSchema = z.string().trim().email("Enter a valid email address.").max(254);
const PasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use no more than 72 characters.");

export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export const SignupSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Enter your name.")
      .max(120, "Use no more than 120 characters."),
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((input) => input.password === input.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
