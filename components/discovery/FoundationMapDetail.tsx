import type { FoundationArea } from "@/lib/discovery/foundation-map";

export function FoundationMapDetail({ area }: { area: FoundationArea }) {
  return (
    <div aria-live="polite" className="foundation-map__detail" id="foundation-map-detail">
      <div><span>Selected area</span><strong>{area.label}</strong><small>{foundationStateLabel(area.state)}</small></div>
      <ul>
        {area.facts.slice(0, 4).map((fact) => <li key={fact.id}><span>{fact.label}</span><strong>{fact.value}</strong></li>)}
        {area.facts.length === 0 ? <li><strong>No grounded fact yet.</strong></li> : null}
      </ul>
      {area.gaps.length > 0 ? <p>Still needed: {area.gaps.map((gap) => gap.replaceAll("_", " ")).join(", ")}.</p> : null}
    </div>
  );
}

function foundationStateLabel(state: FoundationArea["state"]): string {
  if (state === "rooted") return "Rooted and confirmed";
  if (state === "emerging") return "Emerging understanding";
  if (state === "blocked") return "Blocked by a decision";
  return "Still unresolved";
}
