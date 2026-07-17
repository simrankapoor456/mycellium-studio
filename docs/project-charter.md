# mycellium studio project charter

## Product statement

mycellium studio helps people turn rough software ideas into grounded, reviewable execution plans.

## Problem

Early planning often arrives as loose notes, stakeholder requests, and assumptions. Converting that material into coherent scope, stories, tasks, dependencies, review questions, and sprint allocations takes time and can hide uncertainty.

mycellium studio creates a structured first pass while keeping facts, assumptions, missing requirements, and human review points visible.

## Target users

- Solo builders planning a first release
- Product managers shaping an initial backlog
- Engineering leads preparing delivery work
- Agencies translating client briefs into plans
- Students learning structured software planning

## Phase 1 goal

Prove the technical contract before introducing service dependencies. Given the same valid input, the local planner must return the same schema-valid plan and export it to portable formats.

## Phase 1 success criteria

- The application installs, lints, typechecks, tests, and builds reproducibly.
- Runtime input and output contracts have one canonical Zod source.
- Identical input produces identical output.
- Markdown, JSON, and CSV exports are derived from the canonical plan.
- The original prototype remains available unchanged under `legacy-static/`.
- No secrets or unapproved service integrations enter the repository.

## Product principles

- Ground plans in supplied context.
- Separate known facts from assumptions.
- Make missing information visible.
- Require human judgment before external publishing.
- Keep portable data contracts independent of UI and vendors.
- Add infrastructure only when a validated product need requires it.

## Phase 1 non-goals

- Accounts, authentication, or permissions
- Saved workspaces or database persistence
- AI-generated output or provider selection
- Billing, teams, and collaboration
- Direct publication to third-party tools
- Autonomous software delivery
