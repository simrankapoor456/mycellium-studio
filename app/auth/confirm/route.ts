import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getSafeReturnPath } from "@/lib/auth/return-path";

const ConfirmationSchema = z.object({
  token_hash: z.string().min(1),
  type: z.enum(["signup", "invite", "magiclink", "recovery", "email_change", "email"]),
});

export async function GET(request: NextRequest) {
  const returnPath = getSafeReturnPath(request.nextUrl.searchParams.get("next"));
  const parsed = ConfirmationSchema.safeParse({
    token_hash: request.nextUrl.searchParams.get("token_hash"),
    type: request.nextUrl.searchParams.get("type"),
  });

  if (parsed.success) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: parsed.data.token_hash,
      type: parsed.data.type satisfies EmailOtpType,
    });

    if (!error) {
      return NextResponse.redirect(new URL(returnPath, request.url));
    }
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("error", "confirmation");
  loginUrl.searchParams.set("next", returnPath);
  return NextResponse.redirect(loginUrl);
}
