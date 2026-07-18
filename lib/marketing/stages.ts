export const productStages = [
  {
    id: "discover",
    label: "Discover",
    summary: "Find the product truth beneath the first idea.",
    prompt: "A shared planning space for small product teams.",
    resultLabel: "Grounded understanding",
    result: [
      "Founders and product leads need one reviewable source of context.",
      "Assumptions must remain distinct from confirmed requirements.",
      "The first release should reduce planning churn before ticket creation.",
    ],
  },
  {
    id: "architect",
    label: "Architect",
    summary: "Turn shared understanding into decisions and boundaries.",
    prompt: "The product needs a personal workspace before team collaboration.",
    resultLabel: "Product architecture",
    result: [
      "Cookie-based identity with server verification and row-level security.",
      "Canonical project and plan contracts validated at every boundary.",
      "Discovery context remains portable and independent of an AI provider.",
    ],
  },
  {
    id: "execute",
    label: "Execute",
    summary: "Shape approved decisions into work a team can review.",
    prompt: "Deliver a secure personal foundation before adaptive discovery.",
    resultLabel: "Execution structure",
    result: [
      "Project foundation, authentication, and ownership controls.",
      "Discovery workflow with explicit readiness and human approval.",
      "Epics, stories, tasks, risks, and capacity-aware sprint proposals.",
    ],
  },
] as const;

export type ProductStageId = (typeof productStages)[number]["id"];

export function findProductStage(stageId: ProductStageId) {
  return productStages.find((stage) => stage.id === stageId) ?? productStages[0];
}
