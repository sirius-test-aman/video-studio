# PRODUCT.md — Velox

Read this before authoring any spec. Facts here are drawn from the Velox User
Guide and the SDLC Orchestrator Workflow Documentation v3. Anything marked TODO
is not yet documented and must not be invented.

---

## What it is

Velox is Deluxe's AI-powered SDLC Orchestrator, at `ai-labs.deluxe.com/sdlc`.
It runs agents across four phases of software delivery — Requirements, Designing,
Planning, Development — so that an artifact produced in one phase feeds the next.

**Naming:** "SDLC Orchestrator" is the programme and the Saviynt application
name. "Velox" is the tool users log into and the name to use in all narration.

## The differentiator, in the product's own words

Most AI development tooling concentrates on the build phase. Velox is balanced
across all four phases, and the artifacts chain: a BRD feeds architecture,
planning, backlog, code context and test generation. That traceability from
requirement to code is the argument, not raw code generation speed.

## Adoption position — read this before any promo

| | |
|---|---|
| Total users to date | **80 to 90** |
| Repeat monthly users | **30 to 35** |
| Phase 1 target | **400** |

The gap is not that people have not heard of Velox. It is **feature-level value
awareness**: users know the product exists, often know the section they need
exists, and do not know what a given feature can actually do for them.

Every promo therefore assumes the viewer has heard of Velox and argues for one
specific capability. Do not spend a promo introducing the product.

**Distribution:** videos are published in the **AI Central newsletter**.
**CTA destination:** AI Central, where a Deluxe employee can access Velox or
request access. Every promo CTA points there.

## Personas served

| Persona | Phase | Modules |
|---|---|---|
| Product Managers, Product Owners, Business Analysts | Requirements | BRD Assistant |
| Architects, Tech SMEs | Designing | Architecture / Design Assistant |
| TPMs, Scrum Masters, Program / Project Managers | Planning | Planning, Jira |
| Development Engineers | Development | Pair Programming |
| Quality Engineers | Development | Testing |
| DevOps / SREs | Development | Deployment |

## Access model

Two roles, requested through Saviynt and approved before access.

| Role | Gets | AD group |
|---|---|---|
| Business User | BRD Assistant, Confluence, Jira, Drift Alignment | `SDLC_Orchestrator_App_Prod_Business` |
| Tech User | Pair Programming, Architecture, Testing, Deployment, Jira (read only), Confluence (read only) | `SDLC_Orchestrator_App_Prod_Tech` |

A video's audience determines which role sees it. A Jira-creation video is for
Business Users; Tech Users only have read access.

## Agents, by their documented names

| Agent | Does | Input |
|---|---|---|
| **Agent Analyst** | Generates a BRD through conversation, asking clarifying questions | a rough idea, bullets, a problem statement |
| **Agent Product Manager** | Generates a BRD from supplied documents | transcripts, notes, briefs, images |
| **Agent SAD** | Produces the Solution Architecture Document | BRD plus system landscape |
| **Agent Project Manager** | Breaks a BRD into Epics and Stories with acceptance criteria | BRD |
| **Mary** | Named assistant for section-level BRD editing and suggestions | an existing BRD |

**Mary is Agent Analyst.** The name is user-facing and appears only on the BRD
tab, covering both the generating conversation and post-generation editing.
Outside the BRD tab, use the agent name rather than Mary.

## Artifact chain

```
documentation? ──no──> Agent Analyst ──> BRD
                └─yes─> Agent PM      ──> BRD
BRD ──> Lucid diagrams + Agent SAD ──> SAD
BRD ──> Agent Project Manager ──> Epics / Stories ──> Jira
Stories + BRD + SAD ──> IDE (Copilot / Cursor) ──> code + unit tests
Stories + acceptance criteria ──> Katalon ──> test cases
SAD ──> IaC / pipelines (Harness)
```

## Concrete facts, safe to state

- BRD template has **16 sections**.
- Document-led BRD generation: **60 to 90 seconds**.
- Conversational BRD generation: **90 to 300 seconds**, depending on conversation length.
- Jira Epic and Story generation from a BRD: **30 to 60 seconds**.
- Generated BRD content is tagged **"User - Provided"** or **"AI - Assumption"**.
- Audit scores each BRD section for completeness and **flags issues without changing content**. Audit notes never appear in the final BRD.
- Confluence sync is **two-way**: edits in Confluence appear in the Velox Confluence tab.
- BRD can be downloaded as Word or pushed to a new Confluence page.
- Section edits can be reverted, **one change only**.
- Development phase deliberately keeps engineers in existing approved tools — VS Code, GitHub Copilot, Cursor, Katalon, Harness — rather than replacing them.

## Positioning guardrails

- **Nothing acts without the user's trigger.** Generation waits for a button press. Nothing is pushed to Jira or Confluence without an explicit action and, for Jira, a per-item checkbox selection.
- **Assumptions are labelled, not hidden.** The User-Provided versus AI-Assumption tagging is the strongest trust argument the product has. Lead with it for sceptical audiences.
- **Audit flags, it does not fix.** Never describe audit as correcting the document.
- Do not claim autonomy, unattended operation, or that Velox replaces a role.
- **Qualitative time claims are allowed** — "in minutes, not days", "before the meeting ends". Let the reviewer accept or cut them.
- **Numeric claims are not**, unless the number appears in this file. No hours saved, no percentages, no headcount equivalents. The manual baseline has never been measured.
- Avoid "governance", "source of truth", "seamlessly", "leverage", "empower", "unlock".
- Never say Velox replaces Copilot, Cursor, Katalon or Harness. It feeds them.

## Vocabulary

| Say | Not |
|---|---|
| Velox | VLOX, Vlox, velox |
| BRD Assistant | BRD module, BRD tool |
| Agent Analyst / Agent Product Manager | the AI, the bot |
| Epics and Stories (in a video body) | cards, work items |
| Project Workspace | workspace, project space |
| Sync Docs | refresh, reindex |
| Atlassian | Jira/Confluence collectively |

"Jira tickets" is acceptable in a **hook, title or CTA**, because that is what the
audience says. In the body of a video, use the product's own terms: Epics and
Stories.

Note: the Architecture module appears in the sidebar as **Design Assistant** but
is referred to as **Architecture**. Use "Architecture" in narration and mention
the sidebar label only if a screenshot makes the mismatch visible.

## Not documented — do not invent

TODO, and needed before any promo can argue anything:

- **Which modules see the most use.** Useful for deciding video order.
- **What the manual baseline costs** — how long a BRD or a backlog takes without Velox. Until this exists, no video may state a time saving.
- **Any pilot results, testimonials or measured outcomes.**
- **Known limitations users complain about.** The most useful missing input after the baseline, because it tells you which objection each promo must pre-empt.
