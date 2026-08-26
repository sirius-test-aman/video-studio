# Module: Drift Alignment

UI label is **Drift Alignment** — the sidebar reads "Drift Alignment" with the
subtitle "Docs Sync & Dev Sync" in every screenshot this file is drawn from.

Keeps a BRD, its Jira stories and its shipping code from silently diverging
after they're first linked, in both directions, continuously — not a one-time
check.

---

## What it does

Two sub-tools, reached from one entry point in the left rail. The flyout's own
one-line summary is "Keep BRDs and shipping code in lockstep."

- **Docs Sync** (PM · TL) — "Reconcile BRDs against code docs and Jira stories
  — both directions." Fully documented below; every screen in this file is
  Docs Sync.
- **Dev Sync** (Developer) — "Publish code docs and keep commits honest against
  Jira." Not captured. See TODO.

Docs Sync itself carries **two tabs**, and they are two separate flows:

| Tab | Reconciles | Status |
|---|---|---|
| **BRD ⇄ Jira** | a BRD against its Jira stories, both directions | captured, documented below |
| **Code → BRD** | published code documentation against a BRD, one direction | captured, documented below |

### BRD ⇄ Jira

A project first goes through **one-time traceability setup**, then two
**continuous, bidirectional loops** run against every linked pair:

1. **Changes to apply (BRD → Jira).** When a requirement's wording changes,
   Velox proposes an updated Jira story: current wording beside proposed
   wording, a confidence score, and a written rationale for the change. A human
   approves, edits then approves, or dismisses each one; approved changes are
   pushed to Jira in a batch.
2. **Drift to resolve (Jira → BRD).** When a story is edited directly in Jira,
   or when **a comment on the ticket implies a scope change**, Velox flags it
   against its source requirement. A human decides what happened: the BRD is
   outdated, the story is wrong, or the drift is intentional.

### Code → BRD

The second tab answers the opposite problem: the code moved on and the spec
never caught up. It runs **one direction only** — code documentation into a
BRD. Nothing here writes to code.

The tab opens on a **Code docs index** on the left, listing published code
documentation pages with a version tag and an age, plus a filter-by-title box.
The right panel until you pick one reads: "Select a code documentation page on
the left. Diff it against an existing BRD and stage the add / modify / remove
changes — or seed a brand-new BRD from it."

Selecting a code doc marks it `SELECTED · V1`, offers a **Confluence** link out
to the page itself, and presents **two routes**:

- **01 · ROUTE · DIFF — "Compare with existing BRD."** "Run the diff agent
  against a Confluence BRD. Approve each proposed add, modify or remove — the
  page updates in place." Leads to the five-step reconcile flow below.
- **02 · ROUTE · SEED — "Create a new BRD."** "Spin up a fresh BRD conversation
  seeded with this code documentation. Use when no spec exists yet." Hands off
  to the BRD Assistant. Not captured beyond this card. See TODO.

The DIFF route opens **"Reconcile a BRD with this code documentation"**, headed
`02 COMPARISON AGENT`, with the code doc pinned as `SOURCE · CODE
DOCUMENTATION` and the chosen BRD as `TARGET · BRD`. It runs a five-step
stepper:

| Step | What happens on screen |
|---|---|
| **01 SELECT** | "Pick a BRD to compare against", a searchable list of Confluence pages in the space with a total count. Cancel, or **Begin scan**. |
| **02 SCAN** | Agent working: "Scanning BRD against code documentation", subline "Walking sections · diffing semantics · staging proposals", and a stated **5 to 15 seconds**. |
| **03 REVIEW** | Four counters, then one row per proposal, each tickable. Nothing is ticked to begin with. |
| **04 COMMIT** | Agent working: "Applying changes to your BRD", "Rewriting the BRD and saving it back to Confluence — please don't refresh." |
| **05 DONE** | "Sync complete — Applied N changes", with **Open updated BRD** and **Back to BRD Sync**. |

The REVIEW step is where the work happens. It reports a **SIGNALS** total that
decomposes into **ADD**, **MODIFY** and **TO DO** counts, with a matching set of
filter tabs. Every proposal row carries a type chip, the **numbered BRD section**
it targets — section names come straight from the 16-section BRD template, so a
proposal lands on "2. Purpose" or "7. Functional Requirements" rather than on a
line number — and a one-line reason. Expanding a row shows **REASON** and
**PROPOSED**, the proposed content in full, including formatted tables where the
proposal is a table.

Approval is **per row, opt-in**: the running count reads "N / 29 approved", the
commit button re-labels itself to the number of ticked changes, and a **Select
all** is offered. Committing rewrites the BRD in place on its Confluence page.

## Who it is for

Both Docs Sync tabs are badged **PM · TL** on screen, and that badge is on the
Code → BRD tab too. So Code → BRD is a **PM and Tech Lead** flow even though
its input is a developer artifact: a developer publishes the code
documentation, and a PM or TL decides what that means for the spec. Per the
access model in `docs/products/velox.md`, Drift Alignment sits with the
**Business User** role.

Dev Sync is badged **DEVELOPER** and is the developer-facing half. Not
captured.

## The adoption blocker

**[Proposed — needs confirmation, do not treat as settled.]**
Feature-level value awareness, the standing blocker for every Velox module: a
PM sees "Drift Alignment — Docs Sync & Dev Sync" in the rail and has no reason
to believe the Code → BRD tab exists at all, let alone that it lands proposals
on named BRD sections.

For Code → BRD specifically there is a sharper candidate worth testing: this
flow presumes **someone has already published code documentation**, which is a
Dev Sync output. If that never happens, the Code docs index stays empty and the
tab is inert regardless of awareness. Whether teams at Deluxe are publishing
code docs today is unknown — that may be the real blocker, and it is a
different problem from awareness.

Confirm which before any promo argues from this module.

## What is genuinely true

### Across both tabs

- **Nothing is applied automatically.** Every write needs an explicit human
  action, and in both tabs the approve step and the apply step are separate.
- Both tabs pin their source and target on screen throughout, so what is being
  compared against what is never implicit.

### BRD ⇄ Jira

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
- A BRD → Jira change needs an explicit Approve and a separate batch Apply. A
  Jira → BRD drift needs an explicit resolution choice before anything happens.
- A resolution can carry an **optional note** for team context.
- The source BRD wording is often much terser than the Jira story it produced
  — stories accumulate detail over a project's life that the original
  requirement never had. The resolve screen shows both side by side, so a
  human judges whether the added detail is legitimate elaboration or real
  scope drift.
- Resolving updates the list immediately and confirms with a toast.

### Code → BRD

- It is **one-directional**: code documentation into the BRD. No screen offers
  to change code, and nothing in this flow writes to a repository.
- The scan is **fast and says so** — "usually 5 to 15 seconds", stated on the
  scanning screen. Materially quicker than the 30 to 60 seconds the BRD ⇄ Jira
  matcher takes, because it diffs two documents rather than searching a story
  set for candidates.
- Proposals are **typed**: add, modify, or to-do, each counted separately
  against a signals total, each filterable.
- Proposals are **anchored to numbered BRD sections**, not to free text, so a
  reviewer sees which part of the 16-section template each one touches.
- Every proposal carries a **written reason**, and expanding it shows the
  **full proposed content** before you approve it, not a summary of it.
- Approval is **per proposal and opt-in** — the review screen opens at zero
  approved and the commit button counts only what has been ticked.
- **Select all** exists, so a reviewer who trusts the batch is not forced to
  tick 29 boxes.
- The commit **updates the existing Confluence page in place** rather than
  creating a new one. The done screen says so: "The BRD is updated in place —
  downstream readers will see the new spec on their next pull."
- The two routes are a genuine fork: diff against a BRD that exists, or seed a
  new BRD in the BRD Assistant when no spec does.

## What we do not claim

### Across both tabs

- Never say a change reaches Jira, the BRD, or Confluence without a person
  choosing to apply, resolve or commit it.

### BRD ⇄ Jira

- Never claim a match is certain. Confidence scores exist because matches
  aren't — `PARTIAL` is a common, expected outcome, not a near-miss.
- Do not present Coverage Gaps as a shortfall. It is a first-class, expected
  result: some requirements genuinely have no story yet.

### Code → BRD

- **Do not call this bidirectional.** The tab is labelled `Code → BRD` with a
  single arrow, and the module's bidirectional claim belongs to BRD ⇄ Jira
  alone. Conflating the two oversells this tab.
- **Do not say Velox reads your repository.** What it diffs is a *published
  code documentation page*, an artifact someone generated earlier. No screen
  shows a repo being scanned, a branch being named, or a commit being read.
- **Do not describe the reason text as a confidence score.** Unlike the
  BRD ⇄ Jira proposals, no percentage or confidence label appears anywhere in
  the Code → BRD review. Every proposal is explained; none is scored.
- **Do not call an unticked proposal "dismissed" or "rejected".** No reject or
  dismiss control appears on these screens — a proposal is simply left
  unticked and not committed. That is a different interaction from the explicit
  Dismiss in BRD ⇄ Jira, and writing it as the same thing would be wrong.
- **Do not describe what "TO DO" proposals are.** The counter and filter tab
  exist; no TO DO row was ever opened. See TODO.
- **Do not claim the BRD is version-controlled or that the old text is
  recoverable.** "Updated in place" is what the screen says. Whether a prior
  version survives is not shown.
- Do not describe Dev Sync, or the SEED route past its card. Neither is
  documented here. See TODO.

## Safe emphasis

1. **Two directions of truth, two tabs.** A requirement change flows to Jira
   and a Jira change flows back; separately, shipping reality flows back into
   the spec. Neither is a one-way lint check.
2. **Catches soft signals, not only hard edits.** A comment implying scope
   creep is flagged before the ticket itself changes.
3. **Every proposal is explained.** BRD ⇄ Jira gives a confidence score plus a
   rationale; Code → BRD gives a reason plus the full proposed text. In both,
   a reviewer sees the argument, not just the diff.
4. **Nothing moves without a person.** Approve, dismiss, commit, or say which
   side is right — always a human call, and always a second action after the
   first.
5. **Landing on named sections.** Code → BRD proposals arrive attached to
   numbered BRD template sections, which is what makes 29 signals reviewable
   rather than overwhelming.

## Vocabulary

| Say | Not |
|---|---|
| Drift Alignment | Drift Intelligence |
| Docs Sync | the drift tool |
| BRD ⇄ Jira / Code → BRD | the two tabs, the drift tabs |
| traceability link | mapping |
| Changes to apply | the BRD queue |
| Drift to resolve | the Jira queue |
| resolve | fix, correct |
| code documentation | code docs (in narration), the doc, the readme |
| proposal | suggestion, edit, diff entry |
| commit (in Code → BRD) | apply, push, sync |
| signals | findings, issues, problems |

Note the deliberate asymmetry: BRD ⇄ Jira **applies** a batch, Code → BRD
**commits** one. Both words are the product's own, on their own screens. Do not
standardize them.

**Flagged for a human — `docs/products/velox.md` looks stale.** That file says
"the Architecture module appears in the sidebar as **Design Assistant** but is
referred to as **Architecture**." In all 17 frames of this capture the sidebar
reads **Architecture**, subtitle "Technical architecture pla…", with no
"Design Assistant" anywhere. The products file's naming note appears to
describe a label the shipped UI no longer uses. Not edited here — someone
should confirm and fix the products file. The same frames also show a **Figma
Design** module in the rail that the products file's persona table never
mentions.

## Screens worth showing

Frames run in capture order within a part.

### BRD ⇄ Jira

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

### Code → BRD

- **The two routes card**, diff-an-existing-BRD beside seed-a-new-one. One
  frame that says the tab handles both "we have a spec" and "we never wrote
  one".
- **The review counters**, signals splitting into add / modify / to-do. The
  strongest single frame in this tab: it makes a document diff legible as a
  small, countable set of decisions.
- **An expanded ADD proposal** showing REASON above the full PROPOSED content,
  ideally one whose proposal is a table. Proves the reviewer reads the actual
  text before approving, not a summary.
- **The commit count changing** as rows are ticked — the opt-in model made
  visible in a single before-and-after pair.
- **The done screen**, "applied N changes" with "updated in place". Lands the
  outcome on the artifact rather than on the tool.
- **Not worth showing:** the SELECT step's raw list of 63 Confluence pages. It
  is a file picker, and a long one.

## Video plan

**[The split below is a proposal, not a decision. Confirm before authoring.]**

| Video | `module` | `part` | `videoType` | Covers | Status |
|---|---|---|---|---|---|
| BRD ⇄ Jira tutorial | `drift-alignment` | `brd-jira` | `tutorial` | One-time setup (both linking paths, three-bucket matching), then both ongoing loops: Changes to apply and Drift to resolve, including the comment-based signal | **Built.** `velox-drift-alignment-brd-jira-tutorial`, 2m 54s |
| Code → BRD tutorial | `drift-alignment` | `code-brd` | `tutorial` | The DIFF route end to end: pick a code doc, pick a BRD, scan, review typed proposals, commit in place | **Ready to author** from the 17 rebranded frames |
| Drift Alignment promo | `drift-alignment` | *(none)* | `promo` | One promo argues for the whole module | Not started |

Two open questions on the split:

**Does the SEED route need its own video?** It is one card and one hand-off to
the BRD Assistant, which already has its own tutorial. Recommendation: mention
it in the Code → BRD tutorial as the other branch and do not build a third
video for it. It is a fork in one flow, not an independent capability — the
same reasoning that kept setup and resolve inside one BRD ⇄ Jira tutorial.

**Which tab does the promo lead on?** The promo has no `part` because it isn't
scoped to one capability. The strongest single frame in the module is still the
BRD ⇄ Jira resolve screen, SOURCE beside CURRENT. Code → BRD now offers a
second candidate in the review counters, which argue volume-made-manageable
rather than divergence-made-visible. Recommendation: hook from resolve, body
frame from Code → BRD review, so the promo shows the module is more than one
trick.

`dev-sync` still needs its own capture before any video can be authored. Dev
Sync is not in production and needs no video yet.

## TODO — not yet captured, do not invent

### Code → BRD

- **What a TO DO proposal is.** The REVIEW step counts 3 of them and offers a
  filter tab for them, but no TO DO row was ever expanded. Unknown whether it
  means "needs a human to write this section", "ambiguous, decide yourself", or
  something else. **The most useful missing piece in this flow** — it is a
  third of the proposal taxonomy and currently undocumented.
- **The SEED route past its card.** "Create a new BRD" hands off to the BRD
  Assistant with the code doc as seed context. The BRD Assistant side of that
  hand-off was not captured, so it is unknown whether the conversation opens
  pre-seeded, what it says first, or whether the code doc appears as an
  attached source.
- **What `locked` means** on the `TARGET · BRD` card. The label is visible on
  every reconcile frame and is never explained. Guessing at it would be wrong;
  it may mean the page is locked for editing during the diff, or that the BRD
  is a locked baseline version.
- **How a code doc reaches the Code docs index.** The index held exactly one
  entry, "Code Documentation — whole repository — unknown", v1, 85 days old.
  Presumably published by Dev Sync, per its tooltip, but no screen shows the
  publish step. The word "unknown" in the title is unexplained — possibly an
  undetected repository name.
- **What happens on a second run** against the same pair. Whether previously
  committed proposals reappear, and whether the code doc's version tag guards
  against re-committing the same change, is not shown.
- **Whether a rejected or unticked proposal is remembered.** No dismiss control
  exists, so it is unknown whether leaving a row unticked suppresses it next
  time or simply does nothing.
- **Any failure state.** No screen shows a scan finding zero signals, a commit
  failing, or a Confluence write being rejected.

### BRD ⇄ Jira

- **What "The BRD is outdated" produces.** The resolve modal says it will
  "generate a proposed BRD amendment... you'll review it next" — that next
  screen was not captured.
- **What "The story is wrong" produces.** Presumably a Jira revert
  confirmation; not captured.
- **Whether comment-based drift detection is real-time or batch**, and what
  precisely triggers it.

### Module-wide

- **Dev Sync.** Not in production. No video needed until it ships; only the
  tooltip line exists: "Publish code docs and keep commits honest against
  Jira." No screens.
- **The adoption blocker**, per the section above: confirm whether it is
  feature awareness, or whether nobody is publishing code docs in the first
  place.
- **Whether PMs at Deluxe reconcile any of this by hand today.** Still
  unconfirmed, and still the input that would sharpen the promo argument past
  "they don't know this exists". No video may state a time saving until it
  exists.
