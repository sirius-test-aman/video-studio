# Module: Planning — Jira tickets from a BRD

Creates Jira Epics and Stories from a BRD that already exists in the project's
Confluence space. This is the only path in Velox that creates Jira work items.

The action starts in the **Confluence tab** and ends on the **Jira tab**. The Jira
tab itself is view-only.

Workflow doc calls the agent **Agent Project Manager**.

---

## What it does

Select a BRD in the Confluence tab, click Generate Jira Stories, and Velox breaks
it into Epics and User Stories with acceptance criteria derived from the BRD. You
tick which ones to keep, choose a target board, and only those are created. You
land on the Jira tab where the created issues are listed.

Re-runnable: when the BRD changes, the backlog can be regenerated.

## Who it is for

TPMs, Scrum Masters, Program and Project Managers who currently sit with a
signed-off BRD and hand-type a backlog into Jira, deciding Epic structure as they
go. Requires the **Business User** role.

## Where it sits

Not a starting point. A BRD must already exist and be pushed to Confluence. A
video about this module should establish that the BRD exists without re-teaching
how to make one.

## The adoption blocker

**Feature-level awareness.** People know Velox exists and many have used the BRD
Assistant. They do not know that the BRD they just generated can become a
structured backlog in under a minute. They finish at the BRD and go type Jira
issues by hand.

So the promo's job is not to introduce Velox. It is to show that the artifact
they already have is one click from a backlog.

## What is genuinely true

- Generation takes **30 to 60 seconds**.
- Each Epic represents a major feature area from the BRD; Stories decompose under their Epic.
- Every Story carries a **title, description and acceptance criteria**, derived from the BRD rather than invented.
- The agent proposes **dependencies and sequencing**, and can suggest sprint allocation or release slicing.
- **Nothing reaches Jira until you select it.** Per-item checkboxes, plus an explicit board choice.
- You are redirected to the Jira tab afterwards to verify without leaving Velox.
- **Re-runnable** when the BRD changes.

## What we do not claim

- Never imply it files issues automatically or on a schedule.
- Never claim it replaces backlog refinement or sprint planning. It produces a first draft of structure.
- Do not promise the Epic breakdown matches a given team's slicing convention.
- Do not state time savings in hours. The manual baseline is not measured.
- If push fails, the cause is usually the target Jira project not permitting Epic or Story creation. Do not present creation as always succeeding.

## Safe emphasis

1. **You choose what gets created** — checkboxes and board selection.
2. **Acceptance criteria trace back to the BRD**, not to a model's imagination.
3. **Re-runnable** when requirements move.
4. **Verification is one tab away.**

## Vocabulary

| Say | Not |
|---|---|
| Epics and Stories (in the body) | tickets, cards |
| tickets (acceptable in a hook or title) | — |
| Create in Jira | push, sync, publish |
| the linked Jira project | your Jira |
| Planning module | Jira module |

"Jira tickets" is fine in a hook or video title because that is what the audience
says. Inside the video, be precise: Epics and Stories.

## Screens worth showing

Frames run in capture order. These notes say which moments carry weight, not
which order to show them in.

- **Moment of value:** the generated Epic and Story tree, before anything is created.
- **Strongest single frame:** a Story with its acceptance criteria visible. In the current capture set this only appears **after** creation, on the Jira tab, which is accepted — the trust argument lands at the end rather than mid-flow.
- **The selection moment:** checkboxes ticked plus the board dropdown. Proves the user is in control.
- **The result:** created issues on the Jira tab.
- **Browsing the Confluence page list** is acceptable as a hook frame — a shelf of finished BRDs makes the "you already have this" argument visually. Not worth a body step of its own.
- **Not worth showing:** login, project selection.

## Related videos

- `specs/brd-tutorial-v2.spec.json` — document-led BRD generation
- `specs/brd-chat-tutorial.spec.json` — conversational BRD generation

Both end at a generated BRD, which is exactly where this module begins.
