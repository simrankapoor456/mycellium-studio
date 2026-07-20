# Discovery control model

## Question identity

Discovery questions are selected by `getNextDiscoveryPrompt` from a stable ordered category list. Each prompt has an identity in the form `category:<fact-category>`, one canonical question, and one state-aligned reason.

An active fact covers its category when it is confirmed, inferred, or unknown. Rejected or deleted facts do not cover a category. This rule prevents an explicitly unknown or deferred question from returning immediately while still leaving that uncertainty visible for Foundation Review.

When every priority category is covered, the selector returns `null`. The response uses the stable `review` identity and invites Foundation Review instead of creating another wording variation.

## Turn actions

`DiscoveryTurnInputSchema` accepts three explicit actions:

| Action | Text required | Persisted state | Readiness treatment |
| --- | --- | --- | --- |
| `answer` | Yes | Extracted confirmed, inferred, or unknown facts | Existing calculated rules |
| `mark_unknown` | No | Unknown fact for the current category | Visible and still unresolved |
| `ask_later` | No | Unknown fact accepted for carry-forward | Partial existing unknown credit |

The previous `{ requestId, message }` input remains accepted and is transformed to `answer`, preserving current clients. No schema migration is required.

## Reliable and provider-enhanced parity

Control actions never call the provider. Answer turns may use provider proposals for extracted facts, but the next question always comes from the deterministic selector after trusted state is applied. Both modes therefore obey the same identity, coverage, no-loop, and review rules.

The prior loop had two causes:

1. unknown facts counted as covered only after separate acceptance, so the next selector could return the same category
2. the interface had no explicit no-text control and exposed review only after a readiness threshold

Provider output could also supply its own next question. Phase 8 removes that source of control divergence.

## Interface contract

- Normal Enter inserts a new textarea line.
- Control or Command plus Enter shares an answer and is documented in helper text.
- Pending state disables every turn action and exposes `aria-busy` on the primary action.
- A failed request preserves the draft and returns focus-ready recovery copy.
- Review current foundation is always reachable, including with unresolved items.
- The latest change summary names what became clearer, calculated readiness change, essential decisions, recommended refinements, and deferred unknowns.
- Mycel Core copy is selected from the actual transition, not random phrase rotation.

## Foundation progression

Unknown does not mean confirmed. A marked unknown remains a review item. A deferred unknown is explicitly carried forward through the existing accepted-unknown list. Architecture approval still applies current readiness, contradiction, and challenge rules. Nothing in this control model weakens those gates.
