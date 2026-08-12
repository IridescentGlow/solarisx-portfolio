// useDocumentMeta.js
// Keeps <head> correct across client-side navigations.
//
// The served HTML already carries the right tags for a cold load (they are
// injected per route by scripts/prerender-meta.mjs), which is the half that
// crawlers see. This is the other half: Works.jsx navigates with
// navigate()/<Link>, so a visitor moving from / to /projects/:slug never
// re-fetches the document and would otherwise keep the home page's title.
//
// Deliberately imperative rather than rendering <title>/<meta> as JSX: the
// tags already exist in the served document, and upserting by selector
// guarantees they are overwritten rather than duplicated.
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { resolveMeta, metaEntries } from "./seo.js";

export function useDocumentMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = resolveMeta(pathname);
    document.title = meta.title;

    for (const { tag, attr, key, content } of metaEntries(meta)) {
      const selector = `${tag}[${attr}="${key}"]`;
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement(tag);
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute(tag === "link" ? "href" : "content", content);
    }
  }, [pathname]);
}
