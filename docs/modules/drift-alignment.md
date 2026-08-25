# Module: Drift Alignment

UI label is **Drift Alignment** — the sidebar reads "Drift Alignment" with the
subtitle "Docs Sync & Dev Sync" in every screenshot this file is drawn from.

Keeps a BRD and its Jira stories from silently diverging after they're first
linked, in both directions, continuously — not a one-time check.

---

## What it does

Two sub-tools, reached from one entry point in the left rail:

- **Docs Sync** (PM · TL) — reconciles BRDs against Jira stories, both
  directions. Fully documented below; every screen in this file is Docs Sync.
- **Dev Sync** (Developer) — "Publish code docs and keep commits honest against
  Jira." Not captured. See TODO.

Inside Docs Sync, a project first goes through **one-time traceability setup**,
then two **continuous, bidirectional loops** run against every linked pair:

1. **Changes to apply (BRD → Jira).** When a requirement's wording changes,
   Velox proposes an updated Jira story: current wording beside proposed
   wording, a confidence score, and a written rationale for the change. A human
   approves, edits then approves, or dismisses each one; approved changes are
   pushed to Jira in a batch.
2. **Drift to resolve (Jira → BRD).** When a story is edited directly in Jira,
   or when **a comment on the ticket implies a scope change**, Velox flags it
   against its source requirement. A human decides what happened: the BRD is
   outdated, the story is wrong, or the drift is intentional.

A third toggle, **Code → BRD**, sits on the same page and is its own tutorial —
see Video plan below. Not captured yet. See TODO.

## Setting up traceability (one-time, per project)

Drift agents only watch a requirement once it is linked to a Jira story. Two
paths, both reached from the same "AI Agent recommended links" panel:

- **No BRD yet.** Generate the BRD and its Jira stories together in the BRD
  Assistant — links are created automatically as items are generated, no
  manual matching.
- **A BRD already exists.** Pick the BRD page from Confluence. Velox proposes
  matches to existing stories, sorted into three buckets:
  - **Recommended** — confident matches, the top story pre-selected. Confidence
    shown as a percentage with a label: `IMPLEMENTS` for a strong match,
    `PARTIAL` for a partial one.
  - **Needs review** — plausible candidates; a human picks the right story
    before linking.
  - **Coverage gaps** — no matching story at all, with a generated explanation
    of why nothing matched.

Checking boxes across any bucket and confirming turns drift detection on for
exactly those pairs. Confirming shows a confirmation toast naming how many
requirements are now linked.

## What is genuinely true

- Traceability is **opt-in per requirement** — nothing is monitored until it's
  explicitly linked.
- Matching a requirement to a candidate Jira story combines **embeddings-based
  similarity with LLM judgement**, and takes roughly **30 to 60 seconds** while
  the agent works — shown on screen as a live progress line, not a spinner.
- The Jira → BRD direction reads **comments, not only structured fields** — a
  comment implying a scope change is flagged as its own kind of drift,
  separate from a direct field edit.
- Every proposed Jira update carries a **confidence score and a written
  rationale**, not just a diff.
- **Nothing is applied automatically.** A BRD → Jira change needs an explicit
  Approve and a separate batch Apply. A Jira → BRD drift needs an explicit
  resolution choice before anything happens.
- A resolution can carry an **optional note** for team context.
- The source BRD wording is often much terser than the Jira story it produced
  — stories accumulate detail over a project's life that the original
  requirement never had. The resolve screen shows both side by side, so a
  human judges whether the added detail is legitimate elaboration or real
  scope drift.
- Resolving updates the list immediately and confirms with a toast.

## What we do not claim

- Never say a change reaches Jira, or the BRD, without a person choosing to
  apply or resolve it.
- Never claim a match is certain. Confidence scores exist because matches
  aren't — `PARTIAL` is a common, expected outcome, not a near-miss.
- Do not present Coverage Gaps as a shortfall. It is a first-class, expected
  result: some requirements genuinely have no story yet.
- Do not describe Dev Sync or Code → BRD. Neither is documented here. See TODO.

## Safe emphasis

1. **Bidirectional.** A requirement change flows to Jira; a Jira change flows
   back to the requirement. Not a one-way lint check.
2. **Catches soft signals, not only hard edits.** A comment implying scope
   creep is flagged before the ticket itself changes.
3. **Every proposal is explained.** A confidence score plus a rationale, on
   both the matching step and the change-proposal step.
4. **Nothing moves without a person.** Approve, dismiss, or say which side is
   right — always a human call.

## Vocabulary

| Say | Not |
|---|---|
| Drift Alignment | Drift Intelligence |
| Docs Sync | the drift tool |
| traceability link | mapping |
| Changes to apply | the BRD queue |
| Drift to resolve | the Jira queue |
| resolve | fix, correct |

## Screens worth showing

Frames run in capture order within a part.

- **The problem, made visible:** a flagged drift with SOURCE and CURRENT shown
  side by side. The strongest single frame in the module — it shows the actual
  divergence rather than describing one.
- **The one-time setup**, specifically the three-bucket match screen
  (Recommended / Needs review / Coverage gaps) — shows real matching work, not
  a toggle flipping on.
- **A Changes-to-apply detail page**, current vs proposed, with the Agent
  Rationale panel visible.
- **A resolve modal**, with the three-way "what happened" choice visible — the
  trust argument made literal: three options, a human decides.
- **Not worth showing:** the bare Active Links list on its own. Twenty-three
  pairs with no context is an inventory, not a moment.

## Video plan

Three videos, not one per screen-group. Setup and Resolve are not independent
capabilities — a viewer cannot use resolution without first understanding that
traceability exists, so they stay inside one tutorial rather than being split.

| Video | `module` | `part` | `videoType` | Covers |
|---|---|---|---|---|
| BRD ↔ Jira tutorial | `drift-alignment` | `brd-jira` | `tutorial` | One-time setup (both linking paths, three-bucket matching), then both ongoing loops: Changes to apply and Drift to resolve, including the comment-based signal |
| Code → BRD tutorial | `drift-alignment` | `code-brd` | `tutorial` | Not yet captured — see TODO |
| Drift Alignment promo | `drift-alignment` | *(none)* | `promo` | One promo argues for the whole module. Draw its hook and CTA frames from whichever tutorial's footage makes the strongest single-frame case — most likely a Resolve screen, since SOURCE-vs-CURRENT is the strongest frame in the module |

The promo has no `part` because it isn't scoped to one capability — it can pull
a hook frame from the BRD↔Jira material and, once captured, a body frame from
Code → BRD, the same way any promo draws its strongest frames regardless of
which tutorial they came from.

**Within the `brd-jira` tutorial**, the internal order is still Setup → Changes
to apply → Drift to resolve — that structure didn't change, only its status as
three separate videos did. Screens worth showing, below, still apply as
guidance for ordering within this one longer tutorial.

`dev-sync` and `code-brd` each need their own capture before a video can be
authored. Dev Sync is not in production and needs no video yet.

## TODO — not yet captured, do not invent

- **Dev Sync.** Not in production. No video needed until it ships; only the
  tooltip line exists: "Publish code docs and keep commits honest against
  Jira." No screens.
- **Code → BRD.** Its own tutorial, `part: "code-brd"`. The toggle exists on
  the Docs Sync page; it was never opened. Unknown what it compares or how.
  Screenshots to follow in a later pass — do not author this video until they
  arrive.
- **What "The BRD is outdated" produces.** The resolve modal says it will
  "generate a proposed BRD amendment... you'll review it next" — that next
  screen was not captured.
- **What "The story is wrong" produces.** Presumably a Jira revert
  confirmation; not captured.
- **Whether comment-based drift detection is real-time or batch**, and what
  precisely triggers it.
- **The adoption blocker.** Every other module's blocker is feature-awareness,
  per standing instruction. Given how concrete the pain shown here is — a BRD
  and Jira silently diverging, including through a comment nobody reads twice
  — it is worth confirming whether PMs at Deluxe already do this
  reconciliation by hand today. That would sharpen the promo argument well
  past "they don't know this exists."
