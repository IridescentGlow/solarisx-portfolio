# PROJECT_STATUS.md

Portable status snapshot for the Solarisx portfolio — meant to be handed to
any AI assistant (Claude Code or otherwise) as a fast on-ramp. Updated at
the end of each completed milestone. This is **implementation status**, not
design intent — the canonical design/engineering rules live in `docs/`
(start at `docs/START_HERE.md`); this file tracks what's actually built.

---

## 1. What this is

Solarisx portfolio — a personal portfolio site for a visual storyteller /
creative technologist (per `docs/vision/CORE_EXPERIENCE_STATEMENT.md`).
Single-page cinematic narrative on the homepage, with an expandable
`/projects/:slug` depth layer for individual case studies.

## 2. Stack (verified against package.json, not assumed)

React 19 + Vite 6, Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config.js`),
GSAP 3 + `@gsap/react` for all motion, React Three Fiber + Drei for the
Hero's 3D scene, `react-router-dom` v7 for `/projects/:slug`, Lenis for
smooth scroll, Iconify for icons.

## 3. Architecture

```
src/
  App.jsx                → Routes: "/" → HomePage, "/projects/:slug" → ProjectPage
  main.jsx                → BrowserRouter wrapper
  pages/
    HomePage.jsx           → the single-page narrative (former App.jsx body, unchanged)
    ProjectPage.jsx         → case-study depth layer (see §5)
  sections/                → Hero, Works, About, Services, Contact, + Navbar/summaries
  components/               → AnimatedHeaderSection, AnimatedTextLines, Marquee, Planet
  lib/
    motion.js               → EASE/DURATION/SCROLL_REVEAL_START tokens (single source for GSAP timing)
    media.js                 → isVideo() — shared between Works and ProjectPage
  constants/index.js        → all content: servicesData, projects, socials, socialIcons
  index.css                  → design tokens (@theme) + custom @utility blocks (click-burst, trophy-glow, gold-shimmer-text)
```

**Data-driven routing** (`docs/design/PROJECT_PAGE_SYSTEM.md` §3): each
project has `slug` and `caseStudy` (object or `null`). Works.jsx links
internally to `/projects/:slug` only when `caseStudy` is truthy; otherwise
it links externally via `liveHref`. No hardcoded id/slug checks — a future
project switches over automatically the moment its `caseStudy` is populated.

**Navigation is always a new tab**, internal or external
(`window.open(href, "_blank", "noopener,noreferrer")`) — per the doc's §2
new-tab rule, and because same-tab client-side routing was found to inherit
the homepage's scroll position (fixed in the milestone below).

## 4. Current project data state

| Slug | caseStudy | Status |
|---|---|---|
| `signature-reel` | `null` | Index-only, `[Placeholder]` content, links externally |
| `editor-portfolio` | `null` | Index-only, `[Placeholder]` content, links externally |
| `medihelp` | `{}` (truthy, empty) | **First live project page** — real base data, no case-study narrative sections written yet |

## 5. ProjectPage.jsx — what's built

Two required sections per `PROJECT_PAGE_SYSTEM.md` §4 (Overview + Media),
plus terminal Links. Challenge/Approach/Craft/Result/Credits are
**intentionally omitted** — no real content exists for them yet, and the
doc is explicit that missing sections are omitted, not padded with
placeholders.

- **Overview** — reuses `AnimatedHeaderSection` (title/subtitle/qualifier),
  a metadata row (role/year/stack, opposite the title on desktop per §8),
  and the outcome via `AnimatedTextLines`.
- **Media** — hero video with a real poster frame (extracted via ffmpeg
  from `medi-help.mp4` itself), framed rather than full-bleed since the
  clip's own background is light and would fight the dark theme unframed.
- **Links** — terminal position, Live/Code, per §4's fixed ordering.
- **Not yet resolved**: `PROJECT_PAGE_SYSTEM.md` §9's SEO/share-metadata
  problem — this is a Vite SPA, so per-route `<title>`/OG tags need
  pre-rendering, SSG, or SSR, none of which exist yet. Deliberately
  deferred, not forgotten.

## 6. Known content gaps (not code work — need real input)

- MediHelp's `role`/`year`/`stack`/`repoHref` still have literal `TODO:`
  values in some places — check `src/constants/index.js` directly.
- Two other projects are still `[Placeholder]` — no real reel/title-sequence
  content yet.
- No case-study narrative content (Challenge/Approach/Craft/Result/Credits)
  exists for any project.

---

## Changelog

## Milestone — MediHelp Project Page Implementation
*(this milestone)*

- Implemented the full MediHelp case study on `/projects/medihelp`,
  populating `caseStudy` in `src/constants/index.js` with real content
  sourced entirely from `docs/case-studies/MEDIHELP_CASE_STUDY.md`
  (Challenge ← §2, Approach ← §3+§4 with §7 Challenges nested inside,
  Craft ← §5+§6 plus the media gallery, Result ← §9 with §8 Award nested
  inside, Credits ← §5's team structure). Data lives in constants, not
  hardcoded JSX strings — `ProjectPage.jsx` renders generically from
  `project.caseStudy`, the same pattern `outcome`/`role`/`stack` already
  used.
- Two section-ordering judgment calls, made explicitly rather than
  silently: Award nests under Result (matching the case study's own
  "(see §8)" cross-reference from §9, since `PROJECT_PAGE_SYSTEM.md` §4
  doesn't define an 8th top-level section for it) and Challenges nests
  under Approach (no separate §4 slot exists for it either — obstacles
  navigated are part of "the thinking" Approach is defined to hold).
- Added a local, unexported `CaseStudySection` helper in `ProjectPage.jsx`
  for the five repeated heading+body blocks. Deliberately does *not*
  reuse `AnimatedHeaderSection` for each one — that component's
  banner-text-responsive display scale is this page's one big title,
  already used once for Overview; repeating it five more times down one
  page would compete with it rather than support it
  (`HIERARCHY_SYSTEM.md` §1). Uses `text-h2`/`text-h3` instead.
- Built the media gallery: 8 images (hero, AI Assistant, Features, Who
  We Are, Find a Doctor, Symptom Checker, Sign Up, Testimonials) in a
  uniform responsive grid — no lightbox/carousel/zoom, since nothing
  here passes `UX_ARCHITECTURE_BLUEPRINT.md` §6's three-purpose test for
  one. Award section gets the certificate + ceremony photo in a matching
  2-up grid.
- Quality issues in the source screenshots (unedited template placeholder
  copy in `features.webp`/`who-we-are.webp`, Windows-activation
  watermarks in two captures, `login.webp`'s content being the sign-up
  form rather than a login screen) are surfaced in code comments and
  handled by captioning tiles by actual content — not hidden, cropped,
  or edited out of the images themselves, per this milestone's explicit
  instruction.
- Added MediHelp's `favicon.svg` next to the "Live ↗" link — a small,
  functional use (confirms which product the link leads to), not
  decoration. `logo.png` stays unused and unconverted this milestone, as
  instructed.
- **Real bug caught during responsive verification, not left in**:
  the gallery and award grids initially used Tailwind's `sm:` breakpoint
  (640px) for their 2-column layout. Screenshotting a genuine tablet
  width (700px — between `sm` and this page's only other responsive
  split, `metadata`'s pre-existing `md:flex-row` at 768px) showed
  multi-column media next to still-single-column text: a state
  `PROJECT_PAGE_SYSTEM.md` §8 doesn't define and this page has no other
  precedent for. Changed both grids to `md:`, matching the page's
  existing breakpoint convention, and re-verified at 700px/mobile/desktop
  before proceeding — mobile and desktop screenshots are pixel-identical
  before and after the fix (page height unchanged at both), confirming
  no regression.
- Verified via actual rendered screenshots (headless Chromium), not just
  code review: desktop (1440px), the 700px tablet gap, and mobile
  (390px). One capture-only false alarm along the way — `AnimatedTextLines`
  paragraphs appeared blank in an initial full-page screenshot because
  Playwright's single-shot capture doesn't fire the real scroll events
  `ScrollTrigger` needs; simulating actual incremental scroll resolved it
  and confirmed the content renders correctly for a real visitor.
- `npm run build` and `npm run lint` both pass clean.
- Nothing outside `src/constants/index.js` and `src/pages/ProjectPage.jsx`
  was touched — no other project, component, or route affected.

### Milestone — MediHelp Media Preparation & Case Study Completion

- Renamed `public/assets/projects/medihelp-project/` to `medihelp/`, matching
  the `medihelp` route slug used in `src/constants/index.js`. Pure filesystem
  rename — the folder wasn't wired into React yet, so nothing broke.
- Converted 10 raster assets to WebP (originals kept, nothing deleted):
  `hero/hero.png`, all 7 `screenshots/*.png`, `award/certificate.jpg`, and
  `award/award-ceremony.HEIC` (via ImageMagick's HEIC delegate, with the
  embedded 180° EXIF rotation corrected during conversion — verified
  visually, not just by dimensions). Combined originals 7.4MB → WebP 1.7MB
  (~77% smaller) at quality 85.
- Attempted logo vectorization per instruction. No trace tool (`potrace`,
  `autotrace`, `vtracer`) is installed in this environment, and
  `branding/logo.png`'s ribbon shapes use a smooth multi-stop gradient on
  curved paths — the category automated bitmap tracers handle worst.
  Documented the reasoning in the case study rather than faking an SVG by
  embedding the bitmap; `logo.png` stays a PNG.
- Discovered `branding/favicon.svg` is a genuinely separate hand-authored
  vector mark (real paths, not an embedded bitmap) — visually distinct from
  `logo.png`, not a vector version of it. Corrected an implicit assumption
  from the previous milestone that they were the same mark.
- Rewrote `MEDIHELP_CASE_STUDY.md` §10 (Media) as a complete asset
  inventory — every file's dimensions, size before/after conversion, what
  it depicts, and used-now vs. reserved-for-future status. Flagged
  everything genuinely notable rather than smoothing it over: unedited
  template placeholder copy in two screenshots (`features.webp`,
  `who-we-are.webp`), a `login.webp` filename that doesn't match its
  content (it's the sign-up form), Windows-activation watermarks in two
  captures, and a footer copyright year (2023) that doesn't match the
  certificate's 2025 hackathon date. `mobile/` and `graphics/` stay
  documented as genuinely empty — not fabricated to look complete.
  Certificate text (exact hackathon name, "15,000" cash amount as written
  — no currency symbol printed on the certificate, none invented here —
  07/05/2025 date, full sponsor list) gives §8's award claim primary-source
  backing
  that wasn't recorded anywhere in the document before. Version bumped
  1.1 → 1.2.
- Validated the full asset inventory against the filesystem: every path
  named in the case study exists, every file in `medihelp/` is accounted
  for in the case study, and no stale references to the old
  `medihelp-project/` folder name remain (its two remaining mentions are
  intentional history/rename-explanation text).
- No React components, CSS, routing, animations, or `ProjectPage.jsx`
  touched — this milestone is content and assets only, same restraint as
  every prior MediHelp documentation pass.

### Milestone — Documentation & Obsidian Integration

- Established `docs/` as a self-contained Obsidian vault: created
  `docs/MOC_SOLARISX.md` (main navigation page, wikilinked by section —
  Vision/Design System/Engineering/Project Architecture/Case Studies),
  two `.canvas` mind-map files (`SOLARISX_ARCHITECTURE.canvas` and
  `Solarisx_Project_Map.canvas` — different groupings, both current,
  neither supersedes the other), and `docs/.gitignore` (`.obsidian/`,
  later extended with `.smart-env` for the Smart Connections plugin).
- Added YAML frontmatter (`title`/`type`/`status`/`related`) and a
  "Related Documents" section to all 17 canonical + case-study documents.
  Every cross-reference was grepped out of the documents' own prose first
  (headers like "Governed by X.md", explicit `§`-citations) rather than
  invented; the handful of links added on request without a textual
  citation are called out inline in the affected files themselves
  (`PROJECT_PAGE_SYSTEM.md`, `MEDIHELP_CASE_STUDY.md`, `TECH_STACK.md`).
  Zero content changed — additions only, verified via `git diff --numstat`
  showing 0 deletions across every touched file.
- Resolved the `PROJECT_CONTEXT.md` naming collision: renamed this file
  (root, implementation-status snapshot) from `PROJECT_CONTEXT.md` to
  `PROJECT_STATUS.md`. `docs/vision/PROJECT_CONTEXT.md` (canonical vision
  document, unrelated purpose) is untouched — confirmed via full-repo
  grep that no other file referenced the root document by its old name
  before renaming.
- Re-verified vault integrity end-to-end: both canvas files parse as
  valid JSON, every file-node path resolves, no duplicate node IDs, no
  broken edges, and all 19 wikilink targets across the vault resolve to
  exactly one file each.
- **Known still-open items** (not fixed this milestone — out of scope or
  not yet requested): `docs/` is tracked as a git submodule gitlink but
  has no `.gitmodules` entry, so `git submodule update --init` doesn't
  work on a fresh clone; `docs/case-studies/MEDIHELP_CASE_STUDY.md` is
  still uncommitted in the `Claude-Manual` remote; new MediHelp media
  assets appeared under `public/assets/projects/medihelp-project/`
  (screenshots, award certificate, branding, hero video) — not reviewed
  or wired into anything this milestone.
- No UI implementation performed — `ProjectPage.jsx`, `constants/index.js`,
  components, styling, animations, and routing are all untouched.

### Milestone — MediHelp Case Study Content Filled In

- Updated `docs/case-studies/MEDIHELP_CASE_STUDY.md` (v1.0 → v1.1) with new
  verified information covering the problem statement, research/discovery,
  design process, development (frontend contributions, team structure,
  workflow, technical involvement), challenges, and final outcome.
- Resolved 5 of the 7 previously open `NEEDS USER INPUT` gaps: §2 Problem,
  §3 Research, §4 Design Process, §7 Challenges, §9 Final Outcome.
- Remaining gaps: §5 architecture detail beyond the confirmed tech list
  and confirmed areas of involvement (AI integration, authentication, API
  communication), and §10 website screenshots/graphics assets/hackathon
  materials.
- No unsupported statistics or invented metrics were added — the "70%+"
  figure was explicitly excluded per instruction.
- No UI implementation performed — `ProjectPage.jsx`, `constants/index.js`,
  components, styling, animations, and routing are all untouched.

### Milestone — MediHelp Case Study Documentation

- Created `docs/case-studies/MEDIHELP_CASE_STUDY.md`.
- Added verified project information: hackathon origin, first-place award
  (certificates + cash prize + best-solution title), and the creator's full
  role (front-end team member who built the Home and Blog pages; head of
  video editing; independent graphics and video/asset creation).
- No UI implementation performed — `ProjectPage.jsx`, `constants/index.js`,
  components, styling, animations, and routing are all untouched.
- Implementation waits for content approval. Several sections are
  explicitly marked `NEEDS USER INPUT` (problem statement, research,
  design-process reasoning, architecture detail, challenges, screenshots/
  graphics/hackathon-material assets) rather than filled with invented
  content.

### Milestone — Project Page Overview+Media build, navigation fix, animation gap fix

- Built the real visual design for `ProjectPage.jsx` (previously plain
  placeholder markup): Overview + Media sections per §4, framed hero video
  with a generated poster frame, metadata layout per §8's responsive rule.
- Extracted `isVideo()` into `src/lib/media.js`, shared by Works.jsx and
  ProjectPage.jsx (the second-consumer threshold `PROJECT_PAGE_SYSTEM.md`
  §5 names for when to extract).
- Fixed MediHelp's `outcome` field: it contained a literal `TODO:` sentence.
  Replaced with content sourced from the project's own GitHub README
  (`ellay21/Medihelp-Frontend`) — verified, not invented. The README
  documents no award/placement/result, so nothing about "what came of it"
  was added; the gap stays real rather than fabricated.
- Added a `gold-shimmer-text` treatment for the "Award Winning Solution"
  qualifier line — a one-time (not looping) gold gradient sweep, reusing
  only existing tokens (`--color-accent`, `--color-accent-dim`,
  `--color-text-primary`) and the existing `EASE.cinematic` curve. Exposed
  via a new optional `textClassName` prop on `AnimatedHeaderSection`
  (defaults to empty — every other caller unaffected).
- **Bug fix**: the internal-link click path used React Router's
  `navigate()` (same-tab) instead of `window.open()` (new tab), violating
  §2's new-tab rule. This also caused the reported "opens halfway down the
  page" symptom — React Router doesn't reset scroll position on a same-tab
  route change, so the project page inherited whatever scroll position
  Works was at on the homepage. Fixed by routing both internal and
  external clicks through the same `window.open()` call; a fresh tab
  starts scrolled to top by construction.
- **Bug fix**: everything below the header (metadata row, media block) had
  no reveal animation at all — it just appeared instantly while the header
  animated in. Added a `useGSAP` reveal reusing `EASE.cinematic`/
  `DURATION.reveal`, and swapped the outcome's bare `<p>` for
  `AnimatedTextLines` per §5's own component table.

### Milestone — Click burst interaction (Works.jsx)

Radial light-burst click feedback on every Works row (internal or
external). Root-caused and fixed a real invisibility bug (React Router's
synchronous route swap was unmounting the burst before first paint);
brightness/timing tuned twice based on visual review. Settled values: 24px
base circle, white-to-gold radial gradient (`color-mix()` off
`--color-accent`), 3-phase GSAP timeline (flash → expand → fade), 0.8s
total, `EASE.precise`/`EASE.cinematic`.

### Milestone — Project Page infrastructure

Added `react-router-dom`. `App.jsx` became a route switch; the former
single-page body moved unchanged into `pages/HomePage.jsx`. New
`pages/ProjectPage.jsx` (route resolution, slug lookup, not-found
fallback). Added `slug`/`caseStudy` fields to all projects (additive,
`docs/design/PROJECT_PAGE_SYSTEM.md` §3).

### Milestone — MediHelp video fix + trophy award treatment

`medi-help.mp4` was a corrupted 48-byte stub (interrupted ffmpeg
conversion, no `moov` atom) — re-encoded from the valid `mediHelp.mp4`
source. Added a hover-revealed trophy + "1st" badge on MediHelp's Works
row, escaping slightly above the row for a "breaking the frame" effect.

### Milestone — Scroll-reveal timing fix

Non-scrubbed reveals (section headers, About's image, Services cards,
Contact's social links) were triggering at the default "top bottom" —
meaning the reveal only started once the element was already at the
viewport edge, reading as a late pop-in. Added `SCROLL_REVEAL_START`
(`"top 120%"`) in `lib/motion.js`, applied consistently.

### Earlier milestones (see `git log` for full detail)

Identity cleanup (removed all template-author content), Capability Map
rewrite, motion timing system (`lib/motion.js` EASE/DURATION tokens,
tuned iteratively for a slower cinematic pace), social links (real URLs,
icon rendering, external-tab behavior), portfolio metadata/SEO foundation,
README rewrite, favicon (real asset, replacing an accidental overwrite
traced to a copy of `Star-Iridescent.svg`).
