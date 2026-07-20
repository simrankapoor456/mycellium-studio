# Form guidelines

Mycellium forms make requirements, progress, recovery, and saved state explicit. Labels remain visible above controls. Placeholders provide examples but never replace labels.

## Shared components

- `TextField`, `TextareaField`, and `SelectField` pair the control with a visible label, hint, required or optional marker, inline error, `aria-invalid`, and `aria-describedby`.
- `ComboboxField` provides keyboard-searchable listbox behavior for structured values such as IANA timezones while retaining the underlying string form value.
- `FormActionMessage` communicates success or a classified failure in a live region. Authentication failures include a sign-in recovery link.
- `FormSubmitButton` owns idle, pending, saved, and retry labels and prevents duplicate submissions while an action is pending.
- `DirtyIndicator` says whether a section has unsaved changes.
- `SuccessToast` is supplementary confirmation. Inline status remains the source of truth.
- `useTrustedForm` runs client validation, focuses the first invalid control, preserves values, blocks offline submissions, and warns before dirty navigation.

## Field rules

1. Put the label above the control.
2. Mark every field as required or optional. The HTML `required` attribute and visible marker must agree.
3. Put hints and errors below the control. Errors replace hints until the field changes.
4. Keep one actionable message per error. Explain what happened and how to recover.
5. Never clear a value because validation, network, authentication, database, or permission work failed.
6. Reset sensitive or dirty state only after confirmed success or an explicit user reset.
7. Disable the submit control while its request is pending.

## Discovery composer

- One stable current question sits directly above the answer field.
- Share answer is the primary action. Mark unknown and Ask later are secondary controls and require no text.
- Explain why this matters uses a native details disclosure.
- Review current foundation remains reachable regardless of readiness state.
- Enter inserts a line break. Control or Command plus Enter submits and is declared with helper text and `aria-keyshortcuts`.
- Pending state disables all turn actions and exposes busy state. Failure keeps the answer in place.
- Success updates the current question and a truthful change summary without inserting duplicate question copy into the conversation.

## Foundation fact actions

- Edit fact opens a bounded editor with Save changes and Cancel.
- Confirm fact is primary only when confirmation is relevant.
- Keep unknown is secondary. Confirm assumption is a success action only for an explicit unknown that has not been accepted for carry-forward.
- Reject from foundation is quiet because it is reversible through later editing.
- Delete fact is destructive and always opens a native confirmation dialog.
- Mutation feedback stays beside the affected fact, uses status or alert semantics, and returns focus predictably after success.
- A failed mutation keeps the editor and values intact.

## Blueprint and export

- Blueprint edits use the shared loading button and retain uncontrolled field values after a failed request.
- Architecture generation shows no fabricated percent or inferred network stage. It waits for a complete validated persisted result.
- Locked export formats are explanatory articles, not disabled buttons.
- Available export buttons report the real response filename, size, Blueprint version, and saved timestamp.

## Project creation

Only project name, project description, sprint duration, and team size are required. Product type remains visible but optional. Target users, planning depth, estimated sprint capacity, and constraints live under Advanced planning. Missing planning metadata remains nullable and is inferred later by existing discovery and deterministic blueprint defaults.

The description is the visual focus. A structural Foundation preview responds to the current form values but never presents placeholder content as generated product output.

## Profile

Display name is required. Avatar, timezone, and location are optional. Timezones use searchable IANA identifiers and begin with browser detection when no saved value exists. Location uses searchable suggestions while preserving the current single-string database field.

Avatar URLs must use HTTPS and receive a preview before save. Image upload is intentionally deferred. Implement it only after Supabase Storage, ownership policy, file validation, retention, and deletion behavior are approved together.
