// generate-seo-files.mjs
// Post-build step: writes dist/robots.txt and, when SITE_URL is known,
// dist/sitemap.xml.
//
// SITE_URL is "" when VITE_SITE_URL is unset (see src/lib/seo.js) — this
// project omits rather than fabricates a canonical origin. A sitemap with
// relative/empty <loc> values is invalid, so sitemap.xml is skipped entirely
// in that case. robots.txt is always written; it only gains a Sitemap: line
// once SITE_URL is set.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_URL, seoRoutes } from "../src/lib/seo.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const robotsLines = ["User-agent: *", "Allow: /"];
if (SITE_URL) robotsLines.push(`Sitemap: ${SITE_URL}/sitemap.xml`);
const robotsFile = path.join(dist, "robots.txt");
await writeFile(robotsFile, `${robotsLines.join("\n")}\n`);
console.log(`generate-seo-files: robots.txt -> ${path.relative(root, robotsFile)}`);

if (SITE_URL) {
  const urls = seoRoutes
    .map((route) => `  <url><loc>${SITE_URL}${route}</loc></url>`)
    .join("\n");
  const sitemap =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  const sitemapFile = path.join(dist, "sitemap.xml");
  await writeFile(sitemapFile, sitemap);
  console.log(`generate-seo-files: sitemap.xml -> ${path.relative(root, sitemapFile)}`);
} else {
  console.log("generate-seo-files: SITE_URL unset — skipping sitemap.xml");
}
