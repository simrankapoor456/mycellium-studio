import type { PlanOutput, Story, Task } from "@/lib/domain/plan/schemas";

export function getStories(plan: Pick<PlanOutput, "epics">): Story[] {
  return plan.epics.flatMap((epic) => epic.stories);
}

export function getTasks(plan: Pick<PlanOutput, "epics">): Task[] {
  return getStories(plan).flatMap((story) => story.tasks);
}
