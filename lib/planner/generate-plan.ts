import {
  PlanOutputSchema,
  PlanningInputSchema,
  type Epic,
  type EstimatePoints,
  type NormalizedPlannerInput,
  type PlannerInput,
  type PlanOutput,
  type Priority,
  type Risk,
  type Review,
  type Sprint,
  type Story,
  type Task,
} from "@/lib/domain/plan/schemas";
import { getStories } from "@/lib/domain/plan/selectors";
import {
  DEFAULT_FEATURE_KEYS,
  FEATURE_CATALOG,
  TASK_TEMPLATES,
  type FeatureDefinition,
} from "@/lib/planner/catalog";
import {
  extractKeywords,
  inferProjectName,
  inferTargetUsers,
  summarizeBrief,
} from "@/lib/planner/text-analysis";

const FEATURE_LIMITS = {
  lean: 4,
  balanced: 5,
  detailed: 6,
} as const;

export function generatePlan(input: PlannerInput): PlanOutput {
  const normalizedInput = PlanningInputSchema.parse(input);
  const projectName = normalizedInput.projectName ?? inferProjectName(normalizedInput.brief);
  const missingRequirements = inferMissingRequirements(normalizedInput.brief);
  const features = inferFeatures(normalizedInput);
  const epics = buildEpics(features, normalizedInput.brief);
  const risks = buildRisks(missingRequirements, normalizedInput.brief);
  const plan = {
    schema_version: "1.0",
    project_name: projectName,
    project_summary: summarizeBrief(normalizedInput.brief, projectName),
    project_type: normalizedInput.projectType,
    business_objective: `Validate that ${projectName} can turn early uncertainty into organized execution.`,
    target_users: inferTargetUsers(normalizedInput.brief),
    goals: buildGoals(normalizedInput.brief),
    assumptions: [
      `The first release is focused on a ${normalizedInput.projectType} MVP.`,
      `A team of ${normalizedInput.teamSize} will review and adjust the plan before execution.`,
      "Portable file exports are sufficient until the planning workflow is proven.",
    ],
    constraints: [
      "Phase 1 runs without authentication, persistence, or external services.",
      "Human review is required before plan data is used outside the application.",
      "The foundation must remain deployable as a lightweight web application.",
    ],
    missing_requirements: missingRequirements,
    risks,
    epics,
    sprints: allocateSprints(
      epics,
      normalizedInput.sprintCapacityPoints,
      normalizedInput.sprintDurationWeeks,
    ),
    review: buildReview(epics, missingRequirements, risks),
  } as const;

  return PlanOutputSchema.parse(plan);
}

function buildGoals(brief: string): string[] {
  const projectNoun = extractKeywords(brief)[0] ?? "product";

  return [
    `Turn the ${projectNoun} idea into a usable first release.`,
    "Keep the experience clear enough for a first-time user to complete without training.",
    "Create reviewable work that remains portable before external publishing is introduced.",
  ];
}

function inferFeatures(input: NormalizedPlannerInput): FeatureDefinition[] {
  const normalizedBrief = input.brief.toLowerCase();
  const selectedFeatures = new Map<string, FeatureDefinition>();

  for (const feature of FEATURE_CATALOG) {
    if (feature.terms.some((term) => normalizedBrief.includes(term))) {
      selectedFeatures.set(feature.key, feature);
    }
  }

  for (const defaultKey of DEFAULT_FEATURE_KEYS) {
    const feature = FEATURE_CATALOG.find((candidate) => candidate.key === defaultKey);

    if (feature !== undefined) {
      selectedFeatures.set(feature.key, feature);
    }
  }

  return Array.from(selectedFeatures.values()).slice(0, FEATURE_LIMITS[input.planningDepth]);
}

function buildEpics(features: readonly FeatureDefinition[], brief: string): Epic[] {
  let storySequence = 1;

  return features.map((feature, epicIndex) => {
    const priority = priorityForIndex(epicIndex);
    const stories = feature.stories.map((template, storyIndex) => {
      const storyId = `STORY-${storySequence}`;
      storySequence += 1;

      return buildStory(storyId, template.title, template.userStory, priority, storyIndex, brief);
    });

    return {
      epic_id: `EPIC-${epicIndex + 1}`,
      epic_name: feature.name,
      description: feature.description,
      priority,
      stories,
    };
  });
}

function buildStory(
  storyId: string,
  title: string,
  userStory: string,
  priority: Priority,
  storyIndex: number,
  brief: string,
): Story {
  const needsReview = storyNeedsReview(title, brief);
  const estimatePoints = estimateForStory(storyIndex, needsReview);

  return {
    story_id: storyId,
    story_title: title,
    user_story: userStory,
    acceptance_criteria: buildAcceptanceCriteria(title, needsReview),
    priority,
    estimate_points: estimatePoints,
    dependencies: storyIndex === 0 ? [] : [`STORY-${Number(storyId.replace("STORY-", "")) - 1}`],
    needs_review: needsReview,
    tasks: buildTasks(storyId, title, needsReview),
  };
}

function buildTasks(storyId: string, storyTitle: string, needsReview: boolean): Task[] {
  return TASK_TEMPLATES.map((template, taskIndex) => {
    const taskId = `${storyId}-TASK-${taskIndex + 1}`;
    const dependencyTaskId = taskIndex > 1 ? `${storyId}-TASK-${taskIndex}` : null;

    return {
      task_id: taskId,
      task_title: `${template.title}: ${storyTitle}`,
      description: template.description,
      owner_type: template.ownerType,
      subtasks:
        template.ownerType === "qa"
          ? ["Check the happy path", "Check invalid input", "Check the responsive layout"]
          : [],
      dependency_task_id: dependencyTaskId,
      needs_review: needsReview && taskIndex < 2,
    };
  });
}

function allocateSprints(
  epics: readonly Epic[],
  capacityPoints: number,
  durationWeeks: number,
): Sprint[] {
  const sprints: Sprint[] = [];
  let currentSprint = createSprint(1, capacityPoints, durationWeeks);

  for (const story of getStories({ epics: [...epics] })) {
    const exceedsCapacity =
      currentSprint.allocated_points + story.estimate_points > capacityPoints;

    if (exceedsCapacity && currentSprint.stories.length > 0) {
      sprints.push(withCapacityRisk(currentSprint));
      currentSprint = createSprint(sprints.length + 1, capacityPoints, durationWeeks);
    }

    currentSprint.allocated_points += story.estimate_points;
    currentSprint.stories.push({
      story_id: story.story_id,
      story_title: story.story_title,
      reason:
        story.priority === "high"
          ? "High-priority foundation work."
          : "Scheduled after the core planning flow is stable.",
    });
  }

  sprints.push(withCapacityRisk(currentSprint));
  return sprints;
}

function createSprint(index: number, capacityPoints: number, durationWeeks: number): Sprint {
  return {
    sprint_id: `SPRINT-${index}`,
    sprint_name: `Sprint ${index}`,
    goal:
      index === 1
        ? "Prove the core planning backbone end to end."
        : "Strengthen plan quality, review, export, and usability.",
    duration_weeks: durationWeeks,
    capacity_points: capacityPoints,
    allocated_points: 0,
    stories: [],
    risks: [],
  };
}

function withCapacityRisk(sprint: Sprint): Sprint {
  const nearCapacity = sprint.allocated_points > sprint.capacity_points * 0.85;

  return {
    ...sprint,
    risks: nearCapacity
      ? ["Sprint is near capacity; protect it from unplanned scope growth."]
      : [],
  };
}

function buildReview(epics: Epic[], missingRequirements: string[], risks: Risk[]): Review {
  const stories = getStories({ epics });
  const oversizedStories = stories
    .filter((story) => story.estimate_points === 8)
    .map((story) => story.story_id);
  const unclearStories = stories
    .filter((story) => story.needs_review)
    .map((story) => story.story_id);
  const qualityScore = Math.max(
    0,
    94 - missingRequirements.length * 5 - oversizedStories.length * 6 - unclearStories.length * 3 - risks.length * 2,
  );

  return {
    quality_score: qualityScore,
    duplicate_story_warnings: [],
    missing_acceptance_criteria: [],
    oversized_stories: oversizedStories,
    unsupported_assumptions:
      missingRequirements.length > 0
        ? ["Some planning choices are inferred from the brief and need confirmation."]
        : [],
    clarifying_questions: [
      ...missingRequirements.map((requirement) => `Please confirm the ${requirement}.`),
      "Who is the first target user for the MVP?",
      "What must Sprint 1 include for the first demo to feel successful?",
    ].slice(0, 5),
  };
}

function estimateForStory(storyIndex: number, needsReview: boolean): EstimatePoints {
  if (needsReview) {
    return 8;
  }

  return storyIndex === 0 ? 5 : 3;
}

function buildRisks(missingRequirements: string[], brief: string): Risk[] {
  const risks: Risk[] = [
    {
      risk: "Generated scope may outgrow the first release.",
      impact: "medium",
      mitigation: "Keep Sprint 1 focused on the brief, review, and portable export loop.",
    },
  ];

  if (missingRequirements.length > 0) {
    risks.push({
      risk: "Missing requirements could cause rework.",
      impact: "medium",
      mitigation: "Answer the review questions before assigning work.",
    });
  }

  if (/integration|jira|trello/i.test(brief)) {
    risks.push({
      risk: "External publishing can distract from validating the core workflow.",
      impact: "high",
      mitigation: "Use portable files first and evaluate direct integrations in a later phase.",
    });
  }

  return risks;
}

function inferMissingRequirements(brief: string): string[] {
  const normalizedBrief = brief.toLowerCase();
  const missingRequirements: string[] = [];

  if (!/user|customer|team/.test(normalizedBrief)) {
    missingRequirements.push("target user");
  }

  if (!/export|download|share/.test(normalizedBrief)) {
    missingRequirements.push("handoff or export format");
  }

  if (!/deadline|sprint|week/.test(normalizedBrief)) {
    missingRequirements.push("timeline or delivery target");
  }

  if (!/success|goal|useful/.test(normalizedBrief)) {
    missingRequirements.push("success metric");
  }

  return missingRequirements;
}

function buildAcceptanceCriteria(title: string, needsReview: boolean): string[] {
  const criteria = [
    `${title} can be completed from the primary workflow.`,
    "The user receives clear feedback for missing or invalid input.",
    "The result remains usable on desktop and mobile layouts.",
  ];

  if (needsReview) {
    criteria.push("A human reviewer can confirm or adjust inferred details.");
  }

  return criteria;
}

function storyNeedsReview(title: string, brief: string): boolean {
  return (
    title.toLowerCase().includes("structured plan data") ||
    brief.length < 180 ||
    /maybe|not sure/i.test(brief)
  );
}

function priorityForIndex(index: number): Priority {
  if (index < 2) {
    return "high";
  }

  if (index < 4) {
    return "medium";
  }

  return "low";
}
