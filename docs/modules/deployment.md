# Module: Deployment

UI label is **Deployment** — the sidebar reads "Deployment" with the subtitle
"Pipelines, deployments & logs" in every screenshot this file is drawn from.
Note the subtitle undersells the module: IaC generation and MCP troubleshooting
also live here.

Surfaces an already-connected Harness account inside Velox, lets an AI edit
pipeline YAML, and generates modular Terraform from a Solution Architecture
Document.

---

## What it does

The module's landing page offers **two cards**, and they are separate products
with separate audiences:

- **DevOps** — "Manage your Harness deployment lifecycle end-to-end — pipelines,
  executions, logs, and infrastructure-as-code — with AI-powered analysis on
  failed runs." Opens a six-item rail: **Settings, Overview, Pipelines,
  Deployments, Logs, IaC**.
- **Troubleshooting using MCP** — badged **DEVELOPER FLOW**. An MCP tool in the
  developer's IDE that consolidates Harness logs, pipeline YAML and matched past
  incidents, then hands the AI unified context for a root-cause verdict.
  **Never opened in this capture set.** Everything known about it is the card's
  own four bullets. See TODO.

Inside DevOps:

**Settings** shows the Harness connection, not a connection form. The frames
show it already connected — "Harness Connected · Token managed via My Profile ·
Workspace configured below" — with Account ID, Organisation and Project, and a
link out to **My Profile → Integrations** to update the token.

**Overview** is a status page: three tiles (PIPELINES, RUNNING, RECENT
FAILURES), a **Recent Executions** table (Pipeline / Status / Started) with
"View all", and a **Pipelines** table (Name / Last Run / Status) with "Edit
pipelines".

**Pipelines** is a two-pane editor. The left list carries every pipeline with
its last status; selecting one opens **YAML**, **Triggers**, and **Input Sets**
tabs, a `Store: INLINE` line with Created and Modified timestamps, and a **Save
to Harness** button. Beside the YAML sits an **AI EDIT** panel: a free-text box
("Describe the change you want to make to this pipeline"), an **Apply AI Edit**
button, and four **Quick actions** — add an approval step before the deploy
stage, add a Slack notification on failure, change the timeout to 30 minutes,
add a rollback on failure. Triggers shows a webhook trigger with its type,
Enabled state, webhook URL and View YAML; Input Sets shows each input set with a
show/hide YAML toggle.

**Deployments** lists recent pipeline executions — PIPELINE, RUN #, STATUS,
STARTED, DURATION — with a From/To date filter, a Refresh button, a "click any
row to view logs" instruction, a loaded-vs-total count in the header, and a
"See more" link that pages further.

**Logs** is "Execution Logs — View pipeline execution details and diagnose
failures with AI". It takes an **execution ID** and a **Load Logs** button, then
shows the run header (pipeline name, status, started, duration, Trigger, By) and
an expandable **Stages** list with per-stage status and duration. The loaded run
in these frames succeeded, so **no AI failure analysis was captured**. See TODO.

**IaC** opens the **Terraform Generator**, "Choose how you want to work with
Terraform infrastructure", with two paths:

- **Existing Project — Manage Existing IaC.** "Connect to Bitbucket and fetch
  your existing Infrastructure as Code repository. Velox will analyze the
  codebase so you can edit and push changes back." Chips: Bitbucket Connect, AI
  Analysis, Push with Write Token. **Never entered.** See TODO.
- **New Project — Generate New Terraform.** "Upload a Solution Architecture
  Document and let Velox extract infrastructure components and generate modular,
  production-grade Terraform code from scratch." Chips: SAD Upload, Component
  Extraction, Checkov Scan. Captured end to end.

### The New Project flow, in full

A four-step wizard: **Upload SAD → Components → Generate → Download**.

1. **Upload SAD.** Document Title, Project Name, AWS Region (a dropdown), and an
   Environment choice of **DEV / STAGING / PROD**. The document arrives by
   **Upload Document** or **Paste Text**; upload accepts **PDF, DOCX or TXT** and
   states plainly that **"Only text is extracted — diagrams are ignored"**. Then
   **Extract Components**, which runs visibly as "Extracting components…".
2. **Components.** "Velox identified *N* infrastructure components. Deselect any
   you don't need, or add missing ones below." Everything arrives **pre-selected**,
   grouped under **COMPUTE, DATABASE, STORAGE, SECURITY, INTEGRATION,
   MONITORING**, each with a one-line description of what it is for. **Select
   All** and **Clear** act on the whole set, **"Add a component not detected by
   Velox"** covers the misses, and the primary button counts the selection live:
   **Generate Terraform (N modules)**.
3. **Generate.** "Generating Terraform modules…", then **Generation complete**
   with a per-module tick and "All modules complete!". A **FILES** tree appears
   beside a code viewer: `modules/<component>/{main.tf, variables.tf, outputs.tf}`
   plus root `main.tf`, `variables.tf`, `outputs.tf`, `terraform.tfvars.example`
   and `README.md`. The viewer has **Copy** and **Edit** (Edit swaps to **Done**,
   so generated code is editable in place before it leaves). Three actions sit
   below: **Security Scan**, **Push to Repository**, **Download ZIP** — and after
   the scan runs the button itself reports the count, e.g. **"Scan (3 issues)"**.
4. **Download.** "Terraform Code Ready! Your modular Terraform code for
   *<project>* has been downloaded." A **Next steps** block gives the literal
   commands — `unzip <project>-terraform.zip`, `cd <project>`, `cp
   terraform.tfvars.example terraform.tfvars`, `terraform init`, `terraform plan`
   — and offers **View Code**, **Push to Repository**, **Download Again**, **New
   Document**.

## Who it is for

DevOps engineers and SREs. **Tech User** role. The MCP troubleshooting card is
aimed one step further left, at developers in their IDE — it carries the
DEVELOPER FLOW badge rather than sitting in the DevOps rail.

## The adoption blocker

**Confirmed.** Feature awareness, as everywhere else — with one thing that makes
this module different from Architecture or Drift Alignment. Harness is already
these users' daily tool, so the question a DevOps engineer asks is not "what is
this" but "why would I do it here instead of in Harness". The Terraform
Generator is the honest answer, because Harness has no SAD-to-Terraform path at
all.

So a promo leads with IaC generation and treats the pipeline and log views as
supporting evidence that Velox sits alongside Harness rather than in front of
it.

## What is genuinely true

- The Harness connection is **token-based and set up elsewhere** — on My Profile
  → Integrations, not in this module. Settings here reports the connection and
  names the Account, Organisation and Project it is bound to.
- Pipelines are **editable as YAML inside Velox**, and edits reach Harness only
  through an explicit **Save to Harness**.
- The **AI EDIT** panel takes a natural-language instruction against one
  pipeline and offers four canned changes as quick actions. It produces an edit
  to review; **Apply AI Edit** is the user's press.
- Execution logs are **fetched by execution ID** and broken down by stage, with
  status and duration per stage.
- Terraform generation is driven by the **SAD**, so the infrastructure traces
  back to a documented architecture — the same document Agent SAD produces in
  the Architecture module.
- **Only the SAD's text is used. Diagrams are ignored**, and the UI says so on
  the upload step.
- Component extraction is **a proposal a human trims**. Everything is
  pre-selected, anything can be deselected, and a component Velox missed can be
  added by hand.
- Generated code is **modular** — one directory per component, plus a root
  module, a `terraform.tfvars.example` and a README.
- Generated Terraform targets **AWS** (`hashicorp/aws`, region chosen on the
  upload step) and carries a pinned provider version, common tags
  (Project / Environment / ManagedBy = Terraform) and inline security comments.
- Generated code can be **edited in the browser before it leaves**, via Edit /
  Done in the file viewer.
- A **security scan** runs against the generated code on demand and reports a
  finding count on the button. `[Guessing]` — that scan is Checkov, inferred
  from the New Project card's "Checkov Scan" chip; the scan output itself was
  never opened.
- The flow **ends by handing the user code**: a ZIP, or a push to their own
  repository, followed by `terraform init` and `terraform plan` **on their own
  machine**. Velox never runs Terraform.
- Environment is chosen up front (**DEV / STAGING / PROD**) and is carried into
  the generated code as a variable, not baked into resource names by hand.

## What we do not claim

- **Never say Velox deploys, applies or provisions anything.** The last thing it
  does is give you a ZIP and tell you to run `terraform plan` yourself.
- **Never present generated Terraform as ready to apply.** "Production-grade" is
  the product's own word on the card and may be quoted as such; a review step is
  not optional, and the security scan finding issues on a freshly generated
  module is exactly why.
- Do not claim it replaces the Harness console. It reads from and writes to
  Harness, and Harness stays the deployment platform.
- Do not describe the Existing Project / Bitbucket path as SAD-driven — it is
  the opposite direction: it reads IaC you already have. **The previous version
  of this file claimed SAD generation "works for both new and existing
  projects". That was wrong.**
- Do not describe AI failure analysis on a failed run. The capability is claimed
  by the DevOps card and the Logs subtitle, but no failed run and no AI verdict
  was captured. See TODO.
- Do not describe the MCP troubleshooting flow beyond its four card bullets.
  Nothing behind that card was captured.
- Do not cite the sample session's numbers — the pipeline count, the component
  count, the three scan issues. They belong to one project's data, not to the
  product.

## Safe emphasis

1. **Architecture document in, Terraform out.** The distinctive capability, and
   the one thing Harness does not do.
2. **The human trims the component list.** Extraction proposes; a person
   deselects, adds and only then generates.
3. **Editable before it ships.** Generated code can be corrected in the browser,
   scanned, then pushed or downloaded.
4. **Nothing is applied.** The flow deliberately stops at `terraform plan`, in
   the user's own hands.
5. **Existing toolchain preserved.** Harness stays the platform; Velox surfaces
   it and feeds it.

## Vocabulary

| Say | Not |
|---|---|
| Deployment | DevOps module, the Harness module |
| DevOps | the Harness area, the pipelines page |
| IaC (nav label) / Terraform Generator (page) | infra code, the IaC tool |
| Existing Project / New Project | import / create |
| Extract Components | parse, scan the SAD |
| Generate Terraform | build the infrastructure |
| Security Scan | vulnerability scan, audit |
| Push to Repository | commit, push to Git |
| Execution Logs | pipeline logs, run history |
| Troubleshooting using MCP | the MCP tool |
| Harness | our pipeline tool |
| SAD / Solution Architecture Document | the architecture doc, the design |

## Screens worth showing

Frames run in capture order within a part.

- **Moment of value:** the **Components** step, with the "Velox identified *N*
  infrastructure components" line and the category groups visible. It is the one
  frame that proves a document was actually read — component names and
  one-line purposes, not a spinner.
- **The payoff frame:** **Generation complete** with the file tree and real HCL
  in the viewer. Shows what you get, concretely.
- **The trust frame:** **Scan (N issues)** beside Push to Repository and Download
  ZIP — generated code is checked, not blessed.
- **The "it stops here" frame:** the Download step's Next steps block. `terraform
  init` and `terraform plan` on screen is the strongest possible statement that
  Velox does not deploy.
- **For a DevOps tutorial:** the **AI EDIT** panel on a pipeline YAML, quick
  actions visible; and the **Logs** stage breakdown.
- **Not worth showing:** the Harness Settings screen in a promo — fine in a
  tutorial, since it explains the prerequisite. The Overview tiles on their own
  (three numbers is an inventory, not a moment). Intermediate "Extracting
  components…" and "Generating Terraform modules…" frames, except as a single
  brief beat.
- **The two Windows dialog frames are kept, deliberately.** The file picker over
  the upload step and the Save As dialog over the Download step are part of the
  flow — choosing the SAD, and naming the ZIP — so they stay in the set. Their
  browser chrome is **left un-rebranded on purpose**: the OS dialog covers most
  of it, and replacing the remainder is not worth the effort. Reviewed and
  accepted; do not "fix" these two.

## Video plan

**Decided: two tutorials and one promo.** The module holds two capabilities with
different audiences and no shared prerequisite: watching Harness from inside
Velox, and turning a SAD into Terraform. A viewer who wants IaC does not need
the pipeline views first, so forcing them into one tutorial costs runtime for
nothing.

| Video | `module` | `part` | `videoType` | Covers |
|---|---|---|---|---|
| IaC tutorial | `deployment` | `iac` | `tutorial` | Terraform Generator, New Project path end to end: upload, components, generate, edit, scan, download |
| DevOps tutorial | `deployment` | `devops` | `tutorial` | Harness Settings, Overview, Pipelines with AI Edit, Deployments, Execution Logs |
| Deployment promo | `deployment` | *(none)* | `promo` | One promo for the module, arguing the IaC capability. Hook drawn from the Components or Generation-complete frame |

The promo has no `part` because it argues for the module rather than one
capability, and may pull its hook from either tutorial's footage.

**MCP troubleshooting is not in this plan and needs no video yet** — nothing
behind that card was captured. It is also not settled that it belongs to this
module: it runs in the IDE, and Pair Programming already owns MCP setup and IDE
integration. Decide between `deployment` / `mcp` and a part of
`pair-programming` when the screens arrive, not before.

## TODO — not yet captured, do not invent

- **Troubleshooting using MCP.** The card was never opened. Everything it does —
  listing failed Harness executions from the IDE, fetching step logs and pipeline
  YAML and the execution graph, RAG retrieval of matching Confluence runbooks and
  Jira tickets, the infrastructure-vs-application-code verdict — is the card's
  own copy, unverified. No screens.
- **AI analysis of a failed run.** Both the DevOps card ("AI-summarize failed
  runs and propose YAML fixes") and the Logs subtitle ("diagnose failures with
  AI") claim it. The captured run succeeded, so the analysis output, its shape
  and whether a proposed YAML fix can be applied are all unknown.
- **The Existing Project / Bitbucket path.** Never entered. Unknown what
  connecting a repository looks like, what "AI Analysis" reports about existing
  IaC, and what "Push with Write Token" requires.
- **The security scan output.** The button reports a count; the issue list was
  never opened. Unknown whether findings are per-file, severity-ranked, or fixable
  in place — and whether the scanner is in fact Checkov.
- **Push to Repository.** Offered on both the Generate and Download steps, never
  followed. Unknown which provider, whether it opens a PR or commits to a branch,
  and what credentials it needs.
- **Apply AI Edit.** The panel was captured empty. Unknown whether the result is a
  diff to review, a full YAML replacement, or something applied straight into the
  editor — which decides how carefully the "nothing changes without you" line
  must be framed.
- **Anything with more than one component selected.** The captured run generated
  a single module. Unknown how the file tree, generation time and scan behave at
  the full 17.
- **Whether Harness must be connected before IaC works.** The Terraform Generator
  produces code and a ZIP, which needs no Harness at all, yet it lives behind the
  DevOps card and its rail. If IaC works without a Harness token, that materially
  lowers the barrier for a promo and should be stated.
- **Timings.** No duration is documented for component extraction or Terraform
  generation. Both were captured as in-progress states, so a qualitative claim is
  safe but no number is.

## Naming mismatches found against `docs/products/velox.md`

Flagged, not fixed — a human should decide which source is wrong.

- **`velox.md` says the Architecture module's sidebar label is "Design
  Assistant".** All 30 of these frames show the sidebar reading **Architecture**,
  subtitle "Technical architecture pla…". Either the label changed or the
  products file carries a planning-deck name. This affects
  `docs/modules/architecture.md`, which repeats the claim.
- **The sidebar shows a `Figma Design` module** ("Generate Figma prompts …") that
  appears nowhere in `velox.md` — not in the persona table, the access model, or
  the artifact chain, and there is no `docs/modules/figma-design.md`. Either it
  shipped after the product file was written, or it is Dev-only.

## Source frames

30 screenshots captured 2026-08-25. Originals in `~/Downloads/Deployment SS/`;
**use `~/Downloads/Deployment SS/rebranded/` as the library source.**

All 30 were Dev captures — `sdlc-dev.deluxe.com/harness` in the address bar plus
the Incognito badge. The rebranded set carries production chrome
(`ai-labs.deluxe.com/sdlc/harness`, and `ai-labs.deluxe.com/sdlc` on the entry
frame, which was captured on the module home before navigating). Filenames are
unchanged, so the two sets line up one to one.

- **28 frames rebranded** at a detected chrome height of **109px** — reuse
  `--chrome-height 109` for anything else from this session.
- **2 frames copied through unchanged** — the file picker and Save As frames, per
  the decision recorded under Screens worth showing.
- **1 extra fix on the entry frame.** It was captured mid-hover over the
  Deployment nav item, so Chrome's link-status bubble printed
  `https://sdlc-dev.deluxe.com/harness` at bottom-left, below the chrome the
  rebrand replaces. That region is page background plus sidebar text identical in
  every other frame, so it was patched from a sibling frame rather than painted
  over. All 30 were then swept for the same artifact; none remains.

`scripts/rebrand_chrome.py` needed one fix to run on this Windows host: its font
lookup only searched a Linux DejaVu path, so every label fell back to a tiny
bitmap font. It now tries Segoe UI and Arial from `%WINDIR%\Fonts` as well.
Pillow is a prerequisite and was not installed.
