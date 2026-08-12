# Module: Pair Programming

Brings Velox's upstream artifacts into the developer's IDE through MCP, so code
is written with the BRD, SAD and story context available.

---

## What it does

The tab carries its own setup instructions for MCP and IDE integration. The point
is contextual grounding: for a given story, the developer has the BRD from
Requirements, the SAD and diagrams from Designing, and the story's own
description and acceptance criteria — inside the IDE.

Developers keep using **VS Code**, **GitHub Copilot** and **Cursor**. Velox
supplies context, not a new editor.

## Who it is for

Development Engineers. **Tech User** role.

## The adoption blocker

**Feature awareness, and a credible suspicion.** Developers assume another AI
coding tool means switching tools. The actual proposition is the opposite: keep
Copilot and Cursor, gain the requirement and design context they lack. A promo
must lead with "you are not changing tools".

## What is genuinely true

- Developers stay in existing approved tools: VS Code, GitHub Copilot, Cursor once rolled out.
- Context reaching the IDE includes the BRD, the SAD and diagrams, and story details with acceptance criteria.
- Unit tests can be created, refined or extended in the IDE like normal code.
- The stated benefit is a traceable link from requirements and design into code and its tests.

## What we do not claim

- Never position it as a Copilot or Cursor replacement.
- Never claim it writes production code unattended.
- Do not claim coverage or velocity numbers. Not measured.

## Safe emphasis

1. **You are not changing tools.**
2. **Your IDE gains the why**, not just the what.
3. Tests trace back to acceptance criteria.

## TODO

The user guide defers to on-tab instructions. Capture what MCP setup actually
involves before authoring a tutorial.
