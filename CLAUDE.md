# CLAUDE.md

Operating instructions for this repository. Read this before running anything.

## What this is

A pipeline that turns numbered screenshots plus a written spec into narrated
walkthrough videos, using Remotion for rendering and ElevenLabs for voice.

One spec file describes one video. Everything downstream is derived from it.

```
specs/<module>-<videoType>.spec.json     the source of truth, hand or AI authored
public/assets/<module>-<videoType>/      step-01.png … step-NN.png
public/audio/<hash>.mp3 + .align.json    content-addressed, never named by step
out/props/<slug>/<variant>.json          render props, generated
out/videos/<slug>-<variant>.mp4          output
```

## Knowledge files

Read these before authoring anything:

| File | What it carries |
|---|---|
| `docs/AUTHORING-GUIDE.md` | spec schema, narration style, caption style, variant rules |
| `docs/PRODUCT.md` | what Velox is, audience, positioning guardrails |
| `docs/modules/<module>.md` | what this module does, its adoption blocker, safe claims, screens worth showing |

A request like "build a promo for the Jira module" is complete. Everything else
you need is in those three files plus the screenshots on disk. Do not ask the
human to restate what is already written down.

## Two gates, and the first one is cheap

**Gate 1 — storyline.** Before writing any spec, write
`out/storyline-<slug>.md` containing:

- the single argument the video makes, in one sentence
- why that argument, referencing the module's stated adoption blocker
- the frames you will use, in order, with one line each on why
- one line per variant angle, for promos
- estimated runtime

Then stop and ask the human to approve or redirect. Half a page, no more. This
gate exists because a storyboard review catches errors of fact and craft but not
errors of strategy: a well-made video arguing the wrong thing looks correct.

**Gate 2 — spec and storyboard.** Only after Gate 1 is approved, author the
spec, validate it, check assets, then start `review.mjs` and wait.

Never skip Gate 1. Never approve either gate yourself.

## The chain

Run in this order. Each step assumes the previous one passed.

```bash
node scripts/intake.mjs <srcDir> <module> <videoType>     # number raw screenshots
# --- Gate 1: write out/storyline-<slug>.md, wait for approval ---
# --- then author specs/<module>-<videoType>.spec.json ---
node scripts/validate-spec.mjs  specs/<file>.spec.json    # schema + style notes
node scripts/check-assets.mjs   specs/<file>.spec.json    # screenshots exist
node scripts/review.mjs         specs/<file>.spec.json    # HUMAN GATE — see below
node scripts/generate-audio.mjs specs/<file>.spec.json --dry-run
node scripts/generate-audio.mjs specs/<file>.spec.json    # spends money
node scripts/build-props.mjs    specs/<file>.spec.json
node scripts/render-all.mjs     <slug> [variantId]
```

`<slug>` is `<module>-<videoType>`, e.g. `brd-chat-tutorial`.

## Hard rules

**Never run `generate-audio.mjs` without `--dry-run` unless the human has asked
for it in this conversation.** It spends ElevenLabs credits from a 30,000/month
budget. A full tutorial is roughly 8–10% of a month.

**Never pass `--skip-approval`.** The approval gate is the point.

**Never modify `specs/*.json` to resolve a `check-assets` or `validate-spec`
observation unless the human asked.** Editing a spec changes its content hash and
revokes the human's approval. Report what you found and stop.

**Never delete anything in `public/audio/`.** Those files cost money. A deleted
clip is a full-price regeneration.

**Never commit `.env`.** It holds the ElevenLabs key.

## The human gate

`review.mjs` starts a local server where a person edits narration and captions,
marks click points, ticks four checks, and approves. Approval writes a
`review` block into the spec containing a hash of all reviewed content.

`generate-audio.mjs` verifies that hash before spending anything. Editing the
spec after approval revokes it automatically.

**You cannot approve.** Start the server, tell the human the URL, and wait.

## Settled decisions — do not relitigate these

These look like problems and are not. Report them if asked, never "fix" them.

- **Unused screenshots are intentional.** Intermediate loading states, agent
  "thinking" frames and duplicate views are deliberately left out of the spec.
  `check-assets` lists them for information only. Do not reassign screenshot
  fields to consume them.
- **One screenshot serving several consecutive steps is intentional.** The
  timeline builder merges consecutive identical screenshots so the image holds
  instead of re-fading. This is the desired behavior, not duplication.
- **`step-30.png` carrying the last four steps of `brd-chat-tutorial` is
  accepted.** The human reviewed it and chose to keep it.
- **`brd-chat-tutorial` has no multi-beat steps.** Verified, not a collapse.
- **Rate warnings on `s06`, `s18`, `s23` of `brd-tutorial-v2` are accepted.**
  Those `referenceSeconds` come from a hand-edited original and are advisory.
- **`referenceSeconds` is ignored by the timeline builder** and read only by the
  validator. Do not remove it and do not use it for timing.

## Things that are commonly misread

- **`validate-spec`'s runtime estimate is a floor.** It divides characters by
  15.1 chars/sec and ignores `minHoldSeconds` and trailing padding. The real
  runtime comes from `build-props`, which reads actual audio durations.
- **Audio filenames are hashes, not step numbers.** `sha256(model + voice +
  narration)` truncated. Identical narration across specs shares one file. This
  is why paraphrasing a line costs full price and copying it verbatim costs
  nothing.
- **`out/props/` is namespaced by slug.** Two specs both have a `v0-control`
  variant; without the slug directory they would overwrite each other.
- **The `focus` field is `{x, y}` only.** Normalized 0–1. Set by a human in the
  review page, never authored by an AI.
- **Body frames always run in capture order**, tutorial or promo. The numbering
  is a real sequence in a real interface and a viewer is following it. Never
  reorder the body to open on the payoff. A promo leads with its strongest
  argument through the **hook's narration and caption**; the hook is a separate
  prepended step and may use any frame, including a late one. A frame may repeat
  only in consecutive steps. The validator checks all of this.

## Writing or editing a spec

Read `docs/AUTHORING-GUIDE.md` first. It is the schema, the narration style, the
caption style and the variant rules. The validator enforces some of it; the rest
is judgment the guide encodes.

Two rules that matter most:

- Narration must describe **what an agent is trying to achieve**, never the
  specific question it asked in the sample session. The recorded conversation is
  one example, not the product's behavior.
- Captions are self-sufficient labels, 3–9 words, never a transcript of the
  narration and never a reference to the sample data.

## Environment

- Windows host, Git Bash. Node scripts are plain `.mjs` with no build step.
- `.env` needs `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`.
- `npm run dev` starts Remotion Studio on port 3000. It previews whatever
  `public/timeline.json` holds, which `build-props` writes from the first variant.
- Renders need the Windows Remotion compositor in `node_modules`. They will not
  run in a Linux VM.

## When something fails

1. Read the actual error. These scripts fail loudly and name the problem.
2. If a schema issue, quote it to the human and propose the fix. Do not apply it
   to the spec without being asked.
3. If a spec was edited after approval, say so and point at `review.mjs`.
4. If `check-assets` exits non-zero, a referenced screenshot genuinely does not
   exist. Unused files never cause a non-zero exit.
