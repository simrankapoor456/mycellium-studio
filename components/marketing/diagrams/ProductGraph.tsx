import { useId, type RefObject } from "react";

import { cn } from "@/lib/class-names";
import { productGraphEdges, productGraphNodes } from "@/lib/marketing/signature-experience";

export type ProductGraphLayerRefs = {
  back: RefObject<SVGGElement | null>;
  middle: RefObject<SVGGElement | null>;
  front: RefObject<SVGGElement | null>;
};

type ProductGraphProps = {
  activeLevel: number;
  ariaLabel: string;
  className?: string;
  entry?: boolean;
  layerRefs?: ProductGraphLayerRefs;
};

function graphLayer(level: number) {
  if (level <= 2) {
    return "back";
  }

  if (level === 3) {
    return "middle";
  }

  return "front";
}

type GraphState = "current" | "connected" | "emerging" | "future";

function graphState(level: number, activeLevel: number): GraphState {
  if (level === activeLevel) return "current";
  if (level < activeLevel) return "connected";
  if (level === activeLevel + 1) return "emerging";
  return "future";
}

export function ProductGraph({ activeLevel, ariaLabel, className, entry = false, layerRefs }: ProductGraphProps) {
  const titleId = useId();
  const descriptionId = useId();
  const layers = ["back", "middle", "front"] as const;

  return (
    <div className={cn("product-graph-frame", className)}>
      <svg
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="product-graph"
        data-entry={entry}
        role="img"
        viewBox="0 0 720 540"
      >
        <title id={titleId}>{ariaLabel}</title>
        <desc id={descriptionId}>A seed idea branches into discovery questions, requirements, architecture decisions, delivery work, and a sprint.</desc>
        <defs>
          <linearGradient id={`${titleId}-active-edge`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="var(--color-gold)" />
            <stop offset="1" stopColor="var(--color-moss)" />
          </linearGradient>
        </defs>

        {layers.map((layer) => (
          <g className={`product-graph__layer product-graph__layer--${layer}`} key={layer} ref={layerRefs?.[layer]}>
            <g aria-hidden="true" className="product-graph__edges">
              {productGraphEdges.filter((edge) => graphLayer(edge.level) === layer).map((edge) => (
                <path
                  className="product-graph__edge"
                  d={edge.path}
                  data-active={edge.level <= activeLevel}
                  data-level={edge.level}
                  data-state={graphState(edge.level, activeLevel)}
                  fill="none"
                  key={edge.id}
                  pathLength="1"
                  stroke={`url(#${titleId}-active-edge)`}
                />
              ))}
            </g>

            <g className="product-graph__nodes">
              {productGraphNodes.filter((node) => graphLayer(node.level) === layer).map((node) => (
                <g
                  className="product-graph__node"
                  data-active={node.level <= activeLevel}
                  data-kind={node.kind}
                  data-level={node.level}
                  data-state={graphState(node.level, activeLevel)}
                  key={node.id}
                  transform={`translate(${node.x - node.width / 2} ${node.y - 22})`}
                >
                  <rect height="44" rx="8" width={node.width} />
                  <text className="product-graph__label" textAnchor="middle" x={node.width / 2} y="18">{node.label}</text>
                  <text className="product-graph__detail" textAnchor="middle" x={node.width / 2} y="33">{node.detail}</text>
                </g>
              ))}
            </g>
          </g>
        ))}
      </svg>
      <ul aria-label="Product graph state key" className="product-graph-legend">
        {(["current", "connected", "emerging", "future"] as const).map((state) => (
          <li data-state={state} key={state}><span aria-hidden="true" />{state}</li>
        ))}
      </ul>
      <ol aria-label="Product graph structure" className="product-graph-mobile">
        {productGraphNodes.map((node) => (
          <li data-state={graphState(node.level, activeLevel)} key={node.id}>
            <span>{node.label}</span>
            <strong>{node.detail}</strong>
            <small>{graphState(node.level, activeLevel)}</small>
          </li>
        ))}
      </ol>
    </div>
  );
}
