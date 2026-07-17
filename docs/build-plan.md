# mycellium Build Plan

## Phase 0: Definition

Goal: make the MVP clear before building.

Deliverables:

- Product statement
- MVP scope
- Input format
- Output schema
- Success metrics
- First demo scenario

Acceptance criteria:

- The MVP can be explained in one sentence.
- The first workflow has a fixed input and output contract.
- Out-of-scope features are documented.

## Phase 1: Basic n8n Pipeline

Goal: build the first working idea-to-plan workflow.

Tasks:

- Set up n8n locally or in n8n Cloud
- Create webhook or form trigger
- Add input cleanup step
- Connect one LLM provider
- Build requirement analyzer step
- Build epic generator step
- Build story generator step
- Generate final Markdown output

Acceptance criteria:

- A user can submit a project brief.
- mycellium returns a project summary, epics, and user stories.
- The workflow can be run repeatedly with different inputs.

## Phase 2: Structured Outputs

Goal: make outputs reliable enough for automation.

Tasks:

- Define JSON schema
- Enforce structured LLM responses
- Add acceptance criteria to stories
- Add task and subtask generation
- Add priority tags
- Add story point estimates
- Store output in a simple system such as Google Sheets, Notion, Airtable, or Supabase

Acceptance criteria:

- Workflow returns valid JSON.
- Every story has acceptance criteria.
- Every story has at least one task.
- Every story has priority and effort.

## Phase 3: Sprint Planning Engine

Goal: group work into logical sprints.

Tasks:

- Add dependency extraction
- Add sprint count and sprint duration handling
- Add sprint allocation prompt
- Add sprint goals
- Add simple capacity assumptions
- Flag overloaded sprints

Acceptance criteria:

- Stories are assigned to sprints.
- Foundational work appears before dependent work.
- Each sprint has a clear goal.
- Sprint load is visible to the user.

## Phase 4: Review And Validation

Goal: improve trust and reduce bad output.

Tasks:

- Add critic/reviewer node
- Detect missing acceptance criteria
- Detect duplicate stories
- Detect oversized stories
- Detect unsupported assumptions
- Generate clarification questions when input is vague
- Add human approval gate

Acceptance criteria:

- The workflow can flag quality issues.
- Vague project briefs produce clarification questions.
- External publishing requires approval.

## Phase 5: Tool Integrations

Goal: make mycellium usable with real planning tools.

Tasks:

- Create Jira-ready issue payloads
- Create Trello-ready card payloads
- Add optional Jira issue creation
- Add optional Trello card creation
- Add Notion or Confluence documentation export
- Add Slack summary notification

Acceptance criteria:

- Approved plans can be exported.
- Tool payloads preserve epic, story, task, priority, and estimate data.
- Failed exports are logged clearly.

## Phase 6: Advanced Intelligence

Goal: expand only after the MVP proves value.

Possible additions:

- Risk scoring
- Capacity planning
- Project templates
- Architecture suggestions
- Test case generation
- Release planning
- Historical project retrieval
- Multi-model critique
- Backlog grooming

## Week 1 Task List

1. Write the product statement.
2. Finalize MVP scope.
3. Choose input fields and defaults.
4. Choose the first LLM provider.
5. Set up n8n.
6. Build webhook or form trigger.
7. Build requirement analyzer prompt.
8. Build epic and story generation prompts.
9. Test with three sample projects.
10. Document output quality gaps.

## Week 2 Task List

1. Add structured JSON schema.
2. Add task generation.
3. Add acceptance criteria.
4. Add priority and estimate fields.
5. Add sprint allocation.
6. Generate Markdown from structured output.
7. Save outputs to a simple storage layer.
8. Run five more test briefs.

## Week 3 Task List

1. Add critic/reviewer step.
2. Add missing info detection.
3. Add clarification question path.
4. Add human approval gate.
5. Add Jira or Trello payload preview.
6. Polish first demo workflow.
7. Record demo input and output examples.

## Week 4 Task List

1. Add one real external integration.
2. Improve prompts using test results.
3. Add basic error logging.
4. Create user-facing documentation.
5. Package the demo.
6. Decide whether to continue with n8n only or add a backend service.
