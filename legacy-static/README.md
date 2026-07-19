# mycellium studio

mycellium studio is a grounded, women-led project planning tool that turns rough software ideas into organized scope, tasks, sprint plans, and review-ready exports.

The first version focuses on one clear promise:

> Ideas connect, branch, and grow into organized work.

## About

mycellium studio helps teams turn messy early ideas into grounded project structure. The current MVP focuses on planning clarity: scope, epics, stories, tasks, sprint allocation, review signals, and export-ready outputs in one calm workspace.

The product direction is nature-inspired, organized, and quietly powerful. It is meant to feel warm and usable without sliding into generic corporate tooling.

The MVP accepts a project description, analyzes the requirements, generates epics, user stories, technical tasks, and sprint allocations, then returns both a readable planning summary and structured output that can later feed tools like Jira, Trello, Notion, Confluence, or Slack.

## MVP Deliverables

- Project overview
- Clarified goals, assumptions, constraints, and missing details
- Epics
- User stories with acceptance criteria
- Technical tasks and subtasks
- Priority and effort estimates
- Sprint allocation
- Markdown summary
- JSON output
- Human review gate before publishing to external tools

## Current MVP

mycellium studio now has a free, deployable static prototype in this folder.

- Open `index.html` locally to try it.
- Or run `node server.mjs` from this folder and open `http://127.0.0.1:4173`.
- Paste a project idea or load the sample.
- Shape a structured plan with grounded scope, epics, stories, tasks, sprint allocation, and review questions.
- Filter by search, priority, owner, and review status.
- Edit generated text directly on the page.
- Export Markdown, JSON, or CSV.

This version avoids paid n8n subscriptions and does not require a backend. It is ready for simple hosting on GitHub Pages, Netlify, Vercel static hosting, or any basic web server.

## Recommended Next Stack

- Static frontend for the first release
- Optional AI API later for stronger generation quality
- Structured JSON schema as the internal output format
- Markdown/JSON/CSV as the first export formats
- SQLite, Supabase, or Firebase only after saved projects become necessary

## Project Docs

- [Project Charter](docs/project-charter.md)
- [MVP Architecture](docs/mvp-architecture.md)
- [Build Plan](docs/build-plan.md)
- [Output Schema](docs/output-schema.md)
