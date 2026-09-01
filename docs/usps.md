# USP Shorts — Candidate Catalogue

Feature-highlight videos for the newsletter, distinct from module tutorials and
promos. Same format and length as an existing promo. Each entry below is a
candidate, not a commitment — selection criteria are at the end.

Every claim here is traced to where it was established. **Do not add a claim
without doing the same.** Two claims requested for this format — *token
optimization* and *a constantly improving feedback loop* — are not in this file
because nothing in the existing knowledge base documents either one. Do not
author a video for them until real evidence exists; ask the person who
requested them for source material first.

---

## Before authoring a USP short — the entry must be complete

A USP short may only be authored from a **complete entry in this file**. An
entry is complete when it states all five of the following. Anything less is
incomplete, whatever it looks like:

| Field | Complete means |
|---|---|
| **Claim** | the claim stated precisely, in the words a viewer would have to believe — not a buzzword |
| **Evidence** | a named document, a metric, or a specific mechanism — traceable, not asserted |
| **Screens available** | a real library path and tab, or an explicit note that no screen exists and the branded text/motion-graphics format is needed |
| **Audience** | who the claim is meant to convince, and what they do not currently know |
| **Must not imply** | what this claim may not be stretched into |

**If the requested USP is missing from this file, or its entry is incomplete,
stop before writing a storyline** and ask the person who requested it these
five questions:

1. What exactly is the claim — stated precisely, not as a buzzword?
2. What is the real evidence — a document, a metric, or a specific mechanism?
3. Is there a UI screen that demonstrates this, or does it need the branded
   text/motion-graphics format?
4. Who is this meant to convince, and what do they not currently know?
5. Is there anything this claim should **not** be allowed to imply?

Write the answers into this file as a new numbered entry under the right
product, in the same format as the existing nine, **before** proceeding to the
storyline. Do not infer an answer from an adjacent module doc, and do not
proceed on four out of five.

Template:

```markdown
### N. <one-line headline in the viewer's language>
**Claim:** <the precise claim>
**Evidence:** <document / metric / mechanism, cited>
**Screens available:** <library path + tab, or "none — branded text/motion-graphics format">
**Audience:** <who it must convince, and what they don't already know>
**Must not imply:** <the stretch this claim may not be used to make>
**Why it lands:** <optional, one line>
**Overlap warning:** <optional, if it duplicates an existing promo's argument>
```

The nine entries below predate `Audience` and `Must not imply`. Fill those two
in from the same five questions the first time one of them is used for a video.

---

## Velox

### 1. Integrates with your existing dev tools, doesn't replace them
**Claim:** Development stays in VS Code, GitHub Copilot, Cursor, Katalon and
Harness — Velox feeds those tools rather than requiring a new one.
**Evidence:** `docs/products/velox.md`, positioning guardrails — *"Never say
Velox replaces Copilot, Cursor, Katalon or Harness. It feeds them."*
**Screens available:** Pair Programming module library (`library/pair-programming/`,
`enhance` tab) — the enhanced prompt landing in the IDE.
**Why it lands:** direct answer to the "another tool to learn" objection.

### 2. Every line is labelled — yours or the AI's, never hidden
**Claim:** Generated BRD content is tagged **User-Provided** or
**AI-Assumption**, visible line by line.
**Evidence:** `docs/products/velox.md` — *"the strongest trust argument the
product has."*
**Screens available:** BRD Assistant library, any frame showing the tag
distinction.
**Why it lands:** the single strongest trust argument already on record.

### 3. Nothing ships without a person
**Claim:** Generation always waits for a trigger; nothing reaches Jira or
Confluence without an explicit action.
**Evidence:** `docs/products/velox.md` positioning guardrails.
**Screens available:** Planning module, the per-item checkbox + board-selection
screen already used in the planning promo.
**Overlap warning:** this argument already anchors the Planning promo. Using it
again here needs a different angle or it will read as a repeat.

### 4. Catches drift a person would only notice by accident
**Claim:** Drift Alignment flags not just direct edits but a Jira **comment**
that implies a scope change — a softer signal most tools miss entirely.
**Evidence:** `docs/modules/drift-alignment.md`, "safe emphasis."
**Screens available:** Drift Alignment library, the SOURCE-vs-CURRENT resolve
modal — already flagged as the strongest single frame in that module.
**Why it lands:** genuinely distinctive, not a claim any competitor tool makes
casually.

### 5. Answers your own questions from your own project — zero setup
**Claim:** The home knowledge base answers questions grounded in the project's
own synced Confluence and Jira, with clickable source citations, no document
upload required.
**Evidence:** `docs/modules/home-knowledge-base.md` — flagged there as *"the
highest-leverage promo candidate"* because almost nobody knows it exists.
**Screens available:** `home-knowledge-base` module frames — check the library
has any; may need a fresh capture.
**Why it lands:** lowest effort-to-value ratio in the whole product, and it's
the least discovered.

### 6. Standardised quality and security, not whatever each repo happens to have
**Claim:** The same quality and security toolchain runs across every developer
and every codebase, rather than depending on what's configured locally.
**Evidence:** `docs/modules/pair-programming.md`, adoption blocker for the
`quality` and `security` parts.
**Screens available:** Pair Programming library, `quality`/`security` tabs.
**Overlap warning:** if standalone quality/security tutorials already exist,
check this doesn't just restate them.

## Obsida

### 7. Never leaves your infrastructure
**Claim:** Client-hosted; requirements, code and prompts never transit a
vendor tenant.
**Evidence:** `docs/products/obsida.md`.
**Screens available:** none identified yet — this is an infrastructure claim,
likely better served by the branded-text-only format than a screenshot.

### 8. Generated is not the same as published
**Claim:** Every module generates a draft; a named human is the one who
publishes it. The governing trust principle of the whole product.
**Evidence:** `docs/products/obsida.md` — called out there as *"the strongest
thing the product says about itself."*
**Screens available:** any Approve/Publish moment across module libraries.
**Why it lands:** directly answers the "will this go rogue" fear a skeptical
audience brings to any AI tool.

### 9. Fifteen connectors, one layer
**Claim:** Fifteen native connectors today, anything else joins through MCP.
**Evidence:** `docs/products/obsida.md`.
**Screens available:** none identified — likely a text/motion-graphic claim.

---

## Selection criteria for Claude Code

Judge candidates on both counts below, not one:

- **Objective:** does real evidence exist in a knowledge file, and does a
  usable screenshot exist in the library (or would this need the
  branded-text-only format)? A claim failing either test is not ready,
  regardless of how good it sounds.
- **Subjective:** would this argument change a sceptical viewer's mind, or is
  it a feature nobody would ask about? Favour distinctive claims over generic
  ones — "we're fast" convinces nobody; "a Jira comment can flag drift before
  anyone edits the ticket" is specific enough to be believable.

Pick **no more than the number of promos already made for that product.**
Flag any candidate whose argument duplicates an existing promo's rather than
silently reusing it — overlap is noted above where it's already known.

## Format note

These use the same six-beat promo shape as everything else. The difference is
the body: where a promo's body walks a real screen, a USP short's body may be
branded text and motion graphics instead, when no real screen exists for the
claim. **That rendering capability does not exist in the pipeline yet** — see
the engineering note this catalogue was delivered alongside.
