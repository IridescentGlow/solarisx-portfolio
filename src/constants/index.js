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
// MediHelp (id 3) is the first project with its internal page live, and the
// first with real caseStudy section content (Challenge/Approach/Craft/
// Result/Credits, sourced from docs/case-studies/MEDIHELP_CASE_STUDY.md).
// ProjectPage.jsx still shows "not yet published" for any future caseStudy
// left `{}` (truthy but no real section data) — the row still routes
// internally the moment caseStudy is populated at all (§3's rule), it just
// reads as a stub page until section keys exist.
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
    // ffmpeg-extracted frame from reel.mp4 itself (same technique used for
    // MediHelp's poster) — MainReel.jsx's <video> above the fold needs one
    // per PROJECT_PAGE_SYSTEM.md §6.
    poster: "/assets/projects/reel-poster.jpg",
    bgImage: "/assets/backgrounds/map.jpg",
    featured: true,
    // Structural placeholder content — NOT real case-study copy. Every
    // `text` value below is explicitly bracketed "[PLACEHOLDER — ...]" so
    // it cannot be mistaken for a real claim if it ever renders; each one
    // states exactly what real input is still needed. This exists to
    // build and verify the chapter-stack layout/motion (PROJECT_STATUS.md
    // §21) against real content-shaped text, not to ship as final copy.
    // Sourced from nothing (no docs/case-studies/SIGNATURE_REEL.md exists,
    // unlike MediHelp's sourced-from-doc convention) — see PROJECT_STATUS.md
    // for the exact list of what's missing. No `gallery` (no real stills
    // exist beyond the reel/clips already shown in the intro) and no
    // `award` (none exists) — both omitted rather than invented.
    caseStudy: {
      challenge: {
        text: "[PLACEHOLDER — CHALLENGE] What was this reel actually made for — a portfolio submission, a specific ask, a personal showcase? What problem was it solving: proving range across styles, condensing a body of work into a tight runtime, something else? Replace with the real brief/goal.",
      },
      approach: {
        text: "[PLACEHOLDER — APPROACH] How were the specific clips chosen for this cut? What pacing, rhythm, music, or tone decisions shaped the edit? Replace with the real process.",
        challenges:
          "[PLACEHOLDER — WHERE IT GOT HARD] What was the hardest part of assembling this cut — pacing across very different source styles, sourcing usable footage, something else? Replace with a real, specific obstacle.",
      },
      craft: {
        development:
          "[PLACEHOLDER — CRAFT] What did the actual edit/grade/sound workflow look like beyond the tool list above (Premiere Pro, After Effects, DaVinci Resolve)? Any specific technique worth naming? Replace with real production detail.",
        myRole:
          "[PLACEHOLDER — MY ROLE] Solo edit, or does it include collaborators (colorist, sound designer, etc.)? Replace with the real role breakdown.",
      },
      result: {
        text: "[PLACEHOLDER — RESULT] Where is this reel actually used, and what came of it — job outreach, a platform, a concrete reach number? No real outcome exists in this repo yet; replace with a real, verifiable result rather than an invented metric.",
      },
      credits: {
        text: "[PLACEHOLDER — CREDITS] Solo work, or made with collaborators who should be named? Replace with accurate credit information.",
      },
    },
    // Opts this project into ReelIntro (src/components/reel/) in place of
    // ProjectPage.jsx's default Overview header + Media block. Data-driven
    // per the file's own established convention (caseStudy truthiness,
    // isVideo() extension check) rather than a hardcoded slug check, so a
    // future project could opt into the same treatment by setting this.
    cinematicIntro: true,
    // Opts this project into BentoSection (src/components/beu/) — the BeU
    // Delivery scroll-driven bento assembly — rendered between ReelIntro and
    // the shared Challenge/Approach/Craft chapter stack. Its own flag,
    // separate from cinematicIntro, for the same reason that one is
    // data-driven rather than a hardcoded slug check: a future project could
    // opt in independently of whether it also uses the cinematic reel intro.
    beuBento: true,
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
    // Second sentence sourced verbatim-in-substance from the project's own
    // GitHub README (ellay21/Medihelp-Frontend), which describes what it
    // does but documents no hackathon placement, award, or metric — so
    // nothing about "what came of it" is asserted here.
    outcome:
      "Hackathon project built with a team of full-stack developers, aimed at communities that are medically underserved. A full-stack healthcare assistant combining AI-powered symptom checking, first aid guidance, and educational content.",
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
    // Poster for the ProjectPage hero video (PROJECT_PAGE_SYSTEM.md §6 —
    // required above the fold). Only added here: Signature Reel/Editor
    // Portfolio have no case-study page yet, so nothing consumes one for them.
    poster: "/assets/projects/medi-help-poster.jpg",
    featured: false,
    // Depth content (PROJECT_PAGE_SYSTEM.md §3/§4), sourced entirely from
    // docs/case-studies/MEDIHELP_CASE_STUDY.md — that document, not this
    // object, is the source of truth; nothing below adds a fact the case
    // study doesn't already state. Each key is one of §4's fixed-order
    // sections; a section is omitted (not padded) if the case study marks
    // it NEEDS USER INPUT, per §1's restraint principle.
    caseStudy: {
      // §2 The Problem
      challenge: {
        text: "Many communities in Ethiopia face difficulty accessing timely healthcare guidance.\nMediHelp was built during a full-stack engineering hackathon to close that gap — AI-powered symptom checking, first aid guidance, and educational content, built for people in Ethiopia with limited access to healthcare services, or anyone needing quick health-related guidance.",
      },
      // §3 Research/Discovery + §4 Design Process. §7 Challenges nests here
      // (not its own §4 slot — PROJECT_PAGE_SYSTEM.md's table has none for
      // it) since navigating obstacles is part of "the thinking" Approach
      // is defined to hold.
      approach: {
        text: "Discovery was informal and time-boxed to a two-day hackathon window — no formal user surveys or interviews, just direct research into the healthcare problem space and conversations with hackathon mentors.\nThe design goal was a simple, accessible experience: clarity and ease of use for people who might be unfamiliar with a digital health tool, deliberately avoiding unnecessary interface complexity.\nThere was no formal wireframing or Figma process — design decisions were made directly during the fast, hackathon-paced build.",
        challenges:
          "The core technical challenges were integrating AI into the product and implementing authentication, both within a strict hackathon deadline.\nThe creative challenge was communicating the importance of healthcare accessibility in a way that felt approachable rather than clinical.",
      },
      // §5 Development + §6 My Role, plus the gallery — the visual
      // centrepiece (§1). Screenshot order/captions match the requested
      // gallery list exactly. Quality caveats (template placeholder text,
      // capture watermarks, the login.webp/Sign-Up filename mismatch) are
      // flagged in ProjectPage.jsx where the gallery renders, not hidden or
      // edited out of the images themselves.
      craft: {
        development:
          "Built by a team of ten — five front-end developers and five back-end developers — collaborating in person and coordinating over Telegram.\nThe frontend shipped the hero section (including the hero video experience), additional site sections, site-wide animations, a contact section, blog listings, and a team section.\nTechnical involvement extended to AI integration, authentication, and API communication, built on Django 5.2, Django REST Framework, PostgreSQL, and JWT on the backend; React, Tailwind CSS, Sentry, and Web Vitals on the frontend; and the Google Gemini API for AI.",
        myRole:
          "Front-end developer and motion designer. Personally built the hero section (hero video experience), the contact section, blog listings, and the team section, and contributed animations across the site.\nAlso head of video editing, and created the project's graphics design, videos, and visual assets independently.",
        gallery: [
          {
            src: "/assets/projects/medihelp/hero/hero.webp",
            alt: "MediHelp+ marketing site hero section",
            caption: "Hero",
          },
          {
            src: "/assets/projects/medihelp/screenshots/ai.webp",
            alt: "MediHelp+ General Assistant AI conversation feature",
            caption: "AI Assistant",
          },
          {
            src: "/assets/projects/medihelp/screenshots/features.webp",
            alt: "MediHelp+ features section",
            caption: "Features",
          },
          {
            src: "/assets/projects/medihelp/screenshots/who-we-are.webp",
            alt: "MediHelp+ Who We Are section",
            caption: "Who We Are",
          },
          {
            src: "/assets/projects/medihelp/screenshots/find-doctor.webp",
            alt: "MediHelp+ Find a Doctor teleconsultation page",
            caption: "Find a Doctor",
          },
          {
            src: "/assets/projects/medihelp/screenshots/symptom-checker.webp",
            alt: "MediHelp+ Symptom Checker feature",
            caption: "Symptom Checker",
          },
          {
            src: "/assets/projects/medihelp/screenshots/login.webp",
            alt: "MediHelp+ sign-up form",
            caption: "Sign Up",
          },
          {
            src: "/assets/projects/medihelp/screenshots/what-users-say.webp",
            alt: "MediHelp+ testimonials section",
            caption: "Testimonials",
          },
        ],
      },
      // §9 Final Outcome + §8 Award (nested here per §9's own "(see §8)"
      // cross-reference, rather than inventing an 8th top-level section
      // PROJECT_PAGE_SYSTEM.md §4 doesn't define). Hackathon name/date on
      // the certificate corroborate §8's claim — read directly off the
      // certificate image itself during the media milestone, not invented.
      result: {
        text: "MediHelp shipped as a complete, working full-stack healthcare platform — an AI-powered assistant combining symptom checking, first aid guidance, and educational content.\nUsage figures, adoption numbers, or any real-world impact metric beyond the hackathon result itself aren't available; nothing is invented to fill that gap.",
        award: {
          text: "First place at AASTU Tech Fest 2025 Hackathon — certificates awarded, a cash prize received, and named the hackathon's best solution.",
          certificate: "/assets/projects/medihelp/award/certificate.webp",
          ceremony: "/assets/projects/medihelp/award/award-ceremony.webp",
        },
      },
      // §5's team structure. Individual teammates beyond the creator's own
      // role are never named in the case study — not invented here either.
      credits: {
        text: "MediHelp was built by a ten-person team: five front-end developers and five back-end developers, collaborating in person and coordinating over Telegram.\nIndividual teammates beyond the creator's own role aren't named in the verified source material.",
      },
      // MediHelp's own brand favicon (distinct from logo.png — see the case
      // study's Media section). Used once, next to the Live link in Links.
      favicon: "/assets/projects/medihelp/branding/favicon.svg",
    },
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
