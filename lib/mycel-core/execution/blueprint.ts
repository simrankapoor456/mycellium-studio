import { ProductBlueprintSchema, type ProductBlueprint } from "@/lib/domain/blueprint/schemas";
import { PressureTestSchema, type PressureTest } from "@/lib/domain/pressure-test/schemas";

export { applyBlueprintEdit } from "@/lib/blueprint/editing";
export {
  generateDeterministicBlueprint,
  normalizeAiBlueprint,
  validateBlueprintLineage,
} from "@/lib/blueprint/generate";
export { persistBlueprint } from "@/lib/blueprint/persistence";

export function generateReliablePressureTest(blueprintInput: ProductBlueprint): PressureTest {
  const blueprint = ProductBlueprintSchema.parse(blueprintInput);
  const criticalFindings: string[] = [];
  const scopeCuts = blueprint.requirements
    .filter((item) => item.priority === "low")
    .map((item) => `Move ${item.title} behind the first product outcome.`);
  const risks = blueprint.risks.map((risk) => `${risk.title}: ${risk.description}`);
  const questions: string[] = [];
  const recommendedNextActions: string[] = [];

  if (blueprint.overview.successMetrics.length === 0) {
    criticalFindings.push("The blueprint has no observable success measure.");
    questions.push("Which measurable result should decide whether the first release is working?");
    recommendedNextActions.push("Add one measurable success signal before delivery begins.");
  }

  if (blueprint.requirements.length > 10) {
    criticalFindings.push("The first release contains more requirements than one primary outcome usually needs.");
    recommendedNextActions.push("Choose the smallest requirement set that proves the primary outcome.");
  }

  for (const sprint of blueprint.sprintPlan) {
    const assignedEstimate = blueprint.tasks
      .filter((task) => task.sprintId === sprint.id)
      .reduce((total, task) => total + (task.estimate ?? 0), 0);

    if (assignedEstimate > sprint.capacity) {
      criticalFindings.push(`${sprint.title} exceeds its stated capacity.`);
      recommendedNextActions.push(`Reduce or move work from ${sprint.title}.`);
    }
  }

  if (!blueprint.architectureDecisions.some((item) => /failure|retry|recovery|degraded/i.test(`${item.title} ${item.description} ${item.rationale}`))) {
    risks.push("Failure and recovery behavior is not explicit in the architecture decisions.");
    questions.push("What should the product preserve or communicate when a dependency fails?");
  }

  if (scopeCuts.length === 0) {
    scopeCuts.push("No specific cut is supported yet; review secondary requirements before expanding scope.");
  }

  if (recommendedNextActions.length === 0) {
    recommendedNextActions.push("Review the open questions and accept only changes that strengthen the primary outcome.");
  }

  const assessment = criticalFindings.length > 0
    ? "The blueprint has a workable structure, but material decisions should be addressed before delivery begins."
    : "The blueprint is coherent. The remaining findings are useful trade-offs for the next review.";

  return PressureTestSchema.parse({
    overallAssessment: assessment,
    criticalFindings,
    scopeCuts,
    risks,
    questions,
    recommendedNextActions,
    pressureTestMode: "fallback",
  });
}

export function normalizeAiPressureTest(input: unknown): PressureTest {
  const parsed = PressureTestSchema.parse(input);
  return PressureTestSchema.parse({ ...parsed, pressureTestMode: "ai" });
}
