# mycellium studio MVP Architecture

## Architecture Overview

mycellium studio is a structured workflow pipeline. Each stage transforms project information into a more executable planning artifact.

Core flow:

```text
Input -> Cleanup -> Analysis -> Epics -> Stories -> Tasks -> Estimates -> Sprint Plan -> Review -> Output
```

## Layers

### 1. Input Layer

Receives the project idea.

MVP input options:

- n8n webhook
- n8n form
- Simple frontend form

Required field:

- Project description

Optional metadata:

- Project name
- Team size
- Sprint duration
- Sprint count
- Target date
- Tech stack
- Priority
- Target users

### 2. Understanding Layer

Uses an LLM to interpret the input.

Outputs:

- Project summary
- Business objective
- Main users or actors
- Key features
- Assumptions
- Constraints
- Missing requirements
- Project type
- Complexity signal

### 3. Planning Layer

Breaks the project into execution units.

Outputs:

- Epics
- User stories
- Acceptance criteria
- Tasks
- Subtasks
- Dependencies
- Priority
- Effort estimates

### 4. Sprint Planning Layer

Groups work into sprints based on:

- Priority
- Dependencies
- Foundational work
- Team size
- Sprint duration
- Estimated effort

MVP estimation can use Fibonacci story points: `1`, `2`, `3`, `5`, `8`.

### 5. Review Layer

Checks quality before publication.

Review checks:

- Missing acceptance criteria
- Duplicate stories
- Unrealistic sprint loading
- Unclear dependencies
- Stories that are too large
- Features that appear invented rather than inferred

### 6. Delivery Layer

Formats output for humans and systems.

MVP outputs:

- Markdown report
- Structured JSON
- Jira-ready payload preview
- Trello-ready card preview

Later outputs:

- Jira issue creation
- Trello card creation
- Notion page creation
- Confluence page creation
- Slack summary

## n8n Workflow Nodes

### Node 1: Trigger

Use a webhook or form submission.

### Node 2: Input Cleanup

Normalize input and validate required fields.

Defaults:

- Team size: 2
- Sprint duration: 2 weeks
- Sprint count: 3
- Estimate scale: Fibonacci story points

### Node 3: Project Classification

Classify the project type, such as:

- Web app
- Mobile app
- Internal tool
- AI product
- Data pipeline
- Dashboard
- E-commerce
- LMS

### Node 4: Requirement Analyzer

Generate structured requirements analysis.

### Node 5: Epic Generator

Generate 4 to 8 distinct epics.

### Node 6: Story Generator

Loop through each epic and generate user stories with acceptance criteria.

### Node 7: Task Generator

Loop through each story and generate implementation tasks.

### Node 8: Estimation Node

Assign priority, complexity, and effort.

### Node 9: Sprint Planner

Group stories into sprints.

### Node 10: Critic Node

Review the generated plan for quality issues.

### Node 11: Human Review Gate

Send the output for approval before publishing.

### Node 12: Export Node

Export Markdown, JSON, and optional tool-ready payloads.

## Workflow Branches

### Branch A: Simple Plan Generation

```text
Input -> Analysis -> Epics -> Stories -> Tasks -> Sprints -> Output
```

### Branch B: Clarification Needed

```text
Input -> Analysis -> Missing Info -> Clarifying Questions -> User Response
```

### Branch C: Publish To Jira Or Trello

```text
Approved Plan -> Transform Payload -> Create Issues Or Cards
```

### Branch D: Publish Documentation

```text
Approved Plan -> Markdown Formatter -> Notion Or Confluence Page
```

## Prompt Strategy

Use specialized prompts instead of one large prompt.

Recommended prompts:

- Requirement analyzer
- Epic generator
- Story generator
- Task generator
- Sprint planner
- Critic reviewer

Each prompt should return valid JSON first. Markdown should be generated from the structured plan after validation.
