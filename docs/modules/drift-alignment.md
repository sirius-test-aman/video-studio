# Module: Drift Alignment (BRD Sync)

Compares what the code actually does against what the BRD says it should do.

---

## What it does

Generates **code documentation** from a repository using MCP, then **compares that
documentation against an existing BRD** to surface where implementation and
requirements have diverged. Seeding a new BRD from code documentation is marked
Coming Soon.

## Who it is for

Business Analysts, Product Owners and delivery leads on **Business User** role,
on any system that has been live long enough to drift.

## The adoption blocker

**Nobody is looking for this, because drift is invisible until it causes an
incident or an audit finding.** Unlike other modules, this one has no manual
equivalent people are already doing badly — there is usually no process at all.
So the promo has to create the problem awareness before offering the answer.

## What is genuinely true

- Code documentation is generated from the repository via MCP.
- Comparison is against an **existing** BRD.
- Seeding a new BRD from code documentation is **Coming Soon** and must not be presented as available.

## What we do not claim

- Never present drift detection as complete or as an audit.
- Never imply it fixes drift. It surfaces it.
- Do not mention the Coming Soon capability as current.

## Safe emphasis

1. Makes an invisible problem visible.
2. Compares against the agreed requirement, not against an opinion.

## TODO

This is the least documented module and the one whose value most depends on
output quality. Get a real comparison output before authoring anything.
