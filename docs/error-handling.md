# Error handling

User-facing failures are classified before they are rendered. Provider messages and internal database details are never exposed.

| Kind | User meaning | Recovery |
| --- | --- | --- |
| Validation | One or more inputs are invalid | Correct the highlighted field; no request is sent |
| Network | The server or Supabase could not be reached | Keep the values, check connectivity, retry |
| Authentication | The session is missing or expired | Keep the values, sign in again, retry |
| Database | Persistence rejected or failed | Keep the values and retry in a moment |
| Permission | The authenticated user cannot perform the operation | Keep context visible and explain the ownership boundary |
| Unknown | No safe specific category matched | Keep the values and offer a bounded retry |

## Action contract

`ActionState` carries `status`, a safe `message`, optional `fieldErrors`, an optional `errorKind`, retryability, and an optional post-success redirect target. Validation and session-expiry helpers keep copy consistent across project and profile actions.

Pending buttons prevent duplicate requests. Retry labels appear only for recoverable failures. A success toast reinforces completion but never replaces the inline status region.

Client fetch editors distinguish 401, 403, network `TypeError`, provider response errors, and unknown errors. Their uncontrolled or controlled fields reset only after successful persistence.
