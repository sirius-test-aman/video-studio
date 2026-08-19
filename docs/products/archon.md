# Product: Archon AI

Read this before authoring any spec whose `product` is `archon`. Facts are drawn
from the Archon Product Foundation deck. Anything marked TODO is not documented
and must not be invented.

Product name is **Archon AI**. "SDLC Orchestrator" is internal. Velox is the same
codebase delivered to Deluxe as a client — see `products/velox.md`, and never mix
the two in one video.

---

## Naming: the UI label always wins

The deck and the interface use different names. **Narration and captions use the
UI label**, because the viewer is reading the screen while listening.

| Deck / internal | UI label — use this |
|---|---|
| Requirements | **BRD Assistant** |
| Sprint Planning | **Jira** (the action starts in **Confluence**) |
| Architecture | **Architecture** |
| Coding | **Pair Programming** |
| Testing | **Testing** |
| Deployment and IaC | **Deployment** |
| Drift Alignment | **Drift Intelligence** |

Sidebar order: Home, BRD Assistant, Confluence, Jira, Architecture, Pair
Programming, Testing, Deployment, Drift Intelligence.

Legacy agent names — Agent Analyst, Agent Product Manager, Agent Project Manager,
Agent SAD, Mary — are Velox-era and **never appear in Archon copy.**

## What it is

A client-hosted orchestration layer spanning the full delivery lifecycle,
requirements through deployment. It does not replace the tools an engineering
organisation already runs. It connects them, carries context between phases, and
makes every AI-assisted step traceable.

## The argument, in the deck's own terms

Every phase already has AI, and none of them share what they know. At each handoff
a person reads one system and types the same thing into the next. So every phase
got faster and the release date did not move, because time saved inside a phase is
spent again at the handoff.

## Audience — two distinct people

- **Prospective users** — developers, analysts, QA, DevOps. They want to know what it does to their day.
- **Prospective buyers** — engineering leaders, CISOs. They want to know about exposure, evidence and spend.

A single video usually serves one, not both. Decide which before writing the hook.

Target market: Banking, Payments, Fintech. Engineering organisations of roughly
75 to 500 developers.

## Two profiles

| Profile | Who | Unlocks |
|---|---|---|
| Business and Product | BAs, product managers, scrum masters | BRD Assistant, Architecture, Jira planning, Drift Intelligence |
| Engineering and DevOps | Developers, architects, QA, DevOps | Pair Programming, Architecture, Testing, Deployment, IaC |

## Facts safe to state

- **Client hosted.** The platform, its servers and the audit ledger all run inside the client estate. Requirements, code and prompts never transit a vendor tenant.
- **Fifteen native connectors today**, and anything with an API joins through the MCP layer.
- **No migration, no re-platforming, no change programme** before value appears.
- **Developers lose 20 to 40 minutes a session** chasing tickets, documents and configuration. Archon assembles that context scoped to the task.
- Every generated line is marked **assumption, agreed, or written by a person**.
- **42% of financial firms have AI fully deployed** in software delivery, a further 33% in development.
- Existing tools stay: Jira, Confluence, VS Code, Cursor, Copilot, Katalon, Selenium, Harness, Terraform, Lucidchart.
- Drift Intelligence is the only capability that runs continuously, and it **drafts rather than pushes**.

## The governing principle

> Every module generates and a named human publishes. Generated is not the same as
> published, and that distinction is what makes the trail defensible.

Lead with this for any sceptical or buyer-facing audience. It is the strongest
thing the product says about itself.

## What we do not claim

- Never imply anything publishes, deploys or files without a person.
- Never position Archon as replacing Copilot, Cursor, Katalon, Harness or Jira.
- Never state a time or cost saving as a number unless it appears above. Qualitative claims are fine.
- Do not describe Drift Intelligence as fixing anything. It detects and drafts.
- Do not use the deck's module names in narration. UI labels only.
- Avoid "governance", "source of truth", "seamlessly", "leverage", "empower", "unlock".

## Distribution and CTA

Videos play on the solution's own page, where a first-time visitor also finds
demo tours and a contact option. So the viewer is already there — **do not explain
what Archon is in a promo hook**, and do not send them anywhere specific.

CTA is generic and short: "Try it today." / "Reach out to us to learn more."
Never "AI Central" — that is Velox and Deluxe-internal only.

## Differences from Velox worth knowing

- No Saviynt access request, no AD groups, no approval wait.
- No AI Central. No Deluxe branding, personas or terminology.
- Same underlying capability, SiriusAI branding.

## Not documented — do not invent

- Adoption numbers for Archon. The 80–90 users figure is Velox on Deluxe only.
- Any customer name, testimonial or measured outcome beyond the deck's own claims.
- Pricing, packaging or licence tiers.
