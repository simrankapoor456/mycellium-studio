import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { requireUser } from "@/lib/auth/current-user";
import { getProfile } from "@/lib/profile/operations";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const user = await requireUser();
  const [profile, supabase] = await Promise.all([getProfile(user.id), createClient()]);
  const { data } = await supabase.auth.getUser();
  return <ProfileSettings profile={{ displayName: profile?.display_name ?? "", avatarUrl: profile?.avatar_url ?? "", timezone: profile?.timezone ?? "", location: profile?.location ?? "", email: data.user?.email ?? user.email ?? "Email unavailable", createdAt: data.user?.created_at ?? profile?.created_at ?? "" }} />;
}
