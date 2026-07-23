import { getStories } from "@/lib/domain/plan/selectors";
import type { PlanOutput } from "@/lib/domain/plan/schemas";
import { toCsvCell } from "@/lib/security/csv";

type CsvValue = string | number;

export function planToCsv(plan: PlanOutput): string {
  const rows: CsvValue[][] = [
    ["type", "id", "title", "priority", "estimate", "owner", "description"],
  ];

  for (const story of getStories(plan)) {
    rows.push([
      "story",
      story.story_id,
      story.story_title,
      story.priority,
      story.estimate_points,
      "",
      story.user_story,
    ]);

    for (const task of story.tasks) {
      rows.push([
        "task",
        task.task_id,
        task.task_title,
        story.priority,
        "",
        task.owner_type,
        task.description,
      ]);
    }
  }

  return rows.map((row) => row.map(toCsvCell).join(",")).join("\n");
}
