# Module: Testing

Generates test scenarios and test cases from stories, acceptance criteria,
system flows and business rules.

---

## What it does

Generates **test scenarios** from the project's stories. Works with or without
MCP configured, with different paths for each. Can link a **GitHub** or
**Bitbucket** account for repository context.

Per the workflow doc, a QA Test Design Assistant produces manual test cases from
user stories and linked epics, acceptance criteria, system flows from the SAD, and
business rules from the BRD. Automated testing runs through **Katalon**.

## Who it is for

Quality Engineers, manual and automation. **Tech User** role.

## The adoption blocker

**Feature awareness.** QEs write test cases from stories by hand and do not know
the acceptance criteria already in the backlog can seed them, or that the SAD and
BRD add system-level and business-rule context a story alone does not carry.

## What is genuinely true

- Test cases draw on four inputs: stories, acceptance criteria, system flows from the SAD, business rules from the BRD.
- Structured output includes preconditions and test data, step-by-step actions, and expected results.
- Two operating modes depending on whether MCP is configured.
- GitHub and Bitbucket can be linked for repository context.
- Automated testing uses **Katalon**, an already-approved platform, rather than a Velox-specific runner.

## What we do not claim

- Never claim generated tests are complete or replace exploratory testing.
- Do not imply Velox executes tests. Katalon does.
- Do not describe coverage in percentages. Not measured.

## Safe emphasis

1. **Four grounded inputs**, not just the story text.
2. **Stays in Katalon**, the tool QEs already use.
3. Traceability from business rule to test case.

## TODO

The user guide's Testing section is thinner than the others. Confirm what the MCP
configured versus not-configured paths actually change for the user before
authoring a video.
