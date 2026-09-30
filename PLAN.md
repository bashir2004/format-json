# format-json.net — Feature Implementation Plan

## Phase 1 — Quick Wins (≤ 1 day each, no new dependencies)

| # | Feature | Files to Touch | Notes |
|---|---|---|---|
| 1.1 | **Sort Keys button** | `js/app.js`, `index.html`, `js/i18n.js`, `css/styles.css` | Recursive sort preserving arrays. Add button to editor action bar |
| 1.2 | **Indent size selector** | `js/app.js`, `index.html`, `js/i18n.js` | `<select>` with 2/4/tab options beside Format btn; persist in `localStorage` |
| 1.3 | **Undo/Redo for editor** | `js/app.js` | Ring buffer of up to 50 text snapshots; hook `Ctrl+Z` / `Ctrl+Y`; fire on Format/Minify/Clear |
| 1.4 | **Keyboard shortcuts modal** | `js/app.js`, `index.html`, `css/styles.css` | `?` icon in toolbar opens `<dialog>` listing all shortcuts |
| 1.5 | **Content-Type check on URL load** | `js/app.js` | Warn if response `Content-Type` is `text/html` instead of `application/json` |
| 1.6 | **JSONPath breadcrumb in tree** | `js/app.js`, `css/styles.css` | Sticky bar under action bar; updated on tree-row click; "Copy path" button |

---

## Phase 2 — High-Impact Features (1–3 days each, minimal deps)

| # | Feature | Files to Touch | Dependencies | Notes |
|---|---|---|---|---|
| 2.1 | **JSON Repair / Auto-Fix** | `js/app.js`, `index.html`, `js/i18n.js`, `sw.js` | [jsonrepair](https://github.com/josdejong/jsonrepair) (~12 KB min+gz) — MIT | Show "Repair" button when validation fails. Bundle as single JS file fetched from CDN or copied to `js/vendor/` |
| 2.2 | **CSV → JSON import** | `js/app.js`, `index.html`, `js/i18n.js` | None (plain JS) | Auto-detect headers, handle quoted fields; add "CSV" option to Import button |
| 2.3 | **JSON Statistics panel** | `js/app.js`, `css/styles.css`, `index.html` | None | Collapsible area below validation bar: total keys, max depth, type distribution, size |
| 2.4 | **JWT Decoder** | `js/app.js`, `index.html`, `js/i18n.js`, `css/styles.css` | None (pure `atob`) | Detect JWT shape on paste; show decode button + modal with header/payload/signature |
| 2.5 | **More export formats** | `js/app.js`, `index.html`, `js/i18n.js` | None | Add TOML and SQL INSERT to `<select id="export-select">` |

---

## Phase 3 — Major Capabilities (3–7 days each)

| # | Feature | Files to Touch | Dependencies | Notes |
|---|---|---|---|---|
| 3.1 | **Share via URL** | `js/app.js`, `index.html`, `js/i18n.js`, `sw.js` | [lz-string](https://github.com/pieroxy/lz-string) (~3 KB) — MIT | Compress JSON into `#data=` hash; decompress on load; copy-link button in toolbar |
| 3.2 | **JSON Schema validation** | `js/app.js`, `index.html`, `js/i18n.js`, `css/styles.css` | [Ajv](https://ajv.js.org/) (~30 KB min+gz) — MIT | New toolbar button opens modal with schema textarea + validate action; annotate tree nodes with errors |
| 3.3 | **JSONPath Query tab** | `js/app.js`, `index.html`, `js/i18n.js`, `css/styles.css` | [jsonpath-plus](https://github.com/JSONPath-Plus/JSONPath) (~45 KB) — MIT | New 5th tab "Query"; expression input + live result panel; syntax hints; copy result |
| 3.4 | **XML ↔ JSON conversion** | `js/app.js`, `index.html`, `js/i18n.js` | [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) (~25 KB) — MIT | Add XML to import + export; auto-detect XML on paste |
| 3.5 | **Right-click context menu (tree)** | `js/app.js`, `css/styles.css` | None | Floating menu on `.tree-row` right-click: Copy value · Copy path · Copy subtree · Expand/Collapse subtree |

---

## Phase 4 — Performance & Scale (requires architectural changes)

| # | Feature | Files to Touch | Notes |
|---|---|---|---|
| 4.1 | **Web Worker for JSON.parse** | `js/app.js`, new `js/worker.js` | Post raw text to worker; receive `parsedJson` + stats; unblocks UI thread for >1 MB files |
| 4.2 | **Virtual scroll in Tree Viewer** | `js/app.js`, `css/styles.css` | Use IntersectionObserver; only render visible nodes + buffer; critical for >5000-key objects |
| 4.3 | **Large file warning** | `js/app.js` | If file/paste >2 MB, show a banner: "Large file detected — tree rendering may be slow" with option to skip tree auto-render |

---

## Phase 5 — Internationalization Expansion

| # | Feature | Files | Notes |
|---|---|---|---|
| 5.1 | Spanish (`es`) | `js/i18n.js` | ~120 string keys to translate |
| 5.2 | French (`fr`) | `js/i18n.js` | |
| 5.3 | Chinese Simplified (`zh`) | `js/i18n.js` | |
| 5.4 | Japanese (`ja`) | `js/i18n.js` | |

Add each to the `<select id="lang-select">` in `index.html` and `json-prettier/index.html`.

---

## Security / Code-Quality Fixes (do alongside Phase 1)

| Issue | Fix |
|---|---|
| `document.execCommand('copy')` deprecated | Add visible fallback UI ("Press Ctrl+C to copy") when `navigator.clipboard` fails |
| URL loader no Content-Type check | Covered in Phase 1.5 |
| Service worker cache version | Add a `// BUMP version on deploy` comment and checklist to README |
| `innerHTML` audit | Audit all `innerHTML` assignments; confirm no user-supplied strings reach them unsanitized |

---

## Effort Summary

| Phase | Estimated Effort | Features |
|---|---|---|
| Phase 1 | ~4–5 days | 6 features, pure JS, no deps |
| Phase 2 | ~6–8 days | 5 features, 1–2 small deps |
| Phase 3 | ~15–20 days | 5 features, 3–4 libs, new tab |
| Phase 4 | ~5–8 days | 3 features, architectural |
| Phase 5 | ~2–3 days | 4 languages |

---

## Recommended Starting Point

**Phase 1.1 (Sort Keys)** and **Phase 1.3 (Undo/Redo)** — they touch existing infrastructure, require no new files or dependencies, and fix the two most-complained-about UX gaps in the editor tab.
