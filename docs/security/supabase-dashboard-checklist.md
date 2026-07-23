# Supabase dashboard checklist

Record evidence without copying credentials, tokens, user data, or provider
payloads. Mark each item **verified**, **remediation required**, or **not
applicable**.

## Authentication

- [ ] Site URL is the intended production origin.
- [ ] Allowed redirect URLs include only exact local, preview, and production
      origins required by the application; no broad wildcard is unnecessary.
- [ ] Email confirmation is enabled for production.
- [ ] Password reset redirects use the approved origins.
- [ ] Email changes require the intended confirmation flow.
- [ ] Password minimum and strength requirements match the product policy.
- [ ] Leaked/breached-password protection is enabled if the plan supports it.
- [ ] Anonymous sign-ins are disabled.
- [ ] Only intentionally supported OAuth providers are enabled.
- [ ] Session duration matches product risk.
- [ ] Refresh-token rotation and reuse detection are enabled as supported.
- [ ] MFA availability and current product decision are documented.
- [ ] CAPTCHA/bot protection decision is documented for login and signup.
- [ ] SMTP sender, domain authentication, bounce handling, and abuse ownership
      are configured.
- [ ] Auth rate limits cover login, signup, confirmation, recovery, and email
      changes.

## Database

- [ ] Run `supabase/security/verify_security_posture.sql`.
- [ ] All five expected application tables exist.
- [ ] RLS is enabled on every application table.
- [ ] Policy names, roles, commands, `USING`, and `WITH CHECK` match the
      expected posture.
- [ ] Anonymous and PUBLIC write-grant query returns zero rows.
- [ ] Authenticated column grants match the access-control matrix.
- [ ] Composite project-owner foreign keys exist.
- [ ] Existing child rows show no owner/project mismatch.
- [ ] After the mismatch query is clean, validate the three `NOT VALID`
      constraints in a separately reviewed migration or maintenance action.
- [ ] Exposed schemas include only those intended for the Data API.
- [ ] `private` is not exposed and API roles cannot use or create in it.
- [ ] Database roles and memberships have no unexplained privileged role.
- [ ] Connection SSL expectations are enforced for external clients.
- [ ] Network restrictions are configured where supported and operationally
      practical.
- [ ] Backups are enabled and a restore procedure has been exercised.
- [ ] Point-in-time recovery availability and retention are documented.
- [ ] Extensions are limited to reviewed requirements.
- [ ] Migration history includes every repository migration in order.

## Storage

- [ ] Confirm whether any bucket exists.
- [ ] No private application data is in a public bucket.
- [ ] Private buckets have owner/project RLS policies.
- [ ] Upload size and MIME allowlists are configured.
- [ ] Upload validation does not rely only on filename extensions.
- [ ] Signed URL lifetime and sharing behavior are documented.
- [ ] Deletion and project/account cascade behavior are documented.
- [ ] If Storage remains unused, record that decision and remove obsolete buckets.

## API and project settings

- [ ] Publishable key is treated as public configuration.
- [ ] The configured local/Vercel publishable key belongs to this project and
      succeeds at the Data API boundary; the 2026-07-23 read-only probe received
      HTTP 401 before policy evaluation.
- [ ] No service-role key is present in browser or public variables.
- [ ] JWT/signing-key rotation ownership is documented.
- [ ] Data API schema exposure matches the application requirement.
- [ ] Realtime is disabled for tables that do not use it.
- [ ] Database webhooks and Edge Functions have no obsolete credentials.

## Logs and monitoring

- [ ] Review authentication failures and unusual signup/login rates.
- [ ] Review repeated 401/403 responses and cross-project access attempts.
- [ ] Review PostgREST schema and RLS errors.
- [ ] Review direct service-role usage; expected result for this application is none.
- [ ] Configure retention and alerts appropriate to the plan.
- [ ] Ensure logs do not include project source material, tokens, or full
      provider responses.

## Vercel environment follow-up

- [ ] `NEXT_PUBLIC_SUPABASE_URL` exists in Preview and Production as intended.
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` exists in Preview and Production
      and belongs to the selected Supabase project.
- [ ] `NEXT_PUBLIC_SITE_URL` has the correct value per environment.
- [ ] `OPENAI_API_KEY`, if enabled later, is server-only and scoped deliberately.
- [ ] No service-role credential or database URL is exposed through a
      `NEXT_PUBLIC_` variable.
- [ ] Re-run `vercel env ls` and confirm the expected names appear without
      copying their values. The 2026-07-23 CLI review returned zero rows.
