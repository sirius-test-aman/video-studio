# Repo snapshot — 2026-08-21 11:15

## Git

branch `main`

```
e1e5bf1 Point the studio preview at the architecture tutorial
f2c3059 Add the velox pair-programming videos and the promo
74a5664 Add the architecture module: library, specs and narration
3e64f7a Restate the architecture module's adoption blocker
69d2026 Rename slug-lib to slug and the module template to _TEMPLATE
12ee4ae Stop image drag from swallowing click-point placement
ebef324 Tag library frames by product and filter staging on it
fb2bada Add video beats alongside screenshot beats
8eabe5b Add screenshot library and staging, split product docs, land Planning tutorial
a7f06c5 Renumber planning-promo frames and land the approved spec
a04b833 Add per-variant narration overrides and promo caption styling
ec4155e Add Planning promo, knowledge files, and promo-shape tooling
```

Uncommitted:

```
M CLAUDE.md
 M docs/AUTHORING-GUIDE.md
 M docs/modules/pair-programming.md
D  docs/products/PRODUCT.md
RM docs/products/archon.md -> docs/products/obsida.md
 M library/pair-programming/manifest.json
 M package.json
D  public/assets/architecture-promo/frames.json
D  public/assets/architecture-promo/step-01.png
D  public/assets/architecture-promo/step-02.png
D  public/assets/architecture-promo/step-03.png
D  public/assets/architecture-promo/step-04.png
D  public/assets/architecture-promo/step-05.png
D  public/assets/architecture-promo/step-06.png
D  public/assets/architecture-promo/step-07.png
D  public/assets/architecture-promo/step-08.png
D  public/assets/architecture-promo/step-09.png
D  public/assets/architecture-promo/step-10.png
D  public/assets/architecture-promo/step-11.png
D  public/assets/architecture-promo/step-12.png
D  public/assets/architecture-promo/step-13.png
D  public/assets/architecture-promo/step-14.png
D  public/assets/architecture-promo/step-15.png
D  public/assets/architecture-promo/step-16.png
D  public/assets/architecture-promo/step-17.png
D  public/assets/architecture-promo/step-18.png
D  public/assets/architecture-promo/step-19.png
D  public/assets/architecture-promo/step-20.png
D  public/assets/architecture-promo/step-21.png
D  public/assets/architecture-promo/step-22.png
D  public/assets/architecture-promo/step-23.png
D  public/assets/architecture-promo/step-24.png
D  public/assets/architecture-promo/step-25.png
D  public/assets/architecture-promo/step-26.png
D  public/assets/architecture-tutorial/frames.json
D  public/assets/architecture-tutorial/step-01.png
D  public/assets/architecture-tutorial/step-02.png
D  public/assets/architecture-tutorial/step-03.png
D  public/assets/architecture-tutorial/step-04.png
D  public/assets/architecture-tutorial/step-05.png
D  public/assets/architecture-tutorial/step-06.png
D  public/assets/architecture-tutorial/step-07.png
D  public/assets/architecture-tutorial/step-08.png
D  public/assets/architecture-tutorial/step-09.png
D  public/assets/architecture-tutorial/step-10.png
D  public/assets/architecture-tutorial/step-11.png
D  public/assets/architecture-tutorial/step-12.png
D  public/assets/architecture-tutorial/step-13.png
D  public/assets/architecture-tutorial/step-14.png
D  public/assets/architecture-tutorial/step-15.png
D  public/assets/architecture-tutorial/step-16.png
D  public/assets/architecture-tutorial/step-17.png
D  public/assets/architecture-tutorial/step-18.png
D  public/assets/architecture-tutorial/step-19.png
D  public/assets/architecture-tutorial/step-20.png
D  public/assets/architecture-tutorial/step-21.png
D  public/assets/architecture-tutorial/step-22.png
D  public/assets/architecture-tutorial/step-23.png
D  public/assets/architecture-tutorial/step-24.png
D  public/assets/architecture-tutorial/step-25.png
D  public/assets/architecture-tutorial/step-26.png
D  public/assets/pair-programming-enhance-tutorial/frames.json
D  public/assets/pair-programming-enhance-tutorial/step-01.png
D  public/assets/pair-programming-enhance-tutorial/step-02.png
D  public/assets/pair-programming-enhance-tutorial/step-03.png
D  public/assets/pair-programming-enhance-tutorial/step-04.png
D  public/assets/pair-programming-enhance-tutorial/step-05.png
D  public/assets/pair-programming-enhance-tutorial/step-06.png
D  public/assets/pair-programming-enhance-tutorial/step-07.png
D  public/assets/pair-programming-enhance-tutorial/step-08.png
D  public/assets/pair-programming-enhance-tutorial/step-09.png
D  public/assets/pair-programming-enhance-tutorial/step-10.png
D  public/assets/pair-programming-enhance-tutorial/step-11.png
D  public/assets/pair-programming-enhance-tutorial/step-12.png
D  public/assets/pair-programming-enhance-tutorial/step-13.png
D  public/assets/pair-programming-enhance-tutorial/step-14.png
D  public/assets/pair-programming-enhance-tutorial/step-15.png
D  public/assets/pair-programming-enhance-tutorial/step-16.png
D  public/assets/pair-programming-enhance-tutorial/step-17.png
D  public/assets/pair-programming-enhance-tutorial/step-18.png
D  public/assets/pair-programming-enhance-tutorial/step-19.png
 D public/assets/pair-programming-enhance-velox-tutorial/frames.json
 D public/assets/pair-programming-enhance-velox-tutorial/step-01.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-02.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-03.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-04.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-05.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-06.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-07.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-08.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-09.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-10.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-11.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-12.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-13.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-14.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-15.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-16.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-17.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-18.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-19.png
 D public/assets/pair-programming-enhance-velox-tutorial/step-20.png
D  public/assets/pair-programming-promo/frames.json
D  public/assets/pair-programming-promo/step-01.png
D  public/assets/pair-programming-promo/step-02.png
D  public/assets/pair-programming-promo/step-03.png
D  public/assets/pair-programming-promo/step-04.png
D  public/assets/pair-programming-promo/step-05.png
D  public/assets/pair-programming-promo/step-06.png
D  public/assets/pair-programming-promo/step-07.png
D  public/assets/pair-programming-promo/step-08.png
D  public/assets/pair-programming-promo/step-09.png
D  public/assets/pair-programming-promo/step-10.png
D  public/assets/pair-programming-promo/step-11.png
D  public/assets/pair-programming-promo/step-12.png
D  public/assets/pair-programming-promo/step-13.png
D  public/assets/pair-programming-promo/step-14.png
D  public/assets/pair-programming-promo/step-15.png
D  public/assets/pair-programming-promo/step-16.png
D  public/assets/pair-programming-promo/step-17.png
D  public/assets/pair-programming-promo/step-18.png
D  public/assets/pair-programming-promo/step-19.png
D  public/assets/pair-programming-promo/step-20.png
D  public/assets/pair-programming-promo/step-21.png
D  public/assets/pair-programming-promo/step-22.png
D  public/assets/pair-programming-promo/step-23.png
D  public/assets/pair-programming-promo/step-24.png
D  public/assets/pair-programming-promo/step-25.png
D  public/assets/pair-programming-promo/step-26.png
D  public/assets/pair-programming-promo/step-27.png
D  public/assets/pair-programming-promo/step-28.png
D  public/assets/pair-programming-promo/step-29.png
D  public/assets/pair-programming-promo/step-30.png
R  public/assets/brd-chat-tutorial/step-01.png -> public/assets/velox-brd-chat-tutorial/step-01.png
R  public/assets/brd-chat-tutorial/step-02.png -> public/assets/velox-brd-chat-tutorial/step-02.png
R  public/assets/brd-chat-tutorial/step-03.png -> public/assets/velox-brd-chat-tutorial/step-03.png
R  public/assets/brd-chat-tutorial/step-04.png -> public/assets/velox-brd-chat-tutorial/step-04.png
R  public/assets/brd-chat-tutorial/step-05.png -> public/assets/velox-brd-chat-tutorial/step-05.png
R  public/assets/brd-chat-tutorial/step-06.png -> public/assets/velox-brd-chat-tutorial/step-06.png
R  public/assets/brd-chat-tutorial/step-07.png -> public/assets/velox-brd-chat-tutorial/step-07.png
R  public/assets/brd-chat-tutorial/step-08.png -> public/assets/velox-brd-chat-tutorial/step-08.png
R  public/assets/brd-chat-tutorial/step-09.png -> public/assets/velox-brd-chat-tutorial/step-09.png
R  public/assets/brd-chat-tutorial/step-10.png -> public/assets/velox-brd-chat-tutorial/step-10.png
R  public/assets/brd-chat-tutorial/step-11.png -> public/assets/velox-brd-chat-tutorial/step-11.png
R  public/assets/brd-chat-tutorial/step-12.png -> public/assets/velox-brd-chat-tutorial/step-12.png
R  public/assets/brd-chat-tutorial/step-13.png -> public/assets/velox-brd-chat-tutorial/step-13.png
R  public/assets/brd-chat-tutorial/step-14.png -> public/assets/velox-brd-chat-tutorial/step-14.png
R  public/assets/brd-chat-tutorial/step-15.png -> public/assets/velox-brd-chat-tutorial/step-15.png
R  public/assets/brd-chat-tutorial/step-16.png -> public/assets/velox-brd-chat-tutorial/step-16.png
R  public/assets/brd-chat-tutorial/step-17.png -> public/assets/velox-brd-chat-tutorial/step-17.png
R  public/assets/brd-chat-tutorial/step-18.png -> public/assets/velox-brd-chat-tutorial/step-18.png
R  public/assets/brd-chat-tutorial/step-19.png -> public/assets/velox-brd-chat-tutorial/step-19.png
R  public/assets/brd-chat-tutorial/step-20.png -> public/assets/velox-brd-chat-tutorial/step-20.png
R  public/assets/brd-chat-tutorial/step-21.png -> public/assets/velox-brd-chat-tutorial/step-21.png
R  public/assets/brd-chat-tutorial/step-22.png -> public/assets/velox-brd-chat-tutorial/step-22.png
R  public/assets/brd-chat-tutorial/step-23.png -> public/assets/velox-brd-chat-tutorial/step-23.png
R  public/assets/brd-chat-tutorial/step-24.png -> public/assets/velox-brd-chat-tutorial/step-24.png
R  public/assets/brd-chat-tutorial/step-25.png -> public/assets/velox-brd-chat-tutorial/step-25.png
R  public/assets/brd-chat-tutorial/step-26.png -> public/assets/velox-brd-chat-tutorial/step-26.png
R  public/assets/brd-chat-tutorial/step-27.png -> public/assets/velox-brd-chat-tutorial/step-27.png
R  public/assets/brd-chat-tutorial/step-28.png -> public/assets/velox-brd-chat-tutorial/step-28.png
R  public/assets/brd-chat-tutorial/step-29.png -> public/assets/velox-brd-chat-tutorial/step-29.png
R  public/assets/brd-chat-tutorial/step-30.png -> public/assets/velox-brd-chat-tutorial/step-30.png
R  public/assets/brd-docs-tutorial/step-01.png -> public/assets/velox-brd-docs-tutorial/step-01.png
R  public/assets/brd-docs-tutorial/step-02.png -> public/assets/velox-brd-docs-tutorial/step-02.png
R  public/assets/brd-docs-tutorial/step-03.png -> public/assets/velox-brd-docs-tutorial/step-03.png
R  public/assets/brd-docs-tutorial/step-04.png -> public/assets/velox-brd-docs-tutorial/step-04.png
R  public/assets/brd-docs-tutorial/step-05.png -> public/assets/velox-brd-docs-tutorial/step-05.png
R  public/assets/brd-docs-tutorial/step-06.png -> public/assets/velox-brd-docs-tutorial/step-06.png
R  public/assets/brd-docs-tutorial/step-07.png -> public/assets/velox-brd-docs-tutorial/step-07.png
R  public/assets/brd-docs-tutorial/step-08.png -> public/assets/velox-brd-docs-tutorial/step-08.png
R  public/assets/brd-docs-tutorial/step-09.png -> public/assets/velox-brd-docs-tutorial/step-09.png
R  public/assets/brd-docs-tutorial/step-10.png -> public/assets/velox-brd-docs-tutorial/step-10.png
R  public/assets/brd-docs-tutorial/step-11.png -> public/assets/velox-brd-docs-tutorial/step-11.png
R  public/assets/brd-docs-tutorial/step-12.png -> public/assets/velox-brd-docs-tutorial/step-12.png
R  public/assets/brd-docs-tutorial/step-13.png -> public/assets/velox-brd-docs-tutorial/step-13.png
R  public/assets/brd-docs-tutorial/step-14.png -> public/assets/velox-brd-docs-tutorial/step-14.png
R  public/assets/brd-docs-tutorial/step-15.png -> public/assets/velox-brd-docs-tutorial/step-15.png
R  public/assets/brd-docs-tutorial/step-16.png -> public/assets/velox-brd-docs-tutorial/step-16.png
R  public/assets/brd-docs-tutorial/step-17.png -> public/assets/velox-brd-docs-tutorial/step-17.png
R  public/assets/brd-docs-tutorial/step-18.png -> public/assets/velox-brd-docs-tutorial/step-18.png
R  public/assets/brd-docs-tutorial/step-19.png -> public/assets/velox-brd-docs-tutorial/step-19.png
R  public/assets/brd-docs-tutorial/step-20.png -> public/assets/velox-brd-docs-tutorial/step-20.png
R  public/assets/brd-docs-tutorial/step-21.png -> public/assets/velox-brd-docs-tutorial/step-21.png
R  public/assets/planning-promo/step-01.png -> public/assets/velox-planning-promo/step-01.png
R  public/assets/planning-promo/step-02.png -> public/assets/velox-planning-promo/step-02.png
R  public/assets/planning-promo/step-03.png -> public/assets/velox-planning-promo/step-03.png
R  public/assets/planning-promo/step-04.png -> public/assets/velox-planning-promo/step-04.png
R  public/assets/planning-promo/step-05.png -> public/assets/velox-planning-promo/step-05.png
R  public/assets/planning-promo/step-06.png -> public/assets/velox-planning-promo/step-06.png
R  public/assets/planning-tutorial/step-01.png -> public/assets/velox-planning-tutorial/step-01.png
R  public/assets/planning-tutorial/step-02.png -> public/assets/velox-planning-tutorial/step-02.png
R  public/assets/planning-tutorial/step-03.png -> public/assets/velox-planning-tutorial/step-03.png
R  public/assets/planning-tutorial/step-04.png -> public/assets/velox-planning-tutorial/step-04.png
R  public/assets/planning-tutorial/step-05.png -> public/assets/velox-planning-tutorial/step-05.png
R  public/assets/planning-tutorial/step-06.png -> public/assets/velox-planning-tutorial/step-06.png
R  public/assets/planning-tutorial/step-07.png -> public/assets/velox-planning-tutorial/step-07.png
R  public/assets/planning-tutorial/step-08.png -> public/assets/velox-planning-tutorial/step-08.png
R  public/assets/planning-tutorial/step-09.png -> public/assets/velox-planning-tutorial/step-09.png
R  public/assets/planning-tutorial/step-10.png -> public/assets/velox-planning-tutorial/step-10.png
R  public/assets/planning-tutorial/step-11.png -> public/assets/velox-planning-tutorial/step-11.png
R  public/assets/planning-tutorial/step-12.png -> public/assets/velox-planning-tutorial/step-12.png
R  public/assets/planning-tutorial/step-13.png -> public/assets/velox-planning-tutorial/step-13.png
R  public/assets/planning-tutorial/step-14.png -> public/assets/velox-planning-tutorial/step-14.png
R  public/assets/planning-tutorial/step-15.png -> public/assets/velox-planning-tutorial/step-15.png
R  public/assets/planning-tutorial/step-16.png -> public/assets/velox-planning-tutorial/step-16.png
 M public/timeline.json
 M scripts/build-props.mjs
 M scripts/check-assets.mjs
D  scripts/focus-picker.mjs
 M scripts/lib/slug.mjs
 M scripts/review.mjs
 M scripts/stage.mjs
 M specs/brd-chat-tutorial.spec.json
 M specs/brd-tutorial-v2.spec.json
 M specs/pair-programming-enhance-tutorial.spec.json
 D specs/pair-programming-enhance-velox-tutorial.spec.json
 M specs/planning-promo.spec.json
 M specs/planning-tutorial.spec.json
 M src/Walkthrough.tsx
?? public/assets/obsida-pair-programming-enhance-tutorial/
?? public/assets/velox-architecture-promo/
?? public/assets/velox-architecture-tutorial/
?? public/assets/velox-pair-programming-enhance-tutorial/
?? public/assets/velox-pair-programming-promo/
?? public/audio/094e57c0b06f98d5.align.json
?? public/audio/094e57c0b06f98d5.mp3
?? public/audio/15f15bbcfc18769f.align.json
?? public/audio/15f15bbcfc18769f.mp3
?? public/audio/210d8dde43ea5924.align.json
?? public/audio/210d8dde43ea5924.mp3
?? public/audio/529ee33ccb984504.align.json
?? public/audio/529ee33ccb984504.mp3
?? public/audio/646b2574c5cf8844.align.json
?? public/audio/646b2574c5cf8844.mp3
?? public/audio/7c4a67da0f501b07.align.json
?? public/audio/7c4a67da0f501b07.mp3
?? public/audio/95567ea296c1631e.align.json
?? public/audio/95567ea296c1631e.mp3
?? public/audio/964ddc4635d23167.align.json
?? public/audio/964ddc4635d23167.mp3
?? public/audio/99c1bb4e7d111fc8.align.json
?? public/audio/99c1bb4e7d111fc8.mp3
?? public/audio/a19acc2f7ac18da1.align.json
?? public/audio/a19acc2f7ac18da1.mp3
?? public/audio/be89b1ae98f98646.align.json
?? public/audio/be89b1ae98f98646.mp3
?? public/audio/e2b866b561d5eafe.align.json
?? public/audio/e2b866b561d5eafe.mp3
?? scripts/snapshot.mjs
?? snapshot.md
?? specs/velox-pair-programming-enhance-tutorial.spec.json
```

## Code — 28 files

| file | lines | sha |
|---|---|---|
| `eslint.config.mjs` | 4 | `7f2ca640` |
| `remotion.config.ts` | 13 | `fa8d8d0d` |
| `scripts/build-props.mjs` | 85 | `cafb3b08` |
| `scripts/check-assets.mjs` | 94 | `4d23379e` |
| `scripts/extract-frames.mjs` | 225 | `10eb76f0` |
| `scripts/generate-audio.mjs` | 80 | `83bc4d28` |
| `scripts/intake.mjs` | 161 | `8f92e37d` |
| `scripts/lib/audio-cache.mjs` | 61 | `b255832a` |
| `scripts/lib/content-hash.mjs` | 45 | `b7be1091` |
| `scripts/lib/ffmpeg.mjs` | 187 | `bf4924ab` |
| `scripts/lib/resolve.mjs` | 89 | `65a64c36` |
| `scripts/lib/slug.mjs` | 14 | `89e658d1` |
| `scripts/lib/spec-schema.mjs` | 179 | `8881f4a0` |
| `scripts/lib/timeline.mjs` | 175 | `507eff47` |
| `scripts/lib/video-beats.mjs` | 71 | `d2e43f87` |
| `scripts/library.mjs` | 191 | `9236b464` |
| `scripts/pick-frames.mjs` | 343 | `e1994573` |
| `scripts/render-all.mjs` | 40 | `c12d3803` |
| `scripts/review.mjs` | 372 | `d062eda5` |
| `scripts/snapshot.mjs` | 108 | `2b592630` |
| `scripts/stage.mjs` | 91 | `b15a2c2e` |
| `scripts/storyboard.mjs` | 252 | `ec14ce02` |
| `scripts/validate-spec.mjs` | 208 | `354c7493` |
| `src/Root.tsx` | 22 | `7aef5bed` |
| `src/VideoBeat.tsx` | 27 | `7b46f435` |
| `src/Walkthrough.tsx` | 315 | `24ea0448` |
| `src/index.ts` | 8 | `960a8868` |
| `src/schema.ts` | 57 | `8e6e5f50` |

## Docs — 19 files

| file | lines | sha |
|---|---|---|
| `CLAUDE.md` | 224 | `c073a97a` |
| `README.md` | 55 | `aef53f84` |
| `docs/AUTHORING-GUIDE.md` | 417 | `0adc57e7` |
| `docs/modules/_TEMPLATE.md` | 75 | `f8db9ff1` |
| `docs/modules/architecture.md` | 67 | `6d2831f1` |
| `docs/modules/brd-assistant.md` | 84 | `5a2d1761` |
| `docs/modules/confluence.md` | 35 | `dc7926f5` |
| `docs/modules/deployment.md` | 48 | `84e1ea14` |
| `docs/modules/drift-alignment.md` | 47 | `d7c29ce2` |
| `docs/modules/home-knowledge-base.md` | 56 | `28fd36d8` |
| `docs/modules/jira.md` | 36 | `a01ca7a7` |
| `docs/modules/onboarding-access.md` | 55 | `769af152` |
| `docs/modules/pair-programming.md` | 117 | `834625e5` |
| `docs/modules/planning.md` | 100 | `95dc7538` |
| `docs/modules/project-workspace.md` | 33 | `cad0fbb2` |
| `docs/modules/testing.md` | 53 | `44bd1f15` |
| `docs/products/obsida.md` | 113 | `e18c86a6` |
| `docs/products/velox.md` | 145 | `db62cf2d` |
| `snapshot.md` | 334 | `10c1c6aa` |

## Specs

| spec | product | module | part | type | steps | variants | approved |
|---|---|---|---|---|---|---|---|
| `architecture-promo.spec.json` | velox | architecture | - | promo | 3 | 4 | yes |
| `architecture-tutorial.spec.json` | velox | architecture | - | tutorial | 17 | 1 | yes |
| `brd-chat-tutorial.spec.json` | velox | brd-chat | - | tutorial | 30 | 1 | yes |
| `brd-tutorial-v2.spec.json` | velox | brd-docs | - | tutorial | 28 | 5 | no |
| `pair-programming-enhance-tutorial.spec.json` | obsida | pair-programming | enhance | tutorial | 14 | 1 | yes |
| `pair-programming-promo.spec.json` | velox | pair-programming | - | promo | 2 | 4 | yes |
| `planning-promo.spec.json` | velox | planning | - | promo | 3 | 4 | yes |
| `planning-tutorial.spec.json` | velox | planning | - | tutorial | 12 | 1 | yes |
| `velox-pair-programming-enhance-tutorial.spec.json` | velox | pair-programming | enhance | tutorial | 26 | 1 | yes |

## Libraries

**architecture** — 26 frames · tabs: start 3, diagram 18, sad 5 · products: velox 26
**pair-programming** — 41 frames · tabs: setup 11, enhance 14, quality 7, security 9 · products: obsida 5, velox 6, shared 30

## Audio cache

203 cached clip(s)
