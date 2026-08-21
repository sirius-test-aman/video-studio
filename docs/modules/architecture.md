# Module: Architecture (Design Assistant)

Produces architecture diagrams via Lucid, then a Solution Architecture Document
grounded in the BRD.

**Sidebar label is "Design Assistant"; the module is referred to as
"Architecture".** Use "Architecture" in narration unless a screenshot makes the
mismatch visible.

---

## What it does

Two phases. **Diagrams first** — Velox builds a detailed prompt for Lucid from the
BRD and existing system context, producing architecture diagrams, flow charts or
mind maps. **Then the SAD** — Agent SAD writes the Solution Architecture Document,
which can be edited and exported.

Requires a **Lucid account linked** via API token on the Profile page.

## Who it is for

Architects and Tech SMEs. **Tech User** role.

## The adoption blocker

**Feature awareness.** Architects do not know a SAD can be generated from a BRD
they already have. They are not resisting the idea; they have never encountered
it. So a video's job is to show the capability exists and what it produces, not
to argue against an objection.

The Lucid API token step is a secondary barrier — real, but it stops people after
they are interested rather than before. Do not lead with it.

**For the promo**, the exact framing is genuinely unsettled. Use the variant set
to test it rather than picking one: the "you already have the BRD" angle, the
"traceability from requirement to component" angle, a trust angle answering
whether generated architecture can be relied on, and an outcome angle on what the
SAD contains. Pick the winner from the renders.

## What is genuinely true

- Inputs are the **BRD**, the existing system landscape where available, and non-functional requirements.
- The SAD covers high-level architecture with descriptions, component responsibilities, the data model and integration points, performance, security and reliability considerations, and an operational and deployment view.
- It maps capabilities from the BRD to system components, so the design traces back to a requirement.
- It identifies cross-cutting concerns: logging, observability, security, data privacy.
- It recommends technology choices and integration patterns.
- The SAD is the primary input into planning and into IaC generation.

## What we do not claim

- Never present the SAD as approved architecture. It is a draft for engineering alignment.
- Do not imply diagrams are generated without Lucid. The integration is required.
- Do not claim it makes technology decisions. It recommends.

## Safe emphasis

1. **Traceability** — capabilities map from BRD to component.
2. **Cross-cutting concerns surfaced** rather than remembered.
3. **Feeds downstream** — the SAD becomes the input to IaC generation.

## Screens worth showing

- **Moment of value:** a generated diagram, or the SAD with its component section populated.
- The BRD-to-component mapping if it is visible anywhere.
- **Not worth showing:** the Lucid API token screen in a promo. Fine in a tutorial.
