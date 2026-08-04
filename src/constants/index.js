// index.js
export const servicesData = [
  {
    title: "FullStack Development",
    description:
      "Your business deserves a fast, secure, and future-proof digital foundation. I develop custom web apps with clean architecture, optimized databases, and seamless integrations—ensuring reliability at every layer.",
    items: [
      {
        title: "Backend Engineering",
        description: "(REST/GraphQL APIs, Microservices, Auth Systems)",
      },
      {
        title: "Frontend Excellence",
        description: "(React, Vue, TypeScript, Interactive UI/UX)",
      },
      {
        title: "Database Design",
        description: "(SQL/NoSQL Optimization, Scalable Structures)",
      },
    ],
  },
  {
    title: "DevOps & Cloud Solutions",
    description:
      "Deploying software shouldn't be a gamble. I automate infrastructure, enforce security, and leverage cloud platforms (AWS/Azure) to keep your app running smoothly—24/7, at any scale.",
    items: [
      {
        title: "CI/CD Pipelines",
        description: "(GitHub Actions, Docker, Kubernetes)",
      },
      {
        title: "Server Management ",
        description: "(Linux, Nginx, Load Balancing)",
      },
      {
        title: "Performance Tuning",
        description: "(Caching, Compression, Lighthouse 90+ Scores)",
      },
    ],
  },
  {
    title: "Security & Optimization",
    description:
      "Slow or hacked apps destroy trust. I harden security (XSS/SQLI protection, OAuth) and optimize bottlenecks so your app stays fast, safe, and scalable as you grow.",
    items: [
      {
        title: "Code Audits",
        description: "(Refactoring, Tech Debt Cleanup)",
      },
      {
        title: "Pen Testing",
        description: "(Vulnerability Assessments)",
      },
      {
        title: "SEO Tech Stack",
        description: "(SSR, Metadata, Structured Data)",
      },
    ],
  },
  {
    title: "Web & Mobile Apps",
    description:
      "A clunky interface can sink even the best ideas. I craft responsive, pixel perfect web and mobile apps (React Native/Flutter) that users love—bridging design and functionality seamlessly.",
    items: [
      {
        title: "Cross-Platform Apps",
        description: "(Single codebase for iOS/Android/Web)",
      },
      {
        title: "PWAs",
        description: "(Offline mode, Push Notifications)",
      },
      {
        title: "E-Commerce",
        description: "(Checkout flows, Payment Gateways, Inventory APIs)",
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
