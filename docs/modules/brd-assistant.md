# Module: BRD Assistant

Generates a 16-section Business Requirements Document, either from documents you
already have or from a conversation. Then lets you edit, audit, and publish it.

---

## What it does

Two entry paths:

- **Document-led** — **Agent Product Manager** reads uploaded .txt, .docx or .pdf files (multiple files are concatenated) and drafts the BRD. 60 to 90 seconds.
- **Conversational** — **Agent Analyst**, named **Mary** on the BRD tab, asks clarifying questions and uses the conversation as context. 90 to 300 seconds depending on length. Documents can be added mid-conversation.

After generation: edit section by section, chat with Mary, use Suggest per
section or across the whole BRD, run an audit, then download as Word or push to
Confluence.

## Who it is for

Business Analysts, Product Owners, Product Managers. **Business User** role.

Document-led suits someone holding a transcript or brief. Conversational suits
someone with only a rough idea.

## The adoption blocker

**Feature-level awareness within the module.** The BRD Assistant is the most
known part of Velox, so the gap is not existence — it is that people generate a
BRD once and never discover the conversational path, the audit, the Suggest
button, or the assumption tags. They treat it as a one-shot generator.

## What is genuinely true

- **16 sections** from the Deluxe template.
- Content is tagged **"User - Provided"** or **"AI - Assumption"**, so provenance is visible line by line.
- **Audit** scores each section for completeness using an LLM as judge, and **only flags** issues. It never edits content, and audit notes never appear in the final BRD.
- Section edits can be **reverted, one change only**.
- **Suggest** proposes improvements to a section or the whole document; you choose whether to apply, and can edit the applied instruction first.
- Push to Confluence creates a **new page and returns a link**.
- The Confluence tab keeps a **two-way sync**: edits made in Confluence appear in Velox.
- The conversation can continue after generation and produce a new BRD with the added context.
- Agent Analyst can **search the web** for content to curate into relevant sections, on instruction.

## What we do not claim

- Never say the BRD is finished or sign-off ready. It is a draft with visible assumptions.
- Never describe audit as fixing anything.
- Do not imply revert history is unlimited. It is one change.
- Do not claim it removes stakeholder review.

## Safe emphasis

1. **Assumption tags.** Every line is either from your input or labelled as an assumption. This is the strongest trust argument Velox has.
2. **You hold the trigger.** Generate waits for a button press.
3. **Two ways in**, so a rough idea is enough — you do not need a polished transcript.
4. **Audit flags gaps without changing your words.**

## Vocabulary

| Say | Not |
|---|---|
| BRD Assistant | BRD module, BRD tool |
| Mary / Agent Analyst | the bot, the AI |
| Agent Product Manager | the PM bot |
| session | thread, chat |
| Generate BRD | build, create the doc |

Mary is the user-facing name for Agent Analyst and appears only on the BRD tab.
Elsewhere use the agent name.

## Screens worth showing

- **Moment of value:** the drafted BRD with its section list populated.
- **Strongest single frame:** a section showing an AI-Assumption tag beside a User-Provided one.
- The choice between conversation and documents.
- Audit output with completeness scores.
- **Not worth showing:** login, Atlassian linking, project creation.

## Related videos

- `specs/brd-tutorial-v2.spec.json` — document-led, Agent PM
- `specs/brd-chat-tutorial.spec.json` — conversational, Mary
