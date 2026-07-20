import type { PlanOutput } from "@/lib/domain/plan/schemas";

export function planToMarkdown(plan: PlanOutput): string {
  const lines = [
    `# ${plan.project_name}`,
    "",
    plan.project_summary,
    "",
    "## Goals",
    ...plan.goals.map((goal) => `- ${goal}`),
    "",
    "## Assumptions",
    ...plan.assumptions.map((assumption) => `- ${assumption}`),
    "",
    "## Epics and stories",
  ];

  for (const epic of plan.epics) {
    lines.push("", `### ${epic.epic_id}: ${epic.epic_name}`, epic.description, "");

    for (const story of epic.stories) {
      lines.push(`#### ${story.story_id}: ${story.story_title}`);
      lines.push(`Priority: ${story.priority} | Estimate: ${story.estimate_points} points`);
      lines.push(story.user_story, "", "Acceptance criteria:");
      lines.push(...story.acceptance_criteria.map((criterion) => `- ${criterion}`));
      lines.push("", "Tasks:");
      lines.push(
        ...story.tasks.map(
          (task) => `- [${task.owner_type}] ${task.task_title}: ${task.description}`,
        ),
      );
      lines.push("");
    }
  }

  lines.push("## Sprint plan");

  for (const sprint of plan.sprints) {
    lines.push(
      "",
      `### ${sprint.sprint_name}`,
      `Goal: ${sprint.goal}`,
      `Capacity: ${sprint.allocated_points}/${sprint.capacity_points} points`,
    );
    lines.push(
      ...sprint.stories.map(
        (story) => `- ${story.story_id}: ${story.story_title} — ${story.reason}`,
      ),
    );
  }

  lines.push("", "## Review questions");
  lines.push(...plan.review.clarifying_questions.map((question) => `- ${question}`));

  return lines.join("\n");
}
