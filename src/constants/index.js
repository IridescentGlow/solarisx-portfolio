// index.js
// Capability Map — 4 outcome-oriented areas, final names per
// UX_ARCHITECTURE_BLUEPRINT §3. Order is meaningful: Visual Storytelling leads
// (primary discipline); Systems & Technical Exploration sits last as supporting
// technical depth, not a co-equal identity. `items[].description` is the tools
// line — supporting detail only, never a rated skill list.
export const servicesData = [
  {
    title: "Visual Storytelling",
    description:
      "Attention is earned frame by frame. Seven years of editing taught me that a cut is an argument — what to keep, what to lose, and exactly when a moment should land.",
    items: [
      {
        title: "Narrative Editing",
        description: "Story structure, pacing, rhythm",
      },
      {
        title: "Color & Finishing",
        description: "DaVinci Resolve, grade, look development",
      },
      {
        title: "Timing & Sound",
        description: "Premiere Pro, beat-matched cuts",
      },
    ],
  },
  {
    title: "Motion Design & Visual Effects",
    description:
      "Motion is a language, not decoration. I use it to direct the eye, carry meaning between beats, and make a piece feel deliberate rather than assembled.",
    items: [
      {
        title: "Motion Graphics",
        description: "After Effects, kinetic typography",
      },
      {
        title: "Compositing & VFX",
        description: "After Effects — keying, tracking, cleanup",
      },
      {
        title: "Design & Key Art",
        description: "Photoshop, thumbnails, title cards",
      },
    ],
  },
  {
    title: "Creative Technology",
    description:
      "The web is another timeline. I build interfaces the way I cut a sequence — pacing, composition and motion first, with the engineering in service of the feeling.",
    items: [
      {
        title: "Interactive Interfaces",
        description: "React, Vite, Tailwind",
      },
      {
        title: "Motion on the Web",
        description: "GSAP, ScrollTrigger, scroll-driven sequences",
      },
      {
        title: "Real-Time 3D",
        description: "Three.js, React Three Fiber",
      },
    ],
  },
  {
    title: "Systems & Technical Exploration",
    description:
      "The layer underneath the work. I'm actively deepening Linux, networking and security — not as a separate track, but because understanding the machine makes everything built on top of it better.",
    items: [
      {
        title: "Linux & Self-Hosting",
        description: "Daily driver, services, tooling",
      },
      {
        title: "Networking",
        description: "Protocols, routing, VPN",
      },
      {
        title: "Security Fundamentals",
        description: "Hardening, threat basics",
      },
    ],
  },
];

// Proof of Craft — evidence-first project index.
// Ordering mirrors the governing identity in UX_ARCHITECTURE_BLUEPRINT §3 — a
// visual storyteller / creative technologist, not an engineer who also edits —
// so the reel leads (per §3's "featured reel = highest visual priority").
// Entries 1–2 are PLACEHOLDERS (not real work), marked "[Placeholder]".
// Entry 3 (MediHelp) is real but incomplete; its TODO fields need filling.
// Exactly one
// `featured: true` (the lead row). `stack` is a plain string array.
// `image`/`bgImage` reuse template assets as visual placeholders — replace with
// real stills/frames.
//
// `slug` and `caseStudy` (PROJECT_PAGE_SYSTEM.md §3) — additive, depth-layer
// fields. `slug` is the /projects/:slug permalink segment; treat it as stable
// once shared. `caseStudy: null` means index-only: Works.jsx keeps linking
// out via liveHref/repoHref rather than to an internal project page (§3's
// rule) — this is what makes the routing decision data-driven rather than a
// hardcoded id/slug check in the component.
// MediHelp (id 3) is the first project with its internal page live, so its
// caseStudy is `{}` — truthy, so its row now routes to /projects/medihelp —
// but still empty: no section content has been written yet (ProjectPage.jsx
// shows "not yet published" for any caseStudy without real section data).
export const projects = [
  {
    id: 1,
    slug: "signature-reel",
    name: "Signature Reel - Portfolio Highlights Showcase",
    outcome:
      "Placeholder — the cut that shows range: pacing, rhythm and tone across recent work. Replace with the real reel and a concrete signal (client, audience, or reach).",
    role: "Edit · Color · Sound",
    year: "2025",
    stack: ["Premiere Pro", "After Effects", "DaVinci Resolve"],
    liveHref: "https://ytjobs.co/talent/profile/273483",
    repoHref: "",
    image: "/assets/projects/reel.mp4",
    bgImage: "/assets/backgrounds/map.jpg",
    featured: true,
    caseStudy: null,
  },
  {
    id: 2,
    slug: "editor-portfolio",
    name: "Editor Portfolio - Selected Works",
    outcome:
      "kinetic typography and compositing built to carry a story beat rather than decorate it. Replace with the real piece and what it was made for.",
    role: "Motion Design · VFX",
    year: "Present",
    stack: ["After Effects", "Photoshop"],
    liveHref: "https://ytjobs.co/talent/profile/273483",
    repoHref: "",
    image: "/assets/projects/game-store.jpg",
    bgImage: "/assets/backgrounds/poster.jpg",
    featured: false,
    caseStudy: null,
  },
  {
    id: 3,
    slug: "medihelp",
    name: "MediHelp - Award winning Solution",
    outcome:
      "Hackathon project built with a team of full-stack developers, aimed at communities that are medically underserved. TODO: the specific problem it solved and what came of it.",
    role: "Front-End Developer and Motion Designer",
    year: "2024",
    stack: [
      "Backend: Django 5.2, DRF 3.16, PostgreSQL, JWT",
      "Frontend: ReactJS, TailwindCSS, Sentry, Web Vitals",
      "AI: Google Gemini API",
      "Docs: OpenAPI 3 via drf-spectacular"
    ],
    liveHref: "https://medihelp-frontend.vercel.app/",
    repoHref: "https://github.com/ellay21/Medihelp-Frontend", // TODO: GitHub repo
    image: "/assets/projects/medi-help.mp4",
    bgImage: "/assets/backgrounds/curtains.jpg",
    featured: false,
    caseStudy: {},
  },
];

export const socials = [
  { name: "Instagram", href: "https://www.instagram.com/phazotron_" },
  { name: "Beacons", href: "https://beacons.ai/phazotron" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/edible-dank" },
  { name: "GitHub", href: "https://github.com/IridescentGlow" },
];

// Platform name -> Iconify id. Shared by Contact and Navbar so the mapping lives
// in one place. Beacons has no brand icon in Iconify (verified), so it uses a
// generic link glyph — it is a link-in-bio service.
export const socialIcons = {
  Instagram: "mdi:instagram",
  Beacons: "mdi:link-variant",
  LinkedIn: "mdi:linkedin",
  GitHub: "mdi:github",
};
