// Extension-based media type detection, shared by Works.jsx (list preview)
// and ProjectPage.jsx (hero media) — extracted here once ProjectPage became
// the second consumer, per PROJECT_PAGE_SYSTEM.md §5's exception rule.
export const isVideo = (src) => /\.(mp4|webm|ogv|mov)$/i.test(src);
