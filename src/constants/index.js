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

// Proof of Craft — evidence-first engineering projects.
// PLACEHOLDER CONTENT (not real shipped work): drafted around the creator's
// stated background — Linux, cybersecurity, networking, full-stack, systems.
// Every name is prefixed "[Placeholder]" and every outcome says so. Replace
// with real projects (3–6 strongest) before launch. Exactly one `featured: true`
// (the lead row). `stack` is a plain string array. `image`/`bgImage` reuse
// template assets as visual placeholders — replace with real screenshots.
export const projects = [
  {
    id: 1,
    name: "[Placeholder] Real-time network telemetry platform",
    outcome:
      "Placeholder — streams and visualizes live traffic/host metrics from Linux sensors. Replace with a real project and a concrete result (a latency, throughput, or scale number).",
    role: "Full-stack · Systems",
    year: "TODO",
    stack: ["React", "Go", "WebSocket", "PostgreSQL", "Linux"],
    liveHref: "",
    repoHref: "",
    image: "/assets/projects/apple-tech-store.jpg",
    bgImage: "/assets/backgrounds/map.jpg",
    featured: true,
  },
  {
    id: 2,
    name: "[Placeholder] Container vulnerability-scanning pipeline",
    outcome:
      "Placeholder — CI pipeline that scans images for CVEs and blocks vulnerable builds before deploy. Replace with real scope and impact.",
    role: "Backend · Security",
    year: "TODO",
    stack: ["Python", "Docker", "GitHub Actions", "Trivy"],
    liveHref: "",
    repoHref: "",
    image: "/assets/projects/electronics-store.jpg",
    bgImage: "/assets/backgrounds/poster.jpg",
    featured: false,
  },
  {
    id: 3,
    name: "[Placeholder] Self-hosted Linux homelab & VPN mesh",
    outcome:
      "Placeholder — provisioned and hardened a multi-service Linux environment behind a self-hosted VPN. Replace with real architecture and outcomes.",
    role: "Infrastructure · Networking",
    year: "TODO",
    stack: ["Linux", "WireGuard", "Nginx", "Ansible"],
    liveHref: "",
    repoHref: "",
    image: "/assets/projects/game-store.jpg",
    bgImage: "/assets/backgrounds/curtains.jpg",
    featured: false,
  },
];

export const socials = [
  { name: "Instagram", href: "https://www.instagram.com/ali.sanatidev/reels/" },
  {
    name: "Youtube",
    href: "https://www.youtube.com/channel/UCZhtUWTtk3bGJiMPN9T4HWA",
  },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/ali-sanati/" },
  { name: "GitHub", href: "https://github.com/Ali-Sanati" },
];
