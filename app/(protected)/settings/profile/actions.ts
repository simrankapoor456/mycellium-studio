"use server";

import { revalidatePath } from "next/cache";

import { sessionExpiredActionState, validationActionState, type ActionState } from "@/lib/actions/action-state";
import { getCurrentUser } from "@/lib/auth/current-user";
import { EmailChangeInputSchema, PasswordChangeInputSchema, ProfileUpdateInputSchema } from "@/lib/domain/profile/schemas";
import { toActionFailure } from "@/lib/errors/safe-error";
import { updateProfile } from "@/lib/profile/operations";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = ProfileUpdateInputSchema.safeParse({ displayName: formData.get("displayName"), avatarUrl: formData.get("avatarUrl"), timezone: formData.get("timezone"), location: formData.get("location") });
  if (!parsed.success) return validationActionState("Fix the highlighted profile fields. Your changes are still here.", parsed.error.flatten().fieldErrors);
  const user = await getCurrentUser();
  if (!user) return sessionExpiredActionState();
  try { await updateProfile(user.id, parsed.data); }
  catch (error) { return toActionFailure(error, { database: "Profile couldn't be saved. Your changes are still here. Retry.", unknown: "Profile couldn't be saved. Your changes are still here. Retry." }); }
  revalidatePath("/settings/profile");
  return { status: "success", message: "Profile saved." };
}

export async function changePasswordAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = PasswordChangeInputSchema.safeParse({ password: formData.get("password"), passwordConfirmation: formData.get("passwordConfirmation") });
  if (!parsed.success) return validationActionState("Fix the highlighted password fields.", parsed.error.flatten().fieldErrors);
  const user = await getCurrentUser(); if (!user) return sessionExpiredActionState();
  const supabase = await createClient(); const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  return error ? toActionFailure(error, { authentication: "Your session expired. Sign in again, then retry.", unknown: "Your password could not be changed. Retry." }) : { status: "success", message: "Password changed." };
}

export async function changeEmailAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = EmailChangeInputSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return validationActionState("Enter a valid email address.", parsed.error.flatten().fieldErrors);
  const user = await getCurrentUser(); if (!user) return sessionExpiredActionState();
  const supabase = await createClient(); const { error } = await supabase.auth.updateUser({ email: parsed.data.email });
  return error ? toActionFailure(error, { authentication: "Your session expired. Sign in again, then retry.", unknown: "The email change request could not be sent. Retry." }) : { status: "success", message: "Check both email addresses to finish the change." };
}
