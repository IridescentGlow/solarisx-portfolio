// seo.js
// Single source of truth for per-route share metadata.
//
// This is a client-rendered Vite SPA, so metadata has to satisfy two
// consumers that never overlap:
//
//   1. Social crawlers / search bots, which fetch the HTML and do NOT run
//      the bundle. They only ever see whatever bytes the server returns,
//      so the tags must be injected into the emitted HTML at build time
//      (scripts/prerender-meta.mjs).
//   2. Humans navigating client-side (Works.jsx uses navigate()/<Link>),
//      for whom the document is never re-fetched. They need the head
//      updated at runtime (useDocumentMeta.js).
//
// Both consumers read this module, so the copy exists once. The per-route
// copy itself lives on the `seo` key of each project in constants/index.js
// rather than in a parallel table here — same object, same omit-don't-pad
// convention as `gallery`/`award`/`credits`.
//
// This file is imported by a plain Node script as well as by the app, so
// it must stay dependency-free and use fully-specified import paths.
import { projects } from "../constants/index.js";

// No deployment origin exists yet (confirmed with the site owner). Set this
// to the deployed origin — e.g. "https://example.com", no trailing slash —
// and canonical + og:url + absolute og:image URLs all start being emitted.
// Nothing else needs to change. Emitting a guessed origin would be worse
// than emitting none: a wrong canonical actively misdirects crawlers.
export const SITE_URL = "";

export const SITE_NAME = "Solarisx";
export const SITE_TITLE =
  "Dagim Demissie — Visual Storyteller & Creative Technologist";
export const SITE_DESCRIPTION =
  "I combine storytelling, visual design and technology to build experiences people remember. Editing, motion design, and interactive work.";
// No dedicated 1200x630 share asset exists and this milestone does not
// create artwork, so the site card reuses the reel poster — a real 1920x1080
// frame from the work itself, already shipped in public/.
export const SITE_IMAGE = "/assets/projects/reel-poster.jpg";

const PROJECT_PREFIX = "/projects/";

const absolute = (path) => (SITE_URL ? `${SITE_URL}${path}` : path);

/**
 * Routes that get their own pre-rendered HTML file. A project opts in by
 * carrying an `seo` key — projects whose copy is still placeholder (or that
 * have no case study) deliberately fall through to the site defaults rather
 * than shipping unfinished copy into link previews.
 */
export const seoRoutes = [
  "/",
  ...projects.filter((p) => p.seo).map((p) => `${PROJECT_PREFIX}${p.slug}`),
];

/** Resolve the metadata for a pathname. Unknown routes get the site defaults. */
export function resolveMeta(pathname) {
  const slug = pathname.startsWith(PROJECT_PREFIX)
    ? pathname.slice(PROJECT_PREFIX.length).replace(/\/$/, "")
    : null;
  const seo = slug ? projects.find((p) => p.slug === slug)?.seo : null;

  return {
    title: seo?.title ?? SITE_TITLE,
    description: seo?.description ?? SITE_DESCRIPTION,
    image: absolute(seo?.image ?? SITE_IMAGE),
    url: SITE_URL ? absolute(pathname) : "",
    type: seo ? "article" : "website",
  };
}

/**
 * The head as a flat list of tag descriptors — the shared shape the build-time
 * serializer and the runtime upsert both consume, so the two can't drift.
 * `attr` identifies the tag; `content` is written to content= (meta) or href=
 * (link). Entries with empty content are dropped.
 */
export function metaEntries(meta) {
  return [
    { tag: "meta", attr: "name", key: "description", content: meta.description },
    { tag: "meta", attr: "property", key: "og:type", content: meta.type },
    { tag: "meta", attr: "property", key: "og:site_name", content: SITE_NAME },
    { tag: "meta", attr: "property", key: "og:title", content: meta.title },
    { tag: "meta", attr: "property", key: "og:description", content: meta.description },
    { tag: "meta", attr: "property", key: "og:image", content: meta.image },
    { tag: "meta", attr: "property", key: "og:locale", content: "en_US" },
    { tag: "meta", attr: "property", key: "og:url", content: meta.url },
    { tag: "meta", attr: "name", key: "twitter:card", content: "summary_large_image" },
    { tag: "meta", attr: "name", key: "twitter:title", content: meta.title },
    { tag: "meta", attr: "name", key: "twitter:description", content: meta.description },
    { tag: "meta", attr: "name", key: "twitter:image", content: meta.image },
    { tag: "link", attr: "rel", key: "canonical", content: meta.url },
  ].filter((entry) => entry.content);
}
