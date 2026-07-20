"use server";

import { redirect } from "next/navigation";

import type { ActionState } from "@/lib/actions/action-state";
import { getSafeReturnPath } from "@/lib/auth/return-path";
import { LoginSchema, SignupSchema } from "@/lib/auth/schemas";
import { getServerEnvironment } from "@/lib/env/server";
import { toAuthErrorMessage } from "@/lib/errors/safe-error";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const returnPath = getSafeReturnPath(formData.get("returnTo"));
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { status: "error", message: toAuthErrorMessage(error) };
  }

  redirect(returnPath);
}

export async function signupAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const returnPath = getSafeReturnPath(formData.get("returnTo"));
  const parsed = SignupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const environment = getServerEnvironment();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: buildConfirmationUrl(environment.NEXT_PUBLIC_SITE_URL, returnPath),
    },
  });

  if (error) {
    return { status: "error", message: toAuthErrorMessage(error) };
  }

  if (data.session) {
    redirect(returnPath);
  }

  return {
    status: "success",
    message: "Check your email to confirm your account, then sign in.",
  };
}

function buildConfirmationUrl(siteUrl: string, returnPath: string): string {
  const confirmationUrl = new URL("/auth/confirm", siteUrl);
  confirmationUrl.searchParams.set("next", returnPath);
  return confirmationUrl.toString();
}
