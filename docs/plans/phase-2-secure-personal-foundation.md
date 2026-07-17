# Phase 2 secure personal-user foundation

Status: Complete

## WORKFLOW STATE

Package Manager: npm (via package.json packageManager field)
Framework: Next.js App Router 16.2.10
Verification: npm test, npm run lint, npx tsc --noEmit, npm run build

## Objective

Add cookie-based Supabase authentication, database-backed personal projects, discovery persistence, and defense-in-depth ownership enforcement without introducing AI, billing, teams, or external integrations.

## Security boundary

- Next.js Proxy refreshes cookie sessions with verified claims.
- Server layouts and operations verify authenticated identity.
- PostgreSQL Row-Level Security remains authoritative for personal data.
- The application uses only the public Supabase URL and publishable key.
- All writes pass Zod validation and user-facing errors are sanitized.

## Implementation sequence

1. Pin and inspect compatible Supabase SSR packages.
2. Add database migration, constraints, triggers, grants, indexes, and RLS.
3. Add environment validation, browser/server clients, and session Proxy.
4. Add signup, login, confirmation, logout, and protected layouts.
5. Add project schemas, operations, dashboard, creation, and detail routes.
6. Add pure tests and manual two-user RLS verification documentation.
7. Run all quality gates, review security, commit logically, and push.
