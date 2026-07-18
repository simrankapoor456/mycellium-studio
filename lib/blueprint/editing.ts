import { BlueprintEditInputSchema, ProductBlueprintSchema, type BlueprintEditInput, type ProductBlueprint } from "@/lib/domain/blueprint/schemas";

type EditableEntity = ProductBlueprint["goals"][number] | ProductBlueprint["requirements"][number] | ProductBlueprint["architectureDecisions"][number] | ProductBlueprint["scope"]["inScope"][number] | ProductBlueprint["epics"][number] | ProductBlueprint["stories"][number] | ProductBlueprint["tasks"][number] | ProductBlueprint["sprintPlan"][number] | ProductBlueprint["risks"][number];

export function applyBlueprintEdit(blueprintInput: ProductBlueprint, editInput: BlueprintEditInput, now: string): ProductBlueprint {
  const blueprint = ProductBlueprintSchema.parse(blueprintInput);
  const edit = BlueprintEditInputSchema.parse(editInput);
  let found = false;
  const update = <T extends EditableEntity>(entity: T): T => {
    if (entity.id !== edit.entityId) return entity;
    found = true;
    const changes = { ...edit.changes } as Record<string, unknown>;
    if (!("acceptanceCriteria" in entity)) delete changes.acceptanceCriteria;
    if (!("sprintId" in entity)) delete changes.sprintId;
    return { ...entity, ...changes, manuallyEdited: true, lineage: { ...entity.lineage, source: "manual" as const } } as T;
  };
  const scope = edit.entityType === "scope" ? { inScope: blueprint.scope.inScope.map(update), outOfScope: blueprint.scope.outOfScope.map(update) } : blueprint.scope;
  const next = {
    ...blueprint,
    version: blueprint.version + 1,
    updatedAt: now,
    goals: edit.entityType === "goal" ? blueprint.goals.map(update) : blueprint.goals,
    requirements: edit.entityType === "requirement" ? blueprint.requirements.map(update) : blueprint.requirements,
    architectureDecisions: edit.entityType === "architecture" ? blueprint.architectureDecisions.map(update) : blueprint.architectureDecisions,
    scope,
    epics: edit.entityType === "epic" ? blueprint.epics.map(update) : blueprint.epics,
    stories: edit.entityType === "story" ? blueprint.stories.map(update) : blueprint.stories,
    tasks: edit.entityType === "task" ? blueprint.tasks.map(update) : blueprint.tasks,
    sprintPlan: edit.entityType === "sprint" ? blueprint.sprintPlan.map(update) : blueprint.sprintPlan,
    risks: edit.entityType === "risk" ? blueprint.risks.map(update) : blueprint.risks,
  };
  if (!found) throw new Error("Blueprint entity not found.");
  return ProductBlueprintSchema.parse(next);
}
