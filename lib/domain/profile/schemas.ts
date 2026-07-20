import { z } from "zod";

const optionalText = (maximum: number) => z.string().trim().max(maximum).transform((value) => value || null);
const optionalHttpsUrl = z.string().trim().max(2_000).refine((value) => {
  if (value === "") return true;
  try { return new URL(value).protocol === "https:"; }
  catch { return false; }
}, "Please enter a valid HTTPS image URL.").transform((value) => value || null);

const optionalTimezone = z.string().trim().max(100).refine((value) => {
  if (value === "") return true;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}, "Choose a valid timezone.").transform((value) => value || null);

export const ProfileUpdateInputSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required.").max(80),
  avatarUrl: optionalHttpsUrl,
  timezone: optionalTimezone,
  location: optionalText(120),
});

export const PasswordChangeInputSchema = z.object({
  password: z.string().min(12, "Use at least 12 characters.").max(200),
  passwordConfirmation: z.string(),
}).refine((input) => input.password === input.passwordConfirmation, { message: "The passwords do not match.", path: ["passwordConfirmation"] });

export const EmailChangeInputSchema = z.object({ email: z.email("Enter a valid email address.") });

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateInputSchema>;
