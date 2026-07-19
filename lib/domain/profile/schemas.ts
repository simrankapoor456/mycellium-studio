import { z } from "zod";

const optionalText = (maximum: number) => z.string().trim().max(maximum).transform((value) => value || null);
const optionalUrl = z.string().trim().max(2_000).refine((value) => value === "" || z.url().safeParse(value).success, "Enter a complete web address.").transform((value) => value || null);

export const ProfileUpdateInputSchema = z.object({
  displayName: optionalText(80),
  avatarUrl: optionalUrl,
  timezone: optionalText(100),
  location: optionalText(120),
});

export const PasswordChangeInputSchema = z.object({
  password: z.string().min(12, "Use at least 12 characters.").max(200),
  passwordConfirmation: z.string(),
}).refine((input) => input.password === input.passwordConfirmation, { message: "The passwords do not match.", path: ["passwordConfirmation"] });

export const EmailChangeInputSchema = z.object({ email: z.email("Enter a valid email address.") });

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateInputSchema>;
