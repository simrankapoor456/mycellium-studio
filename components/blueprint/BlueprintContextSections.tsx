import type { ProductBlueprint } from "@/lib/domain/blueprint/schemas";

export function BlueprintContextSections({ blueprint }: { blueprint: ProductBlueprint }) {
  const sections = [
    ["Assumptions", blueprint.assumptions],
    ["Constraints", blueprint.constraints],
    ["Dependencies", blueprint.dependencies],
    ["Trade-offs", blueprint.tradeOffs],
    ["Ownership suggestions", blueprint.ownershipSuggestions],
  ] as const;

  return <section className="blueprint-context-sections">{sections.map(([title, items]) => <section key={title}><h2>{title}</h2>{items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>None recorded.</p>}</section>)}</section>;
}
