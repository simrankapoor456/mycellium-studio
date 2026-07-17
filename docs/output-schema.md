# mycellium studio Output Schema

This schema is the target shape for mycellium studio MVP output. It should be generated as JSON first, then transformed into Markdown or tool-specific payloads.

```json
{
  "project_name": "",
  "project_summary": "",
  "project_type": "",
  "business_objective": "",
  "target_users": [],
  "goals": [],
  "assumptions": [],
  "constraints": [],
  "missing_requirements": [],
  "risks": [
    {
      "risk": "",
      "impact": "low | medium | high",
      "mitigation": ""
    }
  ],
  "epics": [
    {
      "epic_id": "EPIC-1",
      "epic_name": "",
      "description": "",
      "priority": "low | medium | high",
      "stories": [
        {
          "story_id": "STORY-1",
          "story_title": "",
          "user_story": "",
          "acceptance_criteria": [],
          "priority": "low | medium | high",
          "estimate_points": 3,
          "dependencies": [],
          "tasks": [
            {
              "task_id": "TASK-1",
              "task_title": "",
              "description": "",
              "owner_type": "frontend | backend | fullstack | qa | devops | data | design | product",
              "subtasks": [],
              "dependency": ""
            }
          ]
        }
      ]
    }
  ],
  "sprints": [
    {
      "sprint_id": "SPRINT-1",
      "sprint_name": "",
      "goal": "",
      "duration": "",
      "capacity_points": 0,
      "allocated_points": 0,
      "stories": [
        {
          "story_id": "",
          "reason": ""
        }
      ],
      "risks": []
    }
  ],
  "review": {
    "quality_score": 0,
    "duplicate_story_warnings": [],
    "missing_acceptance_criteria": [],
    "oversized_stories": [],
    "unsupported_assumptions": [],
    "clarifying_questions": []
  },
  "exports": {
    "markdown_summary": "",
    "jira_ready": [],
    "trello_ready": []
  }
}
```

## Field Rules

- `assumptions` must be clearly separated from known input facts.
- `missing_requirements` should be empty only when the input is sufficiently clear.
- Every epic must contain at least one story.
- Every story must contain acceptance criteria.
- Every story should have priority and estimate points.
- Every task should have an owner type.
- Sprint allocation should explain why each story belongs in that sprint.
- External tool payloads should not be published until human approval is received.
