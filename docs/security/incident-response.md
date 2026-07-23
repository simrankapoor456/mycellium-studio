# Security incident response

## Severity

- **P0 Critical:** active secret exposure, RLS disabled on private data,
  cross-user data access, unauthenticated private mutation, or authentication
  bypass.
- **P1 High:** incomplete ownership enforcement, privileged action without
  authorization, unsafe privileged function, or sensitive error disclosure.
- **P2 Medium:** excessive grants, weak redirect/input/output controls, missing
  abuse controls, or material hardening gap.
- **P3 Low:** documentation, observability, or process improvement.

## First response

1. Preserve evidence without copying credentials or private project content.
2. Record time, reporter, affected environment, route/table, and secret type.
3. Contain the path: disable the credential, feature, deployment, or access
   policy as appropriate.
4. Rotate an exposed credential at its issuer. Do not continue using it.
5. Invalidate affected sessions and derived tokens where supported.
6. If cross-user access is possible, stop relevant writes and reads until the
   ownership boundary is restored.
7. Notify the repository, deployment, and database owners through approved
   channels.

## Secret discovered in source or history

- Stop displaying surrounding content.
- Record only type, current path or commit, and whether it is current or
  historical.
- Remove it from the current tree and rotate immediately.
- Do not rewrite published Git history automatically.
- Prepare a coordinated history-remediation plan if exposure scope justifies it.
- Enable GitHub secret scanning and push protection before resuming normal work.

## Database or RLS incident

1. Capture policy/grant metadata with the read-only audit script.
2. Do not run a destructive reset or drop policy/table.
3. Identify affected roles, tables, operations, and time window.
4. Add a forward-only least-privilege migration.
5. Test with two controlled users in an isolated environment.
6. Review logs for cross-user reads/writes and export access.
7. Apply production remediation only with explicit approval and a rollback plan.

## Application incident

- Return generic typed errors to users.
- Log event names, safe identifiers, status, and sanitized error codes only.
- Do not log request bodies, discovery content, blueprint payloads, cookies,
  tokens, or provider responses.
- Patch on a review branch, run all quality gates, and deploy only through the
  approved release path.

## Recovery and follow-up

- Confirm containment through independent checks.
- Restore from a verified backup only when integrity requires it.
- Document affected assets and user-notification decision.
- Add regression coverage and monitoring.
- Record remaining uncertainty explicitly.
- Hold a blameless review and assign each follow-up an owner.
