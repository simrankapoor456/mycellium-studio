export type GrowthPathKind = "primary" | "branch" | "connection";

export type GrowthPath = Readonly<{
  id: string;
  d: string;
  level: number;
  kind: GrowthPathKind;
  parentId: string | null;
}>;

export type FoundationState = "confirmed" | "emerging" | "unknown" | "blocked";

export type FoundationNode = Readonly<{
  id: "users" | "problem" | "outcome" | "evidence" | "scope" | "feasibility" | "risks";
  label: string;
  state: FoundationState;
  x: number;
  y: number;
  level: number;
}>;

export const signatureGrowthPaths = [
  {
    id: "primary-root",
    d: "M480 304 C480 344 474 382 482 420 C489 458 482 510 470 564 C463 596 466 625 480 652",
    level: 4,
    kind: "primary",
    parentId: null,
  },
  {
    id: "problem-root",
    d: "M479 370 C435 380 397 400 356 438 C330 462 300 478 263 486",
    level: 5,
    kind: "branch",
    parentId: "primary-root",
  },
  {
    id: "users-root",
    d: "M482 405 C528 414 574 434 612 468 C635 489 663 500 698 503",
    level: 5,
    kind: "branch",
    parentId: "primary-root",
  },
  {
    id: "outcome-root",
    d: "M477 444 C432 459 397 485 373 521 C357 545 332 560 300 568",
    level: 5,
    kind: "branch",
    parentId: "primary-root",
  },
  {
    id: "evidence-root",
    d: "M484 466 C527 477 558 496 582 526 C602 551 629 565 661 568",
    level: 5,
    kind: "branch",
    parentId: "primary-root",
  },
  {
    id: "scope-root",
    d: "M476 505 C437 522 413 548 399 582 C390 604 371 618 344 626",
    level: 5,
    kind: "branch",
    parentId: "primary-root",
  },
  {
    id: "feasibility-root",
    d: "M479 536 C521 546 547 566 564 596 C577 619 598 632 625 637",
    level: 5,
    kind: "branch",
    parentId: "primary-root",
  },
  {
    id: "risks-root",
    d: "M478 573 C448 590 433 614 429 645 C426 664 414 678 394 688",
    level: 5,
    kind: "branch",
    parentId: "primary-root",
  },
  {
    id: "problem-outcome",
    d: "M263 486 C265 528 278 550 300 568",
    level: 6,
    kind: "connection",
    parentId: "problem-root",
  },
  {
    id: "users-evidence",
    d: "M698 503 C696 540 684 558 661 568",
    level: 6,
    kind: "connection",
    parentId: "users-root",
  },
  {
    id: "outcome-scope",
    d: "M300 568 C305 602 318 619 344 626",
    level: 6,
    kind: "connection",
    parentId: "outcome-root",
  },
  {
    id: "evidence-feasibility",
    d: "M661 568 C658 605 646 627 625 637",
    level: 6,
    kind: "connection",
    parentId: "evidence-root",
  },
  {
    id: "scope-risks",
    d: "M344 626 C350 661 367 682 394 688",
    level: 6,
    kind: "connection",
    parentId: "scope-root",
  },
] as const satisfies readonly GrowthPath[];

export const signatureFoundationNodes = [
  { id: "problem", label: "Problem", state: "confirmed", x: 263, y: 486, level: 7 },
  { id: "users", label: "Users", state: "confirmed", x: 698, y: 503, level: 7 },
  { id: "outcome", label: "Outcome", state: "confirmed", x: 300, y: 568, level: 7 },
  { id: "evidence", label: "Evidence", state: "emerging", x: 661, y: 568, level: 7 },
  { id: "scope", label: "Scope", state: "emerging", x: 344, y: 626, level: 7 },
  { id: "feasibility", label: "Feasibility", state: "blocked", x: 625, y: 637, level: 7 },
  { id: "risks", label: "Risks", state: "unknown", x: 394, y: 688, level: 7 },
] as const satisfies readonly FoundationNode[];

export const signatureInputFragments = [
  { id: "meeting", label: "Meeting note", x: 92, y: 98, dx: 300, dy: 104, useful: true },
  { id: "signal", label: "Customer signal", x: 658, y: 94, dx: -260, dy: 108, useful: true },
  { id: "requirement", label: "Requirement", x: 72, y: 188, dx: 340, dy: 32, useful: true },
  { id: "question", label: "Open question", x: 704, y: 180, dx: -296, dy: 42, useful: true },
  { id: "constraint", label: "Constraint", x: 112, y: 264, dx: 306, dy: -18, useful: true },
  { id: "message", label: "Copied message", x: 684, y: 264, dx: -266, dy: -18, useful: false },
  { id: "observation", label: "Observation", x: 326, y: 62, dx: 74, dy: 142, useful: true },
] as const;

export const FOUNDATION_STATE_LABELS = {
  confirmed: "Confirmed",
  emerging: "Emerging",
  unknown: "Unknown",
  blocked: "Blocked",
} as const satisfies Record<FoundationState, string>;
