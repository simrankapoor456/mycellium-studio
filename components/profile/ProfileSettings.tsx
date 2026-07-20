"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { changeEmailAction, changePasswordAction, updateProfileAction } from "@/app/(protected)/settings/profile/actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { initialActionState, type ActionState } from "@/lib/actions/action-state";

type ProfileData = Readonly<{
  displayName: string;
  avatarUrl: string;
  timezone: string;
  location: string;
  email: string;
  createdAt: string;
}>;

export function ProfileSettings({ profile }: { profile: ProfileData }) {
  const [profileState, profileAction] = useActionState(updateProfileAction, initialActionState);
  const [emailState, emailAction] = useActionState(changeEmailAction, initialActionState);
  const [passwordState, passwordAction] = useActionState(changePasswordAction, initialActionState);
  const initials = getInitials(profile.displayName || profile.email);

  return (
    <main className="profile-settings">
      <header>
        <span className="eyebrow">Personal studio</span>
        <h1>Your profile, quietly yours.</h1>
        <p>Manage the identity and account details used inside your private workspace. Each section saves independently.</p>
      </header>

      <section aria-label="Account identity" className="profile-settings__identity">
        <div className="profile-avatar">
          {profile.avatarUrl ? (
            // User-provided avatar hosts are intentionally unrestricted.
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="Profile avatar" height={96} src={profile.avatarUrl} width={96} />
          ) : <span aria-label={`Initials: ${initials}`}>{initials}</span>}
        </div>
        <div>
          <strong>{profile.displayName || "Account owner"}</strong>
          <span>{profile.email}</span>
          <small>Member since {formatDate(profile.createdAt)}</small>
        </div>
      </section>

      <div className="profile-settings__grid">
        <ProfileForm action={profileAction} profile={profile} state={profileState} />
        <section aria-labelledby="security-heading" className="profile-settings__section profile-settings__security">
          <header className="profile-settings__section-header">
            <span className="eyebrow">Security</span>
            <h2 id="security-heading">Email and password</h2>
            <p>Email changes require confirmation through Supabase. Password changes apply to this account after a successful request.</p>
          </header>

          <form action={emailAction} className="profile-settings__form">
            <TextField defaultValue={profile.email} error={emailState.fieldErrors?.email?.[0]} id="security-email" label="New email address" name="email" required type="email" />
            <SubmitButton label="Request email change" pendingLabel="Sending request" />
            <ActionMessage state={emailState} />
          </form>

          <form action={passwordAction} className="profile-settings__form">
            <TextField autoComplete="new-password" error={passwordState.fieldErrors?.password?.[0]} hint="Use at least 12 characters." id="security-password" label="New password" minLength={12} name="password" required type="password" />
            <TextField autoComplete="new-password" error={passwordState.fieldErrors?.passwordConfirmation?.[0]} id="security-password-confirmation" label="Confirm new password" minLength={12} name="passwordConfirmation" required type="password" />
            <SubmitButton label="Change password" pendingLabel="Changing password" />
            <ActionMessage state={passwordState} />
          </form>
        </section>
      </div>

      <aside className="profile-settings__removal">
        <span className="eyebrow">Account</span>
        <h2>Account and data removal</h2>
        <p>Self-service removal is not enabled because it requires a privileged server operation. Ask the operator of this deployment to remove the Auth account and its owned project data.</p>
      </aside>
    </main>
  );
}

function ProfileForm({ action, profile, state }: Readonly<{ action: (payload: FormData) => void; profile: ProfileData; state: ActionState }>) {
  return (
    <section aria-labelledby="profile-heading" className="profile-settings__section">
      <header className="profile-settings__section-header">
        <span className="eyebrow">Profile</span>
        <h2 id="profile-heading">Identity and context</h2>
        <p>These details shape how your account appears inside Mycellium. Saving here does not change your email.</p>
      </header>
      <form action={action} className="profile-settings__form">
        <TextField defaultValue={profile.displayName} error={state.fieldErrors?.displayName?.[0]} id="profile-display-name" label="Display name" maxLength={80} name="displayName" />
        <TextField defaultValue={profile.avatarUrl} error={state.fieldErrors?.avatarUrl?.[0]} hint="Use a complete HTTPS image URL, or leave blank for initials." id="profile-avatar-url" label="Avatar URL" maxLength={2_000} name="avatarUrl" type="url" />
        <TextField defaultValue={profile.timezone} error={state.fieldErrors?.timezone?.[0]} hint="For example, America/Los_Angeles." id="profile-timezone" label="Timezone" maxLength={100} name="timezone" />
        <TextField defaultValue={profile.location} error={state.fieldErrors?.location?.[0]} id="profile-location" label="Location" maxLength={120} name="location" />
        <SubmitButton label="Save profile" pendingLabel="Saving profile" />
        <ActionMessage state={state} />
      </form>
    </section>
  );
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <Button aria-busy={pending} disabled={pending} type="submit">{pending ? pendingLabel : label}</Button>;
}

function ActionMessage({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;
  return <p aria-live="polite" data-status={state.status} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>;
}

function TextField({ error, hint, id, label, name, ...inputProps }: Readonly<{
  error?: string | undefined;
  hint?: string | undefined;
  id: string;
  label: string;
  name: string;
} & React.InputHTMLAttributes<HTMLInputElement>>) {
  const descriptionId = `${id}-description`;
  return (
    <FormField error={error} hint={hint} htmlFor={id} label={label}>
      <input
        aria-describedby={error || hint ? descriptionId : undefined}
        aria-invalid={Boolean(error)}
        className="form-control mt-2"
        id={id}
        name={name}
        {...inputProps}
      />
    </FormField>
  );
}

function getInitials(value: string): string {
  return value.split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "MS";
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "date unavailable" : new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
}
