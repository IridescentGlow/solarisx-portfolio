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
      "A personal highlight reel built to show range and pacing across recent editing work - the piece I send when someone needs to see what I do, fast.",
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
    // Share metadata for /projects/signature-reel (src/lib/seo.js). Written
    // out rather than derived from `name`/`outcome`: those are page copy,
    // tuned for a reader already on the site, and are the wrong length and
    // register for a link preview. `image` is the existing 1920x1080 poster —
    // no artwork was created for this. A project without this key falls back
    // to the site defaults rather than shipping unfinished copy as a card.
    seo: {
      title: "Signature Reel - Dagim Demissie",
      description:
        "A personal highlight reel built to show range and pacing across recent editing work. Edit, color and sound, cut to the rhythm of the track.",
      image: "/assets/projects/reel-poster.jpg",
    },
    // Real case-study copy, sourced directly from the creator (no
    // docs/case-studies/SIGNATURE_REEL.md exists, unlike MediHelp's
    // sourced-from-doc convention). No `gallery` (no real stills exist
    // beyond the reel/clips already shown in the intro) and no `award`
    // (none exists) and no `credits` (solo project - would only repeat
    // craft.myRole) - all omitted rather than invented or padded.
    caseStudy: {
      challenge: {
        text: "This reel exists to answer one question fast: what I can actually do. It's not a client deliverable - it's a personal showcase, built to compress a body of work into a runtime that proves range and quality without asking anyone to sit through a full portfolio first.",
      },
      approach: {
        text: "I come from music production and sound design before editing, and that background shapes how I cut. Music sets the rhythm, the rhythm sets the pacing, and the pacing decides which shots get used and where they land - the edit follows the track, not the other way around.\nThe target was a reel that felt quick, visually immediate, smooth, and polished - something worth watching on its own, not just a demonstration of technique.",
        challenges:
          "The hardest part was restraint - getting the reel to feel premium without letting it get unnecessarily complex. Sophistication came from execution, not from adding more effects.",
      },
      craft: {
        development:
          "The work covered motion graphics, B-roll selection, sourcing and downloading clips and audio, color grading, and shaping the pacing, rhythm, and flow of the cut. Sound and timing were part of the edit from the start, not a finishing pass.",
        myRole:
          "Solo project, start to finish - handled independently.",
      },
      result: {
        text: "The reel became my go-to highlight for posts and job applications, and it directly helped bring in multiple clients and opportunities.",
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
      "A selected body of client and freelance editing work across long-form YouTube, short-form social, and brand content - built around one throughline: hook the viewer in the first seconds and hold them through the cut.",
    role: "Video Editor",
    year: "2024-2025",
    stack: ["Premiere Pro", "After Effects", "DaVinci Resolve", "CapCut"],
    liveHref: "https://ytjobs.co/talent/profile/273483",
    repoHref: "",
    // Work 01 (Senai English tutorial) as the card/hero preview - the
    // fullest, most representative local piece in the collection, and a
    // real asset rather than the template's leftover game-store.jpg.
    image: "/assets/projects/editor-portfolio/work-01.mp4",
    poster: "/assets/projects/editor-portfolio/work-01-poster.jpg",
    bgImage: "/assets/backgrounds/poster.jpg",
    featured: false,
    // This project's own Work 01 clip already opens the case study a second
    // time inside caseStudy.craft.gallery[0] — the generic hero-media block
    // ProjectPage.jsx renders for every non-cinematicIntro project (same
    // clip, same poster) is therefore a duplicate standalone video ahead of
    // the actual gallery, not a second piece of content. Same shared
    // hero-media block MediHelp still renders normally; this flag only
    // skips it here.
    hideHeroMedia: true,
    seo: {
      title: "Editor Portfolio - Dagim Demissie",
      description:
        "A selected body of client and freelance editing work across long-form YouTube, short-form social, and brand content - built around hooks, pacing, and retention.",
      image: "/assets/projects/editor-portfolio/work-01-poster.jpg",
    },
    // Real case-study copy. Unlike Signature Reel (one personal edit) or
    // MediHelp (one build), this project is a collection of six separate
    // client/freelance engagements - the narrative is about range and
    // adaptability across them, not one project's arc. No `credits` (each
    // piece was an independent engagement, not a team) and no `award`
    // (none exists) - both omitted rather than invented.
    caseStudy: {
      challenge: {
        text: "A single reel can prove one style. This body of work exists to prove something harder: that the editing itself adapts - to the subject, the audience, the platform, and the feeling a piece is supposed to leave behind - without turning into a disconnected pile of unrelated clips.",
      },
      approach: {
        text: "None of these pieces share a house style, because none of them share an audience. An educational video earns attention through clarity and pacing. A commercial has to persuade inside a few seconds without losing the lesson underneath it. Gaming content lives or dies on comedic timing and energy. Short-form has to hook before a thumb decides otherwise. A vlog asks for atmosphere and the patience to let a moment breathe. A beauty ad asks for polish and a shot that reads as product-quality on its own.\nThe style follows the content - never the other way around.",
        challenges:
          "The harder discipline is restraint - knowing when a cut, a caption, or a graphic earns its place, and when it would just be noise on top of a piece that's already working. Every project here made that call differently; the only rule that held across all of them was that the edit serves the content first, not a default style repeated regardless of what the piece actually needed.",
      },
      craft: {
        development:
          "The work spans opening a piece with a hook strong enough to earn the next few seconds, building pacing and rhythm around what a piece is actually saying, and pulling the sharpest moments out of hours of raw or long-form footage rather than using it in order. It covers B-roll selection, captions and subtitles, motion graphics, sound design and audio cleanup, color correction and grading, and shaping visual emphasis differently depending on where a piece is going to be watched - a long-form YouTube video and a vertical short are never cut with the same instincts.",
        myRole:
          "Independent video editor across every piece in this collection - responsible for turning raw or long-form source material into finished, platform-ready edits.",
        // Alternating editorial rows (ProjectPage.jsx's EditorWorkRow),
        // replacing the shared horizontal-strip renderer for this project
        // only - six standalone client/freelance pieces read better as
        // individual case-study moments than as strip cards. MediHelp's own
        // craft.gallery has no such key, so it keeps the strip unchanged.
        galleryLayout: "editorial",
        // Six real pieces. Work 01/02 are locally hosted (own footage,
        // clients whose work can be shown directly); Work 10/07/05/08 are
        // re-edits of other creators'/platforms' source footage or other
        // client work not rehosted here, so they link out to the original
        // upload instead - each carries a real extracted still (ffmpeg,
        // from the actual linked video, never a YouTube thumbnail URL) as
        // its poster rather than local video.
        gallery: [
          {
            src: "/assets/projects/editor-portfolio/work-01.mp4",
            poster: "/assets/projects/editor-portfolio/work-01-poster.jpg",
            alt: "Senai English long-form tutorial edit",
            caption:
              "Senai English - long-form educational edit built around clarity, pacing, and retention.",
          },
          {
            src: "/assets/projects/editor-portfolio/work-02.mp4",
            poster: "/assets/projects/editor-portfolio/work-02-poster.jpg",
            alt: "Senai English ad campaign edit",
            caption:
              "Senai English - campaign edit balancing education, persuasion, and a clear commercial message.",
            // ffprobe'd source dimensions: 720x1280, a genuine portrait
            // clip — EditorWorkRow gives portrait items their own framing
            // instead of cropping them into the landscape items' 16:9 box.
            orientation: "portrait",
          },
          {
            href: "https://youtu.be/-PMsvyKB_7g",
            poster: "/assets/projects/editor-portfolio/work-10-poster.jpg",
            alt: "CaseOh RLCraft highlight edit",
            caption:
              "CaseOh - a long-form RLCraft stream cut down into a fast, comedic highlight edit.",
          },
          {
            href: "https://youtube.com/shorts/vfWxt3AV6-c",
            poster: "/assets/projects/editor-portfolio/work-07-poster.jpg",
            alt: "IsaacELera short-form edit",
            caption:
              "IsaacELera - livestream footage adapted into a fast, hook-driven short.",
            // ffprobe'd source: 360x640 portrait (a YouTube Short).
            orientation: "portrait",
          },
          {
            href: "https://youtu.be/Y28NN1U7MNE",
            poster: "/assets/projects/editor-portfolio/work-05-poster.jpg",
            alt: "PewDiePie Japan vlog re-edit",
            caption:
              "A long-form Japan vlog re-cut for atmosphere, pacing, and restraint.",
          },
          {
            href: "https://youtube.com/shorts/usbcVlkC_-g",
            poster: "/assets/projects/editor-portfolio/work-08-poster.jpg",
            alt: "Lip filler advertisement edit",
            caption:
              "A beauty/advertising edit built for visual polish and a clear product message.",
            // ffprobe'd source: 360x640 portrait (a Short).
            orientation: "portrait",
          },
        ],
      },
      result: {
        text: "This body of work is what accompanies job applications on platforms like YT Jobs and Afriwork, and it's the collection clients and employers actually look at before a conversation starts. It exists to demonstrate range in a single sitting, and it has directly helped turn applications into real client work and opportunities.",
      },
    },
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
    // Share metadata for /projects/medihelp (src/lib/seo.js). Note the title
    // does not reuse `name` verbatim: `name` carries "Award winning Solution",
    // which the `outcome` comment above explicitly declines to substantiate.
    // A link preview is the last place to assert a claim the project data
    // itself refuses to make, so the title states the project, not a placing.
    seo: {
      title: "MediHelp - Dagim Demissie",
      description:
        "A hackathon-built healthcare assistant for medically underserved communities: AI symptom checking, first aid guidance and educational content.",
      image: "/assets/projects/medi-help-poster.jpg",
    },
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
