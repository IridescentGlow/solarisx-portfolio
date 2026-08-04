# Solarisx Portfolio

The personal portfolio of **Dagim Demissie** (Solarisx) — a visual storyteller and creative technologist. It is built as a single-page scroll narrative rather than a set of independent sections: the visitor moves from an opening frame into the work itself, then into the thinking behind it, the capabilities that produce it, and finally a way to start a conversation. Design, motion and structure follow the canonical documentation in [`docs/`](docs/), which governs the frame order, the token system and the motion language.

## Highlights

- **Evidence-first narrative** — frames run Hero → Works → About → Capabilities → Contact, so the work is experienced before it is explained.
- **Centralized design tokens** — colour, type scale, spacing, motion and elevation are defined once in a Tailwind v4 `@theme` block (`src/index.css`) and consumed everywhere.
- **Centralized motion system** — `src/lib/motion.js` registers the project's four easing curves through GSAP `CustomEase` and exports the shared duration scale, so pacing is tuned in one place.
- **Reduced-motion support** — a single global rule collapses time-based animation for visitors who prefer reduced motion.
- **Scroll-driven composition** — Lenis smooth scrolling with GSAP ScrollTrigger: pinned sections, sticky stacked capability cards, scrub-linked type, and staggered reveals.
- **Real-time 3D** — a React Three Fiber scene in the opening frame, with an asset-aware loading gate that holds the page until it is ready.
- **Interactive work index** — project rows with a cursor-tracking preview image on desktop and inline previews on mobile.
- **Custom typography** — the Amiamie family, self-hosted.
- **Responsive and accessible** — breakpoint-aware layout, labelled icon links, and semantic section structure.
- **Share metadata** — title, description, Open Graph and Twitter card tags.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | React 19 |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Animation | GSAP 3 with `@gsap/react` |
| Smooth scroll | Lenis |
| 3D | Three.js, React Three Fiber, Drei |
| Navigation | react-scroll |
| Responsive | react-responsive |
| Icons | Iconify |
| Linting | ESLint |

## Getting Started

```bash
npm install
npm run dev
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/   # Reusable pieces (animated header, text lines, marquee, 3D planet)
├── sections/     # The frames that make up the page
├── constants/    # Project, capability and social data
├── lib/          # Shared motion system
└── index.css     # Design tokens and global styles

docs/             # Canonical design and engineering documentation
public/           # Fonts, images, 3D model, favicon
```
