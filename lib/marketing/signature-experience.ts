export const signatureStoryStages = [
  {
    id: "idea",
    label: "A rough idea",
    title: "One useful instinct, not yet a product.",
    description: "The seed records the original intent without pretending the surrounding decisions are already known.",
    artifact: "Seed statement",
    level: 0,
  },
  {
    id: "discovery",
    label: "Discovery questions",
    title: "Questions expose evidence, constraints, and uncertainty.",
    description: "Each branch keeps a question connected to the idea it tests, so assumptions do not quietly become requirements.",
    artifact: "Facts and open questions",
    level: 1,
  },
  {
    id: "understanding",
    label: "Structured understanding",
    title: "Confirmed context becomes a reviewable boundary.",
    description: "User needs, scope, and constraints resolve into explicit product requirements with visible confidence.",
    artifact: "Requirements and scope",
    level: 2,
  },
  {
    id: "architecture",
    label: "Product architecture",
    title: "Requirements become connected system decisions.",
    description: "Identity, project data, validation, and provider boundaries rise from the approved product context.",
    artifact: "Architecture decisions",
    level: 3,
  },
  {
    id: "execution",
    label: "Execution plan",
    title: "Approved decisions resolve into sequenced work.",
    description: "Epics, stories, tasks, dependencies, and sprint allocation retain a direct path back to the seed.",
    artifact: "Delivery structure",
    level: 4,
  },
] as const;

export type SignatureStageId = (typeof signatureStoryStages)[number]["id"];

export const productGraphNodes = [
  { id: "seed", label: "Seed", detail: "Shared planning space", x: 360, y: 52, width: 116, level: 0, kind: "seed" },
  { id: "need", label: "User need", detail: "One source of context", x: 132, y: 152, width: 136, level: 1, kind: "question" },
  { id: "unknown", label: "Open question", detail: "What must be shared?", x: 360, y: 152, width: 150, level: 1, kind: "question" },
  { id: "constraint", label: "Constraint", detail: "Personal first", x: 588, y: 152, width: 132, level: 1, kind: "question" },
  { id: "requirement", label: "Requirement", detail: "Reviewable context", x: 92, y: 276, width: 142, level: 2, kind: "requirement" },
  { id: "scope", label: "Scope", detail: "Projects and discovery", x: 268, y: 276, width: 142, level: 2, kind: "requirement" },
  { id: "identity", label: "Identity", detail: "Verified ownership", x: 452, y: 276, width: 142, level: 3, kind: "architecture" },
  { id: "data", label: "Data boundary", detail: "Validated project state", x: 628, y: 276, width: 142, level: 3, kind: "architecture" },
  { id: "epic", label: "Epic", detail: "Secure foundation", x: 148, y: 402, width: 132, level: 4, kind: "execution" },
  { id: "story", label: "Story", detail: "Create a project", x: 360, y: 402, width: 132, level: 4, kind: "execution" },
  { id: "task", label: "Task", detail: "Validate ownership", x: 572, y: 402, width: 132, level: 4, kind: "execution" },
  { id: "sprint", label: "Sprint 01", detail: "Foundation sequence", x: 360, y: 504, width: 148, level: 4, kind: "sprint" },
] as const;

export const productGraphEdges = [
  { id: "seed-need", path: "M360 78C360 112 132 105 132 130", level: 1 },
  { id: "seed-unknown", path: "M360 78V130", level: 1 },
  { id: "seed-constraint", path: "M360 78C360 112 588 105 588 130", level: 1 },
  { id: "need-requirement", path: "M132 174C132 222 92 224 92 254", level: 2 },
  { id: "unknown-scope", path: "M360 174C360 222 268 224 268 254", level: 2 },
  { id: "constraint-identity", path: "M588 174C588 216 452 222 452 254", level: 3 },
  { id: "constraint-data", path: "M588 174C588 218 628 224 628 254", level: 3 },
  { id: "requirement-epic", path: "M92 298C92 346 148 350 148 380", level: 4 },
  { id: "scope-story", path: "M268 298C268 346 360 348 360 380", level: 4 },
  { id: "identity-task", path: "M452 298C452 346 572 348 572 380", level: 4 },
  { id: "data-task", path: "M628 298C628 338 572 348 572 380", level: 4 },
  { id: "epic-sprint", path: "M148 424C148 466 360 458 360 482", level: 4 },
  { id: "story-sprint", path: "M360 424V482", level: 4 },
  { id: "task-sprint", path: "M572 424C572 466 360 458 360 482", level: 4 },
] as const;

export const discoverConversation = [
  { speaker: "Founder", message: "Small teams lose the reasoning behind a product before the first sprint begins." },
  { speaker: "Mycellium", message: "Who needs that reasoning, and what decision should it improve first?" },
  { speaker: "Founder", message: "A founder and engineering lead need to agree on scope before creating tickets." },
] as const;

export const discoveredFacts = [
  "The first users are founders and engineering leads in small teams.",
  "The product must preserve decisions before ticket creation.",
  "Reviewable scope is more urgent than team collaboration.",
] as const;

export const architectureSummary = {
  goal: "Create one private, reviewable source of product context.",
  inScope: ["Personal projects", "Discovery context", "Ownership controls"],
  outOfScope: ["Team administration", "Billing", "External publishing"],
  risks: ["Assumptions presented as facts", "Provider coupling", "Unclear project boundaries"],
  decisions: ["Server-verified identity", "Schema-valid project contracts", "Provider-independent discovery state"],
} as const;

export const executionSummary = {
  epic: "Secure personal project foundation",
  stories: ["Create a private project", "Review project context", "Protect user-owned records"],
  tasks: ["Validate form input", "Persist project metadata", "Apply ownership filters", "Verify error states"],
  sprints: [
    { label: "Sprint 01", work: "Identity and model" },
    { label: "Sprint 02", work: "CRUD and ownership" },
    { label: "Sprint 03", work: "Discovery handoff" },
  ],
} as const;
