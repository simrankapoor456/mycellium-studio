"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { changeEmailAction, changePasswordAction, updateProfileAction } from "@/app/(protected)/settings/profile/actions";
import { ComboboxField } from "@/components/forms/ComboboxField";
import { TextField } from "@/components/forms/FormControls";
import { DirtyIndicator, FormActionMessage, FormSubmitButton, SuccessToast } from "@/components/forms/FormStatus";
import { useTrustedForm, useUnsavedChanges } from "@/components/forms/useTrustedForm";
import { initialActionState, type ActionState } from "@/lib/actions/action-state";
import { LOCATION_SUGGESTIONS, getTimezoneOptions } from "@/lib/domain/profile/options";
import { EmailChangeInputSchema, PasswordChangeInputSchema, ProfileUpdateInputSchema } from "@/lib/domain/profile/schemas";

type ProfileData = Readonly<{
  displayName: string;
  avatarUrl: string;
  timezone: string;
  location: string;
  email: string;
  createdAt: string;
}>;

type IdentityValues = { displayName: string; avatarUrl: string; timezone: string; location: string };

export function ProfileSettings({ profile }: { profile: ProfileData }) {
  const [profileState, profileAction] = useActionState(updateProfileAction, initialActionState);
  const [emailState, emailAction] = useActionState(changeEmailAction, initialActionState);
  const [passwordState, passwordAction] = useActionState(changePasswordAction, initialActionState);
  const [identityValues, setIdentityValues] = useState<IdentityValues>({ displayName: profile.displayName, avatarUrl: profile.avatarUrl, timezone: profile.timezone, location: profile.location });
  const [savedIdentity, setSavedIdentity] = useState(identityValues);
  const [email, setEmail] = useState(profile.email);
  const [savedEmail, setSavedEmail] = useState(profile.email);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [successNotice, setSuccessNotice] = useState<{ id: number; message: string } | null>(null);
  const successSequence = useRef(0);
  const handledProfileSuccess = useRef<ActionState | null>(null);
  const handledEmailSuccess = useRef<ActionState | null>(null);
  const handledPasswordSuccess = useRef<ActionState | null>(null);
  const identityDirty = JSON.stringify(identityValues) !== JSON.stringify(savedIdentity);
  const emailDirty = email !== savedEmail;
  const passwordDirty = Boolean(password || passwordConfirmation);
  const initials = getInitials(profile.displayName || profile.email);
  useUnsavedChanges(identityDirty || emailDirty || passwordDirty);

  useEffect(() => {
    if (profileState.status !== "success" || handledProfileSuccess.current === profileState) return;
    handledProfileSuccess.current = profileState;
    const frame = window.requestAnimationFrame(() => {
      setSavedIdentity(identityValues);
      successSequence.current += 1;
      setSuccessNotice({ id: successSequence.current, message: profileState.message });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [identityValues, profileState]);

  useEffect(() => {
    if (emailState.status !== "success" || handledEmailSuccess.current === emailState) return;
    handledEmailSuccess.current = emailState;
    const frame = window.requestAnimationFrame(() => {
      setSavedEmail(email);
      successSequence.current += 1;
      setSuccessNotice({ id: successSequence.current, message: emailState.message });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [email, emailState]);

  useEffect(() => {
    if (passwordState.status !== "success" || handledPasswordSuccess.current === passwordState) return;
    handledPasswordSuccess.current = passwordState;
    const frame = window.requestAnimationFrame(() => {
      setPassword("");
      setPasswordConfirmation("");
      successSequence.current += 1;
      setSuccessNotice({ id: successSequence.current, message: passwordState.message });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [passwordState]);

  return (
    <main className="profile-settings">
      <header>
        <span className="eyebrow">Personal studio</span>
        <h1>Your profile, quietly yours.</h1>
        <p>Manage the identity and account details used inside your private workspace. Each section saves independently.</p>
      </header>

      <section aria-label="Account identity" className="profile-settings__identity">
        <Avatar value={profile.avatarUrl} fallback={initials} label="Profile avatar" />
        <div>
          <strong>{profile.displayName || "Account owner"}</strong>
          <span>{profile.email}</span>
          <small>Member since {formatDate(profile.createdAt)}</small>
        </div>
      </section>

      <div className="profile-settings__grid">
        <ProfileForm action={profileAction} dirty={identityDirty} onChange={setIdentityValues} state={profileState} values={identityValues} />
        <section aria-labelledby="security-heading" className="profile-settings__section profile-settings__security">
          <header className="profile-settings__section-header">
            <span className="eyebrow">Security</span>
            <h2 id="security-heading">Email and password</h2>
            <p>Email changes require confirmation through Supabase. Password changes apply after a successful request.</p>
          </header>
          <EmailForm action={emailAction} dirty={emailDirty} email={email} onChange={setEmail} state={emailState} />
          <PasswordForm action={passwordAction} confirmation={passwordConfirmation} dirty={passwordDirty} onConfirmationChange={setPasswordConfirmation} onPasswordChange={setPassword} password={password} state={passwordState} />
        </section>
      </div>

      <aside className="profile-settings__removal">
        <span className="eyebrow">Account</span>
        <h2>Account and data removal</h2>
        <p>Self-service removal is not enabled because it requires a privileged server operation. Ask the operator of this deployment to remove the Auth account and its owned project data.</p>
      </aside>
      {successNotice ? <SuccessToast key={successNotice.id} message={successNotice.message} /> : null}
    </main>
  );
}

function ProfileForm({ action, dirty, onChange, state, values }: Readonly<{ action: (payload: FormData) => void; dirty: boolean; onChange: (values: IdentityValues) => void; state: ActionState; values: IdentityValues }>) {
  const formRef = useRef<HTMLFormElement>(null);
  const timezones = useMemo(() => getTimezoneOptions(), []);
  const validate = useCallback((formData: FormData) => {
    const parsed = ProfileUpdateInputSchema.safeParse({ displayName: formData.get("displayName"), avatarUrl: formData.get("avatarUrl"), timezone: formData.get("timezone"), location: formData.get("location") });
    return parsed.success ? {} : parsed.error.flatten().fieldErrors;
  }, []);
  const trust = useTrustedForm({ dirty, formRef, serverState: state, validate, warnOnNavigate: false });

  useEffect(() => {
    if (values.timezone) return;
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected) return;
    const frame = window.requestAnimationFrame(() => onChange({ ...values, timezone: detected }));
    return () => window.cancelAnimationFrame(frame);
  }, [onChange, values]);

  function update(name: keyof IdentityValues, value: string) {
    onChange({ ...values, [name]: value });
    trust.onFieldChange(name);
  }

  return (
    <section aria-labelledby="profile-heading" className="profile-settings__section">
      <header className="profile-settings__section-header">
        <span className="eyebrow">Profile</span>
        <h2 id="profile-heading">Identity and context</h2>
        <p>These details shape how your account appears inside Mycellium. Saving here does not change your email.</p>
      </header>
      <form action={action} className="profile-settings__form" noValidate onSubmit={trust.onSubmit} ref={formRef}>
        <TextField error={trust.fieldErrors.displayName?.[0]} id="profile-display-name" label="Display name" maxLength={80} name="displayName" onChange={(event) => update("displayName", event.currentTarget.value)} requirement="required" value={values.displayName} />
        <div className="profile-avatar-editor">
          <Avatar fallback={getInitials(values.displayName)} key={values.avatarUrl} label="Avatar preview" value={values.avatarUrl} />
          <TextField error={trust.fieldErrors.avatarUrl?.[0]} hint="Use a complete HTTPS image URL. Upload support is deferred until storage infrastructure is approved." id="profile-avatar-url" label="Avatar URL" maxLength={2_000} name="avatarUrl" onChange={(event) => update("avatarUrl", event.currentTarget.value)} requirement="optional" type="url" value={values.avatarUrl} />
        </div>
        <ComboboxField error={trust.fieldErrors.timezone?.[0]} hint="Detected from your browser on first visit. Stored as an IANA timezone." id="profile-timezone" label="Timezone" name="timezone" onValueChange={(value) => update("timezone", value)} options={timezones} placeholder="Search timezones" value={values.timezone} />
        <ComboboxField error={trust.fieldErrors.location?.[0]} hint="Search common locations or enter a city, region, and country." id="profile-location" label="Location" name="location" onValueChange={(value) => update("location", value)} options={LOCATION_SUGGESTIONS} placeholder="Search locations" value={values.location} />
        <div className="form-save-row"><FormSubmitButton dirty={dirty} idleLabel="Save profile" pendingLabel="Saving profile" state={trust.state} /><DirtyIndicator dirty={dirty} /></div>
        <FormActionMessage state={trust.state} />
      </form>
    </section>
  );
}

function EmailForm({ action, dirty, email, onChange, state }: Readonly<{ action: (payload: FormData) => void; dirty: boolean; email: string; onChange: (value: string) => void; state: ActionState }>) {
  const formRef = useRef<HTMLFormElement>(null);
  const validate = useCallback((formData: FormData) => {
    const parsed = EmailChangeInputSchema.safeParse({ email: formData.get("email") });
    return parsed.success ? {} : parsed.error.flatten().fieldErrors;
  }, []);
  const trust = useTrustedForm({ dirty, formRef, serverState: state, validate, warnOnNavigate: false });
  return (
    <form action={action} className="profile-settings__form" noValidate onSubmit={trust.onSubmit} ref={formRef}>
      <TextField error={trust.fieldErrors.email?.[0]} id="security-email" label="New email address" name="email" onChange={(event) => { onChange(event.currentTarget.value); trust.onFieldChange("email"); }} requirement="required" type="email" value={email} />
      <div className="form-save-row"><FormSubmitButton dirty={dirty} idleLabel="Request email change" pendingLabel="Sending request" state={trust.state} /><DirtyIndicator dirty={dirty} /></div>
      <FormActionMessage state={trust.state} />
    </form>
  );
}

function PasswordForm({ action, confirmation, dirty, onConfirmationChange, onPasswordChange, password, state }: Readonly<{ action: (payload: FormData) => void; confirmation: string; dirty: boolean; onConfirmationChange: (value: string) => void; onPasswordChange: (value: string) => void; password: string; state: ActionState }>) {
  const formRef = useRef<HTMLFormElement>(null);
  const validate = useCallback((formData: FormData) => {
    const parsed = PasswordChangeInputSchema.safeParse({ password: formData.get("password"), passwordConfirmation: formData.get("passwordConfirmation") });
    return parsed.success ? {} : parsed.error.flatten().fieldErrors;
  }, []);
  const trust = useTrustedForm({ dirty, formRef, serverState: state, validate, warnOnNavigate: false });
  return (
    <form action={action} className="profile-settings__form" noValidate onSubmit={trust.onSubmit} ref={formRef}>
      <TextField autoComplete="new-password" error={trust.fieldErrors.password?.[0]} hint="Use at least 12 characters." id="security-password" label="New password" maxLength={200} name="password" onChange={(event) => { onPasswordChange(event.currentTarget.value); trust.onFieldChange("password"); }} requirement="required" type="password" value={password} />
      <TextField autoComplete="new-password" error={trust.fieldErrors.passwordConfirmation?.[0]} id="security-password-confirmation" label="Confirm new password" maxLength={200} name="passwordConfirmation" onChange={(event) => { onConfirmationChange(event.currentTarget.value); trust.onFieldChange("passwordConfirmation"); }} requirement="required" type="password" value={confirmation} />
      <div className="form-save-row"><FormSubmitButton dirty={dirty} idleLabel="Change password" pendingLabel="Changing password" state={trust.state} /><DirtyIndicator dirty={dirty} /></div>
      <FormActionMessage state={trust.state} />
    </form>
  );
}

function Avatar({ fallback, label, value }: { fallback: string; label: string; value: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="profile-avatar">
      {value && !failed ? (
        // User-provided avatar hosts are intentionally unrestricted.
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={label} height={96} onError={() => setFailed(true)} src={value} width={96} />
      ) : <span aria-label={`Initials: ${fallback || "MS"}`}>{fallback || "MS"}</span>}
    </div>
  );
}

function getInitials(value: string): string {
  return value.split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "MS";
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "date unavailable" : new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
}
