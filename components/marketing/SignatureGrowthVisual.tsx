"use client";

import {
  FOUNDATION_STATE_LABELS,
  signatureFoundationNodes,
  signatureGrowthPaths,
  signatureInputFragments,
  type FoundationState,
} from "@/lib/marketing/signature-growth";

const fragmentWidths: Record<(typeof signatureInputFragments)[number]["id"], number> = {
  meeting: 122,
  signal: 138,
  requirement: 126,
  question: 136,
  constraint: 112,
  message: 134,
  observation: 122,
};

function FoundationStateMark({ state }: Readonly<{ state: FoundationState }>) {
  if (state === "confirmed") {
    return <path className="signature-growth__state-symbol" d="M-4 0 L-1 3 L5 -4" />;
  }

  if (state === "emerging") {
    return <path className="signature-growth__state-symbol signature-growth__state-symbol--fill" d="M0 -7 A7 7 0 0 0 0 7 Z" />;
  }

  if (state === "blocked") {
    return (
      <g className="signature-growth__state-symbol">
        <path d="M-4 -4 L4 4" />
        <path d="M4 -4 L-4 4" />
      </g>
    );
  }

  return <text className="signature-growth__state-question" textAnchor="middle" x="0" y="4">?</text>;
}

export function SignatureGrowthVisual({ activeIndex, label }: Readonly<{ activeIndex: number; label: string }>) {
  return (
    <div
      className="signature-growth"
      data-active-level={activeIndex}
      data-signature-growth
    >
      <svg aria-hidden="true" viewBox="0 0 960 760">
        <defs>
          <linearGradient id="signature-soil" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#15231a" />
            <stop offset="0.36" stopColor="#0b1711" />
            <stop offset="1" stopColor="#07100c" />
          </linearGradient>
          <radialGradient id="signature-intent-glow">
            <stop offset="0" stopColor="#b9ed66" stopOpacity="0.38" />
            <stop offset="0.48" stopColor="#b9ed66" stopOpacity="0.08" />
            <stop offset="1" stopColor="#b9ed66" stopOpacity="0" />
          </radialGradient>
          <filter height="180%" id="signature-soft-glow" width="180%" x="-40%" y="-40%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        <g className="signature-growth__environment">
          <path className="signature-growth__soil-line" d="M42 288 C175 272 260 300 378 286 C492 272 595 302 712 286 C792 275 858 280 918 292" />
          <path className="signature-growth__soil" d="M24 289 C180 270 262 302 380 287 C496 272 595 302 715 286 C796 275 862 281 936 298 V744 H24 Z" />
          <path className="signature-growth__soil-strata" d="M44 410 C189 386 297 432 418 408 C553 382 681 431 916 395" />
          <path className="signature-growth__soil-strata" d="M38 548 C201 520 302 570 454 541 C614 510 742 568 922 530" />
          <g className="signature-growth__soil-grain">
            <circle cx="104" cy="356" r="2" /><circle cx="176" cy="454" r="1.5" /><circle cx="248" cy="336" r="1.6" />
            <circle cx="316" cy="590" r="1.4" /><circle cx="418" cy="376" r="1.7" /><circle cx="542" cy="334" r="1.5" />
            <circle cx="576" cy="474" r="1.8" /><circle cx="746" cy="354" r="1.5" /><circle cx="826" cy="488" r="1.7" />
            <circle cx="878" cy="624" r="1.4" /><circle cx="706" cy="692" r="1.5" /><circle cx="194" cy="684" r="1.4" />
          </g>
        </g>

        <g
          className="signature-growth__fragments"
          data-level="0"
          data-visible={activeIndex >= 0}
        >
          {signatureInputFragments.map((fragment) => (
            <g
              data-fragment={fragment.id}
              data-shift-x={fragment.dx}
              data-shift-y={fragment.dy}
              data-useful={fragment.useful}
              key={fragment.id}
              transform={`translate(${fragment.x} ${fragment.y})`}
            >
              <rect height="34" rx="17" width={fragmentWidths[fragment.id]} />
              <circle cx="17" cy="17" r="3" />
              <text x="29" y="21">{fragment.label}</text>
            </g>
          ))}
        </g>

        <g
          className="signature-growth__attraction"
          data-level="1"
          data-visible={activeIndex >= 1}
        >
          <circle cx="480" cy="232" filter="url(#signature-soft-glow)" r="92" />
          <path d="M322 164 C382 194 408 213 438 229" />
          <path d="M641 160 C584 190 553 211 522 229" />
          <path d="M286 252 C352 246 403 241 438 236" />
          <path d="M676 252 C611 246 558 241 522 236" />
        </g>

        <g
          className="signature-growth__seed"
          data-level="2"
          data-visible={activeIndex >= 2}
        >
          <ellipse cx="480" cy="269" rx="65" ry="17" />
          <path className="signature-growth__seed-shell signature-growth__seed-shell--left" d="M480 202 C448 212 430 238 435 266 C440 292 459 308 480 309 C470 282 470 231 480 202 Z" />
          <path className="signature-growth__seed-shell signature-growth__seed-shell--right" d="M480 202 C511 213 529 239 525 267 C521 292 501 308 480 309 C491 282 491 231 480 202 Z" />
          <ellipse className="signature-growth__embryo" cx="480" cy="254" rx="8" ry="19" />
        </g>

        <g
          className="signature-growth__germination"
          data-level="3"
          data-visible={activeIndex >= 3}
        >
          <circle cx="480" cy="260" filter="url(#signature-soft-glow)" r="52" />
          <path data-growth-path d="M481 207 C473 224 489 236 478 251 C468 264 484 275 477 291" pathLength="1" />
          <path className="signature-growth__radicle" data-growth-path d="M480 289 C481 296 480 301 480 309" pathLength="1" />
        </g>

        <g className="signature-growth__root-network">
          {signatureGrowthPaths.map((path) => (
            <path
              className={`signature-growth__root signature-growth__root--${path.kind}`}
              d={path.d}
              data-growth-path
              data-level={path.level}
              data-parent-id={path.parentId ?? undefined}
              data-path-id={path.id}
              data-path-kind={path.kind}
              data-visible={activeIndex >= path.level}
              key={path.id}
              pathLength="1"
            />
          ))}
        </g>

        <g
          className="signature-growth__foundation"
          data-level="7"
          data-visible={activeIndex >= 7}
        >
          {signatureFoundationNodes.map((node) => {
            const left = node.x < 480;
            return (
              <g
                className="signature-growth__foundation-node"
                data-foundation-id={node.id}
                data-state={node.state}
                key={node.id}
                transform={`translate(${node.x} ${node.y})`}
              >
                <circle r="10" />
                <FoundationStateMark state={node.state} />
                <text
                  className="signature-growth__foundation-label"
                  textAnchor={left ? "end" : "start"}
                  x={left ? -17 : 17}
                  y="-2"
                >
                  {node.label}
                </text>
                <text
                  className="signature-growth__foundation-state"
                  textAnchor={left ? "end" : "start"}
                  x={left ? -17 : 17}
                  y="12"
                >
                  {FOUNDATION_STATE_LABELS[node.state]}
                </text>
              </g>
            );
          })}
        </g>

        <g
          className="signature-growth__stabilized"
          data-level="8"
          data-visible={activeIndex >= 8}
        >
          <path className="signature-growth__shoot" data-growth-path d="M480 205 C477 182 480 158 491 135" pathLength="1" />
          <path className="signature-growth__leaf signature-growth__leaf--left" d="M487 149 C462 145 447 132 443 111 C467 109 486 122 487 149 Z" />
          <path className="signature-growth__leaf signature-growth__leaf--right" d="M489 139 C493 116 507 101 529 96 C532 119 516 136 489 139 Z" />
          <path className="signature-growth__foundation-bracket" d="M205 716 H755" />
          <text className="signature-growth__foundation-title" textAnchor="middle" x="480" y="738">FOUNDATION READY FOR REVIEW</text>
        </g>
      </svg>

      <ul aria-label="Foundation state legend" className="signature-growth__legend">
        {(Object.entries(FOUNDATION_STATE_LABELS) as Array<[FoundationState, string]>).map(([state, stateLabel]) => (
          <li data-state={state} key={state}>
            <span aria-hidden="true" />
            {stateLabel}
          </li>
        ))}
      </ul>

      <p className="sr-only">
        {label}. Fragmented inputs gather around an original intent. The seed opens, a primary root grows, and seven traceable Foundation areas form: Users, Problem, Outcome, Evidence, Scope, Feasibility, and Risks. Confirmed, emerging, unknown, and blocked states remain explicit for human review.
      </p>
    </div>
  );
}
