"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { changeEmailAction, changePasswordAction, updateProfileAction } from "@/app/(protected)/settings/profile/actions";
import { initialActionState, type ActionState } from "@/lib/actions/action-state";

type ProfileData = Readonly<{ displayName: string; avatarUrl: string; timezone: string; location: string; email: string; createdAt: string }>;

export function ProfileSettings({ profile }: { profile: ProfileData }) {
  const [profileState, profileAction] = useActionState(updateProfileAction, initialActionState);
  const [emailState, emailAction] = useActionState(changeEmailAction, initialActionState);
  const [passwordState, passwordAction] = useActionState(changePasswordAction, initialActionState);
  const initials = (profile.displayName || profile.email).split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  return <main className="profile-settings">
    <header><span className="eyebrow">Personal studio</span><h1>Your profile, quietly yours.</h1><p>Manage the identity and account details Mycellium uses inside your private workspace.</p></header>
    <section className="profile-settings__identity">
      <div className="profile-avatar">{profile.avatarUrl ? (
        // User-provided avatar hosts are intentionally unrestricted.
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="Profile avatar" height={96} src={profile.avatarUrl} width={96} />
      ) : <span aria-label={`Initials: ${initials}`}>{initials}</span>}</div>
      <div><strong>{profile.displayName || "Account owner"}</strong><span>{profile.email}</span><small>Studio created {formatDate(profile.createdAt)}</small></div>
    </section>
    <div className="profile-settings__grid">
      <ProfileForm action={profileAction} profile={profile} state={profileState} />
      <section className="profile-settings__account"><div><span className="eyebrow">Account access</span><h2>Email and password</h2></div>
        <form action={emailAction}><TextField defaultValue={profile.email} error={emailState.fieldErrors?.email?.[0]} label="Email address" name="email" required type="email" /><SubmitButton label="Request email change" /><ActionMessage state={emailState} /></form>
        <form action={passwordAction}><TextField autoComplete="new-password" error={passwordState.fieldErrors?.password?.[0]} label="New password" minLength={12} name="password" required type="password" /><TextField autoComplete="new-password" error={passwordState.fieldErrors?.passwordConfirmation?.[0]} label="Confirm new password" minLength={12} name="passwordConfirmation" required type="password" /><SubmitButton label="Change password" /><ActionMessage state={passwordState} /></form>
      </section>
    </div>
    <aside className="profile-settings__removal"><h2>Account removal</h2><p>Self-service removal is not enabled because it requires a privileged server operation. Contact the studio administrator to request deactivation and data removal.</p></aside>
  </main>;
}

function ProfileForm({ action, profile, state }: Readonly<{ action: (payload: FormData) => void; profile: ProfileData; state: ActionState }>) {
  return <section><div><span className="eyebrow">Profile details</span><h2>How you appear here</h2></div><form action={action}>
    <TextField defaultValue={profile.displayName} error={state.fieldErrors?.displayName?.[0]} label="Display name" maxLength={80} name="displayName" />
    <TextField defaultValue={profile.avatarUrl} error={state.fieldErrors?.avatarUrl?.[0]} label="Avatar URL" maxLength={2_000} name="avatarUrl" type="url" />
    <TextField defaultValue={profile.timezone} error={state.fieldErrors?.timezone?.[0]} label="Timezone" maxLength={100} name="timezone" placeholder="America/Los_Angeles" />
    <TextField defaultValue={profile.location} error={state.fieldErrors?.location?.[0]} label="Location" maxLength={120} name="location" />
    <SubmitButton label="Save profile" /><ActionMessage state={state} />
  </form></section>;
}

function SubmitButton({ label }: { label: string }) { const { pending } = useFormStatus(); return <button disabled={pending} type="submit">{pending ? "Saving" : label}</button>; }
function ActionMessage({ state }: { state: ActionState }) { return state.status === "idle" ? null : <p aria-live="polite" data-status={state.status}>{state.message}</p>; }
function TextField({ error, label, name, ...inputProps }: Readonly<{ error?: string | undefined; label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>>) { const errorId = `${name}-error`; return <label>{label}<input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} name={name} {...inputProps} />{error ? <small id={errorId}>{error}</small> : null}</label>; }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.valueOf()) ? "date unavailable" : new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date); }
