"use client";

import { useState } from "react";

import { GraphNodeDetail } from "@/components/discovery/GraphNodeDetail";
import type { DiscoveryContext, DiscoveryReviewInput, ProductGraph } from "@/lib/domain/discovery/schemas";

const CATEGORY_COLUMNS = ["business_objective", "problem", "target_users", "use_cases", "success_metrics", "functional_requirements", "non_functional_requirements", "constraints", "assumptions", "risks", "architecture_decisions", "included_scope", "excluded_scope", "technical_preferences", "dependencies", "unknowns"] as const;

type LivingProductGraphProps = Readonly<{
  graph: ProductGraph;
  context?: DiscoveryContext;
  downstreamItems?: Readonly<Record<string, readonly string[]>>;
  messages?: readonly Readonly<{ id: string; content: string }>[];
  pending?: boolean;
  onMutate?: (input: DiscoveryReviewInput) => void;
}>;

export function LivingProductGraph({ graph, context, downstreamItems = {}, messages = [], pending = false, onMutate }: LivingProductGraphProps) {
  const [selectedId, setSelectedId] = useState(graph.nodes[0]?.id ?? null);
  const nodes = graph.nodes.filter((node, index, all) => all.slice(0, index).filter((candidate) => candidate.category === node.category).length < 3).slice(0, 36);
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const positions = new Map(nodes.map((node, index) => {
    const column = Math.max(0, CATEGORY_COLUMNS.indexOf(node.category));
    const peers = nodes.slice(0, index).filter((candidate) => candidate.category === node.category).length;
    return [node.id, { x: 78 + (column % 3) * 235, y: 68 + Math.floor(column / 3) * 170 + peers * 58 }] as const;
  }));

  return (
    <section aria-label="Living Product Graph" className="living-graph">
      <div className="living-graph__heading"><div><span className="eyebrow">Living Product Graph</span><h2>Current understanding</h2></div><span>{nodes.length} nodes</span></div>
      {nodes.length === 0 ? <p className="living-graph__empty">Answer the first question to root the graph.</p> : null}
      <svg aria-label="Connected product understanding" className="living-graph__svg" role="img" viewBox="0 0 720 760">
        <title>Living Product Graph</title><desc>Facts, assumptions, unknowns, and contradictions extracted from discovery.</desc>
        <g aria-hidden="true">{graph.edges.map((edge) => {
          const source = positions.get(edge.source); const target = positions.get(edge.target);
          if (!source || !target) return null;
          return <path className="living-graph__edge" data-kind={edge.kind} data-state={edge.state} d={`M${source.x},${source.y} C${source.x + 70},${source.y} ${target.x - 70},${target.y} ${target.x},${target.y}`} key={edge.id} />;
        })}</g>
        {nodes.map((node) => {
          const position = positions.get(node.id);
          if (!position) return null;
          return <g aria-label={`${node.label}: ${node.value}`} className="living-graph__node" data-selected={selected?.id === node.id} data-state={node.state} key={node.id} onClick={() => setSelectedId(node.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedId(node.id); } }} role="button" tabIndex={0} transform={`translate(${position.x - 64} ${position.y - 25})`}><rect height="50" rx="9" width="128" /><text textAnchor="middle" x="64" y="21">{truncate(node.label, 18)}</text><text className="living-graph__node-state" textAnchor="middle" x="64" y="37">{node.state}</text></g>;
        })}
      </svg>
      <div aria-label="Structured product understanding" className="living-graph__list" role="list">{nodes.map((node) => <div key={node.id} role="listitem"><button aria-pressed={selected?.id === node.id} data-state={node.state} onClick={() => setSelectedId(node.id)}><span>{node.label}</span><strong>{node.value}</strong><small>{node.state}</small></button></div>)}</div>
      {selected && context && onMutate ? <GraphNodeDetail context={context} downstreamItems={downstreamItems[selected.id] ?? []} messages={messages} node={selected} onMutate={onMutate} pending={pending} /> : null}
      {selected && (!context || !onMutate) ? <aside aria-live="polite" className="living-graph__detail"><span>{selected.category.replaceAll("_", " ")}</span><h3>{selected.label}</h3><p>{selected.value}</p><small>{selected.state === "inferred" ? "Working assumption — check this before approval" : selected.state === "unknown" ? "Intentionally left open" : selected.state === "contradicted" ? "Two answers are competing here" : "Rooted in discovery"}</small></aside> : null}
    </section>
  );
}

function truncate(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1)}…` : value;
}
