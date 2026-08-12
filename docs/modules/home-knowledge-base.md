# Module: Home page — knowledge base and support agent

A retrieval-augmented assistant that answers questions about your project's own
synced Confluence and Jira content, and about Velox itself.

---

## What it does

Reached by clicking the Velox logo. Ask a question about the project and it
answers from synced Confluence pages and Jira issues, **citing its sources with
links you can open**. It also answers questions about how to use Velox, drawn
from the user guide.

**Sync Docs** runs an incremental sync: changed Confluence pages and changed Jira
issues since the last sync, with embeddings updated in the vector store.

## Who it is for

Anyone on the project. Especially someone new to a codebase or a workstream who
would otherwise ask a colleague or dig through Confluence.

## The adoption blocker

**Almost nobody knows this exists.** It sits behind the logo rather than in the
module rail, and it is the module with the lowest effort-to-value ratio in the
whole product — no setup, no artifact, just a question. Highest-leverage promo
candidate for that reason.

## What is genuinely true

- Answers are grounded in **your project's** synced Confluence and Jira content, not general knowledge.
- **Sources are cited** and the links resolve to real pages and issues.
- Follow-up questions keep conversational context.
- It can also answer Velox how-to questions from the user guide.
- Sync is **incremental**, not a full re-index.
- Answer quality depends on synced content. If answers look thin, sync again.

## What we do not claim

- Never present it as authoritative beyond what is synced.
- Never imply sync is automatic and instant. It is triggered.
- Do not claim it replaces reading the source document. It cites it so you can.

## Safe emphasis

1. **Grounded in your project**, with citations you can click.
2. **Zero setup.** No document to upload, no artifact to create.
3. Answers Velox questions too, so it doubles as onboarding help.

## Screens worth showing

- **Moment of value:** an answer with source citations visible.
- A follow-up question showing retained context.
- **Not worth showing:** the sync progress indicator on its own.
