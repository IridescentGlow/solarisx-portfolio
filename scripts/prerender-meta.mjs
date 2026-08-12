// prerender-meta.mjs
// Post-build step: writes a real HTML file per route with that route's share
// metadata baked into the head.
//
// Why this exists: social crawlers and most search bots do not execute the
// JS bundle, so runtime head management (src/lib/useDocumentMeta.js) is
// invisible to them — they only ever see the bytes the server returns. For a
// client-rendered SPA the only way to hand them correct per-route metadata,
// short of a framework migration to SSR, is to emit the route's HTML at build
// time. The <body> stays the SPA shell; only the head block differs, which is
// all a crawler reads.
//
// Emits dist/index.html (rewritten in place) and dist/projects/<slug>/index.html.
// A static host serves those files directly and only falls back to the SPA
// shell for routes that have none.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seoRoutes, resolveMeta, metaEntries } from "../src/lib/seo.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const START = "<!-- seo:start -->";
const END = "<!-- seo:end -->";

const escape = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const renderHead = (meta) =>
  [
    `<title>${escape(meta.title)}</title>`,
    ...metaEntries(meta).map(({ tag, attr, key, content }) =>
      tag === "link"
        ? `<link ${attr}="${key}" href="${escape(content)}" />`
        : `<meta ${attr}="${key}" content="${escape(content)}" />`
    ),
  ]
    .map((line) => `    ${line}`)
    .join("\n");

const shell = await readFile(path.join(dist, "index.html"), "utf8");
const start = shell.indexOf(START);
const end = shell.indexOf(END);

// Fail loudly. A silent no-op here is the failure mode where the build
// reports success and every route ships the same default metadata.
if (start === -1 || end === -1) {
  console.error(
    `prerender-meta: ${START} / ${END} markers not found in dist/index.html — ` +
      "nothing injected. Restore them in index.html."
  );
  process.exit(1);
}

const before = shell.slice(0, start + START.length);
const after = shell.slice(end);

for (const route of seoRoutes) {
  const html = `${before}\n${renderHead(resolveMeta(route))}\n    ${after}`;
  const file =
    route === "/"
      ? path.join(dist, "index.html")
      : path.join(dist, route.replace(/^\//, ""), "index.html");

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, html);
  console.log(`prerender-meta: ${route} -> ${path.relative(root, file)}`);
}
