# Access-control matrix

The product has two runtime roles: unauthenticated visitors and authenticated
single owners. There is no administrator, team, or service-role application
path.

| Resource or action | Unauthenticated | Authenticated non-owner | Authenticated owner | Enforcement |
| --- | --- | --- | --- | --- |
| Marketing and auth pages | Read | Read | Read | Public routes |
| Protected layout and dashboard | Denied | Own dashboard only | Own dashboard | Server `requireUser` |
| Own profile | Denied | Cannot select another ID | Select/update mutable fields | RLS plus server identity |
| Create project | Denied | Creates only with own `user_id` | Allowed | Server identity, insert `WITH CHECK` |
| Read project | Denied | Hidden as not found | Allowed | RLS and `.eq(user_id)` |
| Update project | Denied | No rows affected | Allowed except immutable identity/timestamps | RLS, owner filter, column grants |
| Delete project | Denied | No rows affected | Allowed | RLS and owner filter |
| Duplicate project | Denied | Source hidden | Allowed; new owner forced to current user | Server fetch and duplication assertion |
| Discovery messages | Denied | Cannot read/attach to foreign project | Select/append within own project | RLS, composite FK, column grants |
| Discovery request ledger | Denied | Cannot read/attach to foreign project | Select; create request; update lifecycle only | RLS, composite FK, column grants |
| Workflow request ledger | Denied | Cannot read/attach to foreign project | Select; create operation; update lifecycle only | RLS, composite FK, column grants |
| Foundation review | Typed 401 | Project hidden as 404 | Allowed when state permits | Orchestration access decision |
| Blueprint generation/edit | Typed 401 | Project hidden as 404 | Allowed when readiness permits | Orchestration, RLS, idempotency |
| Pressure test | Typed 401 | Project hidden as 404 | Allowed for persisted blueprint | Orchestration and RLS |
| Blueprint export | Typed 401 | Project hidden as 404 | Download allowed | Server owner check, no-store response |
| Password/email change | Session error | Own identity only | Own identity only | Supabase Auth server action |
| Direct database administration | None | None | None | Dashboard/operator boundary |

## Table policy matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- |
| `profiles` | `auth.uid() = id` | Trigger only; no authenticated grant | `USING` and `WITH CHECK` require own ID; profile columns only | No authenticated grant |
| `projects` | `auth.uid() = user_id` | `WITH CHECK` requires own user ID | `USING` and `WITH CHECK` require own user ID; identity columns excluded | `USING` requires own user ID |
| `discovery_messages` | Own user plus owned parent | Own user plus owned parent | Policy exists but no authenticated update grant | Policy exists but no authenticated delete grant |
| `discovery_requests` | Own user plus owned parent | Own user plus owned parent | Own user plus owned parent; status/response columns only | No grant or policy |
| `workflow_requests` | Own user plus owned parent | Own user plus owned parent | Own user plus owned parent; status/response columns only | No grant or policy |

Application-level tests do not prove production RLS. Run the read-only SQL audit,
then execute authenticated two-user tests in an isolated environment.
