import type { FoundationArea } from "@/lib/discovery/foundation-map";
import type { DiscoveryContext } from "@/lib/domain/discovery/schemas";

const AREA_PURPOSE: Record<FoundationArea["id"], string> = {
  users: "Connects the product to the people and outcomes it must serve.",
  problem: "Keeps the product anchored to a specific breakdown worth changing.",
  outcome: "Defines the useful change and how it can be observed.",
  evidence: "Separates confirmed context from assumptions and open questions.",
  scope: "Turns grounded needs into an explicit product boundary.",
  feasibility: "Connects constraints, dependencies, and technical choices.",
  risks: "Keeps uncertainty and product safety visible in later decisions.",
};

const AREA_DEPENDENCIES: Record<FoundationArea["id"], string> = {
  users: "Problem framing and scope depend on this branch.",
  problem: "Core requirements and scope depend on this branch.",
  outcome: "Success measures and product value depend on this branch.",
  evidence: "Feasibility and assumption treatment depend on this branch.",
  scope: "Architecture responsibilities depend on this branch.",
  feasibility: "Architecture boundaries and sequencing depend on this branch.",
  risks: "Architecture safeguards and review warnings depend on this branch.",
};

export function FoundationMapDetail({ area, context }: { area: FoundationArea; context: DiscoveryContext }) {
  const acceptedUnknowns = new Set(context.acceptedUnknownFactIds);
  const factIds = new Set(area.facts.map((fact) => fact.id));
  const blockingChallenges = context.challenges.filter((challenge) => challenge.status === "open" && challenge.sourceFactIds.some((id) => factIds.has(id)));

  return (
    <div aria-live="polite" className="foundation-map__detail" id={`foundation-map-detail-${area.id}`}>
      <div className="foundation-map__detail-heading"><span>Selected branch</span><strong>{area.label}</strong><small>{foundationStateLabel(area.state)}</small></div>
      <div className="foundation-map__detail-purpose"><span>Why it exists</span><p>{AREA_PURPOSE[area.id]}</p><span>What depends on it</span><p>{AREA_DEPENDENCIES[area.id]}</p></div>
      <ul aria-label={`${area.label} evidence`}>
        {area.facts.slice(0, 5).map((fact) => <li data-state={fact.status} key={fact.id}><span>{fact.label}</span><strong>{fact.value}</strong><small>{factStateLabel(fact.status, acceptedUnknowns.has(fact.id))} · {fact.sourceMessageIds.length > 0 ? `${fact.sourceMessageIds.length} source ${fact.sourceMessageIds.length === 1 ? "answer" : "answers"}` : "Starting context"}</small></li>)}
        {area.facts.length === 0 ? <li><strong>No grounded evidence yet.</strong><small>This branch remains open.</small></li> : null}
      </ul>
      <div className="foundation-map__detail-open"><span>Open or blocking</span>{area.gaps.length > 0 ? <p>Missing: {area.gaps.map((gap) => gap.replaceAll("_", " ")).join(", ")}.</p> : null}{blockingChallenges.map((challenge) => <p key={challenge.id}>{challenge.title}: {challenge.description}</p>)}{area.gaps.length === 0 && blockingChallenges.length === 0 ? <p>No blocker is attached to this branch.</p> : null}</div>
    </div>
  );
}

function foundationStateLabel(state: FoundationArea["state"]): string {
  if (state === "rooted") return "Stable branch";
  if (state === "emerging") return "Emerging branch";
  if (state === "blocked") return "Blocked branch";
  return "Unresolved branch";
}

function factStateLabel(state: FoundationArea["facts"][number]["status"], accepted: boolean): string {
  if (state === "confirmed") return "Confirmed evidence";
  if (state === "inferred") return "Working assumption";
  if (state === "unknown") return accepted ? "Deferred unknown" : "Open unknown";
  return "Rejected";
}
