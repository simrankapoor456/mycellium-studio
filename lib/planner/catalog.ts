import type { OwnerType } from "@/lib/domain/plan/schemas";

export type StoryTemplate = Readonly<{
  title: string;
  userStory: string;
}>;

export type FeatureDefinition = Readonly<{
  key: string;
  name: string;
  description: string;
  terms: readonly string[];
  stories: readonly StoryTemplate[];
}>;

export type TaskTemplate = Readonly<{
  title: string;
  ownerType: OwnerType;
  description: string;
}>;

export const FEATURE_CATALOG: readonly FeatureDefinition[] = [
  {
    key: "intake",
    name: "Project Intake",
    description: "Collect enough starting context without turning intake into a long project document.",
    terms: ["input", "paste", "brief", "idea", "form", "upload"],
    stories: [
      {
        title: "Submit a project brief",
        userStory: "As a planner, I want to enter a rough idea so that I can turn it into structured work.",
      },
      {
        title: "Configure planning settings",
        userStory: "As a planner, I want to set delivery constraints so that the plan fits my team.",
      },
    ],
  },
  {
    key: "planning",
    name: "Planning Engine",
    description: "Transform a brief into validated, connected planning objects.",
    terms: ["plan", "epic", "story", "task", "sprint", "estimate"],
    stories: [
      {
        title: "Generate epics and stories",
        userStory: "As a planner, I want a structured backlog so that product scope is clear.",
      },
      {
        title: "Create developer tasks",
        userStory: "As an engineer, I want stories translated into tasks so that implementation can begin.",
      },
    ],
  },
  {
    key: "review",
    name: "Human Review",
    description: "Make inferred details visible and reviewable before the plan becomes execution work.",
    terms: ["review", "approve", "edit", "regenerate", "quality"],
    stories: [
      {
        title: "Review plan quality",
        userStory: "As a planner, I want unclear items flagged so that I can correct them early.",
      },
      {
        title: "Edit generated work items",
        userStory: "As a planner, I want to refine the plan so that it reflects human judgment.",
      },
    ],
  },
  {
    key: "export",
    name: "Portable Exports",
    description: "Package an approved plan into portable files without publishing to external systems.",
    terms: ["export", "markdown", "json", "csv", "download", "share"],
    stories: [
      {
        title: "Export a readable plan",
        userStory: "As a planner, I want a Markdown plan so that people can read and discuss it.",
      },
      {
        title: "Export structured plan data",
        userStory: "As a developer, I want JSON and CSV files so that plan data remains portable.",
      },
    ],
  },
  {
    key: "insights",
    name: "Planning Insights",
    description: "Surface plan health and missing context without persisting user data.",
    terms: ["dashboard", "quality", "analytics", "health", "track"],
    stories: [
      {
        title: "View plan health",
        userStory: "As a planner, I want quality signals so that I know what needs attention.",
      },
      {
        title: "Trace planning assumptions",
        userStory: "As a reviewer, I want assumptions separated from facts so that decisions stay grounded.",
      },
    ],
  },
  {
    key: "accessibility",
    name: "Accessible Experience",
    description: "Keep the planning experience usable across devices and interaction modes.",
    terms: ["accessible", "mobile", "responsive", "keyboard", "screen reader"],
    stories: [
      {
        title: "Use the planner across devices",
        userStory: "As a planner, I want a responsive workflow so that I can work from any screen.",
      },
      {
        title: "Navigate with assistive technology",
        userStory: "As a planner, I want semantic controls so that the workflow is accessible.",
      },
    ],
  },
] as const;

export const DEFAULT_FEATURE_KEYS = ["intake", "planning", "review", "export"] as const;

export const TASK_TEMPLATES: readonly TaskTemplate[] = [
  {
    title: "Define expected behavior",
    ownerType: "product",
    description: "Clarify the user outcome, edge cases, and definition of done.",
  },
  {
    title: "Design the interaction",
    ownerType: "design",
    description: "Describe the screen, states, and interaction required by the story.",
  },
  {
    title: "Build the experience",
    ownerType: "frontend",
    description: "Implement the visible experience with validated inputs and accessible feedback.",
  },
  {
    title: "Connect domain logic",
    ownerType: "backend",
    description: "Implement the deterministic rules and data transformations required by the story.",
  },
  {
    title: "Test acceptance criteria",
    ownerType: "qa",
    description: "Verify happy paths, invalid input, and responsive behavior.",
  },
] as const;
