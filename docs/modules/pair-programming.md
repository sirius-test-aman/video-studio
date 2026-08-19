# Module: Pair Programming

The only module whose work happens outside the product. The tab carries setup
instructions; everything after that runs inside the developer's own IDE through
MCP servers.

UI label is **Pair Programming**. The deck calls it Coding. Use Pair Programming.

---

## What it does

Installs a set of MCP servers into the developer's IDE, so an AI coding assistant
answers with the project's real Jira, Confluence and BRD context instead of from
the file in front of it.

**Five servers.** Naming below matches `.mcp.json` as it appears on screen.

| Server | What it does | When it runs |
|---|---|---|
| `enhance-prompt` | Rewrites a task into an enriched prompt carrying requirement, ticket and decision context, and shows the rewritten prompt back to you | when you ask, by prefix or slash command |
| `code-documentation` | Checks documentation against the change | while implementing an enhanced prompt |
| `unit-test` | Checks and generates unit tests for the change | while implementing an enhanced prompt |
| `code-quality` | Runs a standard quality toolchain and reports in chat | on request |
| `security` | Runs a standard security toolchain and reports in chat | on request |

`code-documentation` and `unit-test` fire as part of implementing an enhanced
prompt rather than being invoked directly.

**A frame of `.mcp.json` shows seven servers**, including `test-workflow` and
`pipeline-analyzer`. Those two are not day-to-day user concerns. **Do not narrate,
caption or list them**, even though they are visible. Narrate only what a
developer invokes.

## Who it is for

Developers. **Engineering and DevOps** profile. Works with any MCP-compatible IDE:
Cursor, VS Code, Claude Desktop, Windsurf.

## Setup, as the tab presents it

Four steps, shown as a stepper: **Prepare, Install, Reload, Test.**

1. **Prepare** — Windows PowerShell or macOS Terminal, VS Code ≥ 1.114 (or Cursor / Claude Code), GitHub Copilot (or Claude Code). Open the project folder you want the assistant to work in.
2. **Install** — one command, project id already filled in. It installs `uv` if absent, fetches and caches the MCP server wheel, writes `.vscode/mcp.json` into the folder, and verifies with a real MCP handshake.
3. **Reload** — command palette, `Developer: Reload Window`. The server starts on reload. No environment variables to set by hand.
4. **Test** — type a coding task. Prefix with `enhance`, or type `/` and choose `mcp.enhance-prompt.enhance_task`.

The page headline is *"Wire your IDE into the codebase brain."* Selecting a
project replaces `<YOUR_PROJECT_ID>` in the command automatically.

## What the enhanced prompt carries

**From Jira:** linked tickets, acceptance criteria and user story details; sprint
goals, priorities and task dependencies; known bugs, blockers and related issue
history.

**From Confluence:** BRD context enriched with relevant requirements; architecture
decisions, design patterns and ADRs; technical docs, API specs and architecture
runbooks; stakeholder requirements, compliance and team standards.

## The adoption blocker

Three, one per video, and they are different arguments.

- **Setup and enhance-prompt:** developers assume another AI tool means switching tools. The proposition is the opposite — keep Copilot or Cursor, gain the requirement and design context they lack. Lead with "you are not changing tools."
- **Code quality:** they already have linters in CI, so "we can lint your code" argues nothing. The real argument is **standardisation** — the same toolchain, the same rules, across every codebase and every developer, instead of whatever each repo happens to have configured.
- **Code security:** identical shape. Not "we scan for vulnerabilities" but "everyone scans the same way."

## Facts safe to state

- Quality and security run a fixed toolchain — radon, lint, lizard among others. **Do not name a specific tool in narration unless it is visible on screen**, since the set changes.
- Results come back **as a chat response**, not a separate report or dashboard.
- **Reports only by default.** The developer can choose to let the agent apply the changes.
- Setup is one command plus a window reload. No manual JSON editing, no wheel download, no pip.
- Context is scoped to the selected project, not the whole workspace.

## What we do not claim

- Never position it as replacing Copilot, Cursor or the IDE.
- Never claim it writes production code unattended. Nothing is applied unless the developer chooses.
- Never claim it replaces CI linting or security scanning in the pipeline.
- No coverage, velocity or defect-reduction numbers. None are measured.
- Do not present a tool as available if a screen shows it missing.

## Screens worth showing

Frames run in capture order; this says which moments carry weight.

- **Setup:** the four-step stepper, the one install command, the server showing as Running after reload.
- **Enhance:** the plain task typed, then the rewritten prompt returned. That before-and-after pair is the whole argument for video one.
- **Quality / security:** the chat response with findings, and the moment the developer chooses whether to apply changes.
- **Not worth showing:** any frame with a terminal path, git remote or file breadcrumb naming a client. Any frame showing a tool as MISSING.

## Three videos planned

| Video | `part` | Library tabs | Covers |
|---|---|---|---|
| 1 | `enhance` | `setup`, `enhance` | setup, then `enhance-prompt` |
| 2 | `quality` | `quality` | `code-quality` |
| 3 | `security` | `security` | `security` |

Assets are staged from `library/pair-programming/` by tab. All three share one
module knowledge file — this one.

Video 1 carries the setup, so 2 and 3 assume it and should not re-teach it.

The IDE portion is product-neutral. Keep "Archon" and "Velox" out of the IDE
narration and in the hook, CTA and setup steps only — identical narration text
hashes to the same audio clip, so the Velox versions of these videos cost nothing
for their whole middle.

## TODO

- Whether `code-documentation` and `unit-test` produce visible output worth a frame, or run silently.
- Whether quality and security can run across a whole repo or only a changed scope.
