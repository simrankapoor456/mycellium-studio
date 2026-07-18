# Canonical planning contracts

The executable source of truth is [`lib/domain/plan/schemas.ts`](../lib/domain/plan/schemas.ts). Documentation summarizes the contract; it does not replace runtime validation.

## Input

`PlanningInputSchema` accepts:

| Field | Rule | Default |
| --- | --- | --- |
| `brief` | trimmed string, 20–10,000 characters | required |
| `projectName` | trimmed string, 1–120 characters | inferred from brief |
| `projectType` | supported project-type literal | `web-app` |
| `teamSize` | integer, 1–50 | `3` |
| `sprintDurationWeeks` | integer, 1–4 | `2` |
| `sprintCapacityPoints` | integer, 1–200 | `24` |
| `planningDepth` | `lean`, `balanced`, or `detailed` | `balanced` |

The exported `PlannerInput` type represents pre-parse input, while `NormalizedPlannerInput` represents Zod output after defaults are applied.

## Output

`PlanOutputSchema` validates this hierarchy:

```text
PlanOutput
├── schema_version
├── project identity and summary
├── target users, goals, assumptions, and constraints
├── missing requirements and risks
├── epics[]
│   └── stories[]
│       ├── acceptance criteria
│       ├── dependencies and estimate
│       └── tasks[]
├── sprints[]
│   └── allocated story references
└── review
    ├── quality score
    ├── warnings
    └── clarifying questions
```

## Invariants

- `schema_version` is currently `1.0`.
- Every plan contains at least one epic and one sprint.
- Every epic contains at least one story.
- Every story contains acceptance criteria and at least one task.
- Priorities and impacts are limited to `low`, `medium`, or `high`.
- Estimates use Fibonacci values `1`, `2`, `3`, `5`, or `8`.
- Task owners use the documented owner-type literal set.
- Sprint allocations reference canonical story identifiers.
- External data must be parsed with the Zod schema rather than asserted as a TypeScript type.

## Naming

Input fields use camel case because they are called directly from TypeScript application code. Canonical output fields use snake case because the output is an export boundary and retains the original prototype vocabulary.

## Export behavior

Markdown and CSV are derived views. JSON is a formatted serialization of a fresh `PlanOutputSchema.parse` result. Export adapters never add application state or publish to another service.

## Versioning

Additive optional fields may remain within schema version `1.x` when defaults preserve existing consumers. Removing or renaming fields, changing identifier semantics, or altering required nesting requires a new major schema version and explicit migration documentation.

## Product Blueprint 2.0

Phase 3B preserves `PlanOutputSchema` 1.0 for the Phase 1 planner and introduces a separate executable contract at `lib/domain/blueprint/schemas.ts`.

`ProductBlueprintSchema` 2.0 contains overview and understanding references; goals; requirements; architecture decisions; scope; epics; stories; acceptance criteria; tasks; dependencies; sprint assignments; risks; review warnings; status; priority; owner; estimates; and explicit lineage on every editable plan entity.

Blueprint and structured-document views operate on the same parsed object. Controlled edits re-parse the complete document, increment its version, mark the entity manually edited, and change its lineage source to `manual`. Markdown, JSON, and normalized CSV exports parse the persisted 2.0 document immediately before serialization.
