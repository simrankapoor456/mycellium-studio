export const signatureStoryConfig = {
  beatCount: 12,
  desktopMinimumWidth: 768,
  scrollScrub: 0.55,
  animationIntensity: 0.72,
  dimensions: { width: 800, height: 620 },
  reducedMotionComposition: "complete",
} as const;

export const signatureStoryStages = [
  {
    id: "fragments",
    label: "Fragmented input",
    title: "Useful context begins apart.",
    description: "Needs, constraints, and observations arrive as separate signals without implied certainty.",
    artifact: "Scattered context",
    level: 0,
  },
  {
    id: "seed",
    label: "Seed of intent",
    title: "One intent becomes the stable seed.",
    description: "The outcome worth changing is held clearly while the surrounding product remains open.",
    artifact: "Original intent",
    level: 1,
  },
  {
    id: "first-root",
    label: "First root",
    title: "The first question reaches for evidence.",
    description: "Discovery starts with the highest-value unresolved area, not a generic sequence.",
    artifact: "Priority question",
    level: 2,
  },
  {
    id: "evidence-branches",
    label: "Evidence branching",
    title: "Answers branch into grounded product context.",
    description: "Confirmed facts gain weight while each branch preserves where it came from.",
    artifact: "Evidence roots",
    level: 3,
  },
  {
    id: "questions-constraints",
    label: "Questions and constraints",
    title: "Open choices remain visibly different from facts.",
    description: "Unknowns, assumptions, and constraints shape the product without becoming false certainty.",
    artifact: "Explicit uncertainty",
    level: 4,
  },
  {
    id: "mycelium",
    label: "Mycelium connections",
    title: "Relationships reveal a coherent system.",
    description: "Needs, boundaries, evidence, and consequences connect without losing their lineage.",
    artifact: "Living relationships",
    level: 5,
  },
  {
    id: "foundation",
    label: "Foundation stabilization",
    title: "Human judgment stabilizes the foundation.",
    description: "Confirmed direction settles while deferred and unresolved branches stay explicit.",
    artifact: "Approved foundation",
    level: 6,
  },
  {
    id: "architecture",
    label: "Architecture emergence",
    title: "Responsibilities rise from the foundation.",
    description: "Requirements become connected system decisions, boundaries, and dependencies.",
    artifact: "Architecture",
    level: 7,
  },
  {
    id: "blueprint",
    label: "Blueprint formation",
    title: "Architecture becomes readable and editable.",
    description: "Scope, requirements, decisions, and lineage resolve into one working product blueprint.",
    artifact: "Product Blueprint",
    level: 8,
  },
  {
    id: "execution",
    label: "Execution branches",
    title: "Structure branches into accountable work.",
    description: "Epics, stories, tasks, and dependencies retain a direct path back to the foundation.",
    artifact: "Execution",
    level: 9,
  },
  {
    id: "value",
    label: "Visible product value",
    title: "Grounded structure can create useful change.",
    description: "The completed artifact makes value possible without claiming an outcome before it exists.",
    artifact: "Value made visible",
    level: 10,
  },
  {
    id: "renewal",
    label: "New seed",
    title: "What the product learns becomes the next seed.",
    description: "New evidence returns to the living system without erasing the history that shaped it.",
    artifact: "Learning returns",
    level: 11,
  },
] as const;

export type SignatureStageId = (typeof signatureStoryStages)[number]["id"];

export const productGraphNodes = [
  { id: "seed", label: "Seed", detail: "Original intent", x: 360, y: 52, width: 116, level: 0, kind: "seed" },
  { id: "need", label: "User need", detail: "Desired outcome", x: 132, y: 152, width: 136, level: 1, kind: "question" },
  { id: "unknown", label: "Open question", detail: "Evidence needed", x: 360, y: 152, width: 150, level: 1, kind: "question" },
  { id: "constraint", label: "Constraint", detail: "Boundary identified", x: 588, y: 152, width: 132, level: 1, kind: "question" },
  { id: "requirement", label: "Requirement", detail: "Reviewed behavior", x: 92, y: 276, width: 142, level: 2, kind: "requirement" },
  { id: "scope", label: "Scope", detail: "Included and excluded", x: 268, y: 276, width: 142, level: 2, kind: "requirement" },
  { id: "identity", label: "Identity", detail: "Trusted actor", x: 452, y: 276, width: 142, level: 3, kind: "architecture" },
  { id: "data", label: "Data boundary", detail: "Validated state", x: 628, y: 276, width: 142, level: 3, kind: "architecture" },
  { id: "epic", label: "Epic", detail: "Outcome group", x: 148, y: 402, width: 132, level: 4, kind: "execution" },
  { id: "story", label: "Story", detail: "User value", x: 360, y: 402, width: 132, level: 4, kind: "execution" },
  { id: "task", label: "Task", detail: "Implementation step", x: 572, y: 402, width: 132, level: 4, kind: "execution" },
  { id: "sprint", label: "Sprint 01", detail: "Delivery sequence", x: 360, y: 504, width: 148, level: 4, kind: "sprint" },
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
  { speaker: "Builder", message: "I have a product direction, but the primary need and boundary are still unclear." },
  { speaker: "Mycellium", message: "What outcome should change, and who needs it first?" },
  { speaker: "Builder", message: "The outcome is clearer. The primary user and constraints still need evidence." },
] as const;

export const discoveredFacts = [
  "The original intent is recorded without turning it into a requirement.",
  "The desired outcome is clear enough to review.",
  "The primary user and constraints remain open decisions.",
] as const;

export const architectureSummary = {
  goal: "Turn reviewed product context into a traceable blueprint.",
  inScope: ["Confirmed needs", "Reviewed scope", "Core requirements"],
  outOfScope: ["Unverified assumptions", "Deferred capabilities", "Unowned dependencies"],
  risks: ["Assumptions presented as facts", "Unclear boundaries", "Missing recovery paths"],
  decisions: ["Explicit trust boundaries", "Schema-valid contracts", "Traceable state changes"],
} as const;

export const executionSummary = {
  epic: "Deliver the approved product foundation",
  stories: ["Establish the core outcome", "Protect trusted state", "Verify the primary journey"],
  tasks: ["Validate inputs", "Persist approved changes", "Enforce access rules", "Verify recovery states"],
  sprints: [
    { label: "Sprint 01", work: "Foundation and model" },
    { label: "Sprint 02", work: "Core journey" },
    { label: "Sprint 03", work: "Hardening and release" },
  ],
} as const;
