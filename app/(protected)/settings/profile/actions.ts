"use server";

import { revalidatePath } from "next/cache";

import type { ActionState } from "@/lib/actions/action-state";
import { requireUser } from "@/lib/auth/current-user";
import { EmailChangeInputSchema, PasswordChangeInputSchema, ProfileUpdateInputSchema } from "@/lib/domain/profile/schemas";
import { toSafeErrorMessage } from "@/lib/errors/safe-error";
import { updateProfile } from "@/lib/profile/operations";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = ProfileUpdateInputSchema.safeParse({ displayName: formData.get("displayName"), avatarUrl: formData.get("avatarUrl"), timezone: formData.get("timezone"), location: formData.get("location") });
  if (!parsed.success) return { status: "error", message: "Check the highlighted profile fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  const user = await requireUser();
  try { await updateProfile(user.id, parsed.data); }
  catch (error) { return { status: "error", message: toSafeErrorMessage(error, "Your profile could not be saved. Try again.") }; }
  revalidatePath("/settings/profile");
  return { status: "success", message: "Profile saved." };
}

export async function changePasswordAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = PasswordChangeInputSchema.safeParse({ password: formData.get("password"), passwordConfirmation: formData.get("passwordConfirmation") });
  if (!parsed.success) return { status: "error", message: "Check the password fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  await requireUser(); const supabase = await createClient(); const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  return error ? { status: "error", message: "Your password could not be changed. Sign in again and retry." } : { status: "success", message: "Password changed." };
}

export async function changeEmailAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = EmailChangeInputSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { status: "error", message: "Enter a valid email address.", fieldErrors: parsed.error.flatten().fieldErrors };
  await requireUser(); const supabase = await createClient(); const { error } = await supabase.auth.updateUser({ email: parsed.data.email });
  return error ? { status: "error", message: "The email change request could not be sent. Try again." } : { status: "success", message: "Check both email addresses to finish the change." };
}
