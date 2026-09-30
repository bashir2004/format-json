# SEO Improvement Plan — format-json.net

Based on the SEO audit (health score **58/100**, target **80+**). `PLAN.md` is untouched; this file covers SEO only.

## Goals
- Fix technical defects that cause broken previews, duplicate URLs, and canonical confusion.
- Give each search intent its own landing page with unique, visible content.
- Build initial backlinks and measurement so progress can be tracked.

## Phase 1: Quick technical fixes (Day 1–2) — High priority

- [x] **1.1 Create `og-image.png` (1200×630)** in the repo root. Referenced by every page (`og:image`, `twitter:image`) but missing.
- [x] **1.2 Create `icons/icon-512.png`**, referenced in `manifest.json` but missing. Add a `purpose: "maskable"` variant.
- [x] **1.3 Fix the canonical host mismatch (live-verified).** Production serves on `https://www.format-json.net/`; the apex `format-json.net` and `http://` both 301 to www. But every canonical, `og:url`, JSON-LD `url`, sitemap `<loc>`, and the `Sitemap:` line in `robots.txt` uses the **apex** host. Each canonical therefore points at a URL that redirects back, which sends Google contradictory signals.
  - Decision: standardize on **www** (matches the existing Cloudflare redirect; no infra change needed).
  - Replace `https://format-json.net/` with `https://www.format-json.net/` in all pages' canonical, `og:*`, `twitter:image`, JSON-LD, `sitemap.xml`, and `robots.txt`.
  - Footer links are already www; convert to relative paths for consistency.
  - In Search Console, add a Domain property (covers both hosts) and submit the www sitemap.
- [x] **1.4 Clean `sitemap.xml`**
  - Remove `/#formatter`, `/#diff`, `/#faq` (fragments are ignored by Google).
  - Drop `changefreq` and `priority` (ignored), keep `lastmod` with real dates only.
  - Add new pages as they ship (Phase 3).
- [x] **1.5 Add a real favicon**: `/favicon.ico` plus a 48px+ PNG, and link them in every page `<head>`.
- [x] **1.6 Remove unused hints**: `dns-prefetch` to Google Fonts (no fonts loaded); drop `meta keywords`.
- [x] **1.7 Update `sw.js`**: add `/json-web-token/` and `/changelog/` to `ASSETS`, and bump `CACHE_NAME`.

**Done when:** social preview validators show the image, `curl -I https://www.format-json.net` returns 301, every canonical/sitemap/robots URL is `www` and returns 200 with no redirect, and the sitemap has only canonical URLs.

## Phase 2: On-page fixes (Week 1) — High priority

- [x] **2.1 Homepage H1**: change from the brand name to a descriptive one, e.g. `Online JSON Formatter, Validator & Diff Tool`. Keep the logo as a non-heading element.
- [x] **2.2 Heading hygiene**: change hidden-dialog `<h2>` (shortcuts, JWT, filter, URL) to non-heading elements or `role="dialog"` with `aria-label`, so the outline reflects real content.
- [x] **2.3 Differentiate `/` vs `/json-prettier/`** (keyword cannibalization)
  - `/` → format / beautify / validate / diff (main tool).
  - `/json-prettier/` → pretty print + fix invalid JSON + error explanations.
  - Rewrite titles, descriptions, H1s and intro copy to match. Or canonicalize one to the other if they can't be made distinct.
- [x] **2.4 Move keyword content out of the collapsed `<details>`**: show about 800 words of visible copy below the tool (how to format, common errors, examples). Keep the FAQ, but make sure the FAQ JSON-LD matches visible text.
- [x] **2.5 Internal linking**
  - Add a "Tools" nav (Formatter, JSON Prettier, JWT Decoder, and new pages).
  - Contextual links between tool pages in body copy.
  - Add breadcrumbs plus `BreadcrumbList` JSON-LD on sub-pages.
- [x] **2.6 Keep the About/content section rendered**: verify the close button (`btn-close-about`) doesn't leave Googlebot with hidden content, and that closing is per-user only.

## Phase 3: Content expansion (Weeks 2–5) — High/Medium priority

Create one page per intent, each with a working tool state, 500+ words of unique copy, worked examples, an FAQ, and its own title/description/canonical/JSON-LD (`WebApplication` or `HowTo`).

**Status:** pages 1–5 and 7 are built. Copy lives in `scripts/build-pages.js`; run `node scripts/build-pages.js` after editing it or the tool shell in `index.html`. Page 7 (hand-written article, not generated) is done. Page 6 is open: it needs the escape/unescape feature first. Pages 4–5 are ~400–450 words, below the 500 target; they are short intents and were not padded.

| # | URL | Target query | Notes |
|---|---|---|---|
| 1 ✅ | `/json-validator/` (or `/json-lint/`) | json validator, json lint | Ties into current `feature/json-lint` branch |
| 2 ✅ | `/json-diff/` | json diff, compare json | Preloads the diff tab |
| 3 ✅ | `/json-to-csv/` | json to csv | Existing export feature |
| 4 ✅ | `/json-to-yaml/` | json to yaml | Existing export feature |
| 5 ✅ | `/json-minify/` | minify json | Short, focused page |
| 6 | `/json-escape/` | json escape / unescape | Needs a new escape/unescape feature first |
| 7 ✅ | `/blog/common-json-errors/` | fix invalid json, unexpected token | Long-form guide |

For each new page:
- [x] Add to `sitemap.xml`, `sw.js` precache, and the site nav/footer. (pages 1–5; via `scripts/build-pages.js`, which also rebuilds `/json-prettier/`)
- [x] Cross-link to at least 3 sibling pages.
- [x] Verify the H1 is unique and the canonical is self-referencing.

**Decision needed:** whether to ship real localized URLs (`/es/`, `/de/` with `hreflang`) or leave i18n as a UI-only feature (no SEO value as-is).

## Phase 4: Performance (Weeks 2–4) — Medium priority

**Baseline (Lighthouse, mobile, lab, 2026-09-30, live homepage):** Performance 98, Accessibility 100, Best Practices 100, SEO 100. FCP 1.8s, LCP 1.8s, TBT 100ms, CLS 0, 198 KB transferred. The Core Web Vitals targets were already met, so this phase was scoped down to low-risk changes.

- [x] Defer the GTM load until first interaction, or 4s after `load` (all 12 pages). Trade-off: visits that leave in under 4s with no interaction are no longer counted in analytics.
- [x] Add a Cloudflare `_headers` file: security headers (HSTS without includeSubDomains, nosniff, Referrer-Policy, X-Frame-Options) and cache lifetimes (10 min for CSS/JS since they are not fingerprinted; 1 week for images and icons).
- [x] Add `.assetsignore`: `PLAN.md`, `SEO-PLAN.md`, `README.md`, `scripts/` and `wrangler.jsonc` were publicly served.
- [x] Target: LCP < 2.5s, INP < 200ms, CLS < 0.1 (met at baseline; re-measure after deploy).
- [ ] ~~Split `app.js` (96 KB)~~ **Deferred.** It is one closure with shared state and there is no test suite, so splitting it risks regressions for a small gain (Lighthouse estimates 70 KB unused JS, but TBT is only 100ms). Revisit if INP or TBT regress in field data.
- [ ] ~~Load `i18n.js` (37 KB) only when the language is non-English~~ **Deferred**, same reason: `app.js` reads `window.i18n` in many places.
- [ ] ~~Minify CSS/JS~~ **Skipped.** Cloudflare already serves Brotli, so minifying saves only about 9 KB and would add a build step to a build-free repo.

## Phase 5: Off-page and promotion (Weeks 3–8) — Medium priority

- [ ] Submit the site to Google Search Console and Bing Webmaster Tools, then submit the sitemap.
- [ ] Publish a technical post: "How this JSON formatter runs 100% in your browser."
- [ ] Post to Show HN, Product Hunt, r/webdev, r/programming, dev.to.
- [ ] List on AlternativeTo and relevant awesome-lists. Add GitHub topics and a link to the site in the README.
- [ ] Reach out to developer newsletters and tool roundups.
- [ ] Set up brand mention alerts.

## Phase 6: UX and engagement (Ongoing) — Low/Medium priority

- [x] Add sample JSON and "try an example" buttons. An **Example** button sits next to Clear (EN/NL/DE/RU labels) on the homepage and every tool page.
- [x] Remember the last input in `localStorage` (`jv-input`, skipped above 512 KB, removed by **Clear**). Privacy policy section 2.3 updated to say so. Verified end to end in headless Edge (load, reload, clear, typing, oversize, diff page).
- [ ] Check mobile layout at 360px and tap targets ≥ 48px.
- [ ] Add Microsoft Clarity (or similar) to review heatmaps.

## Measurement

| Metric | Tool | Baseline | Target (90 days) |
|---|---|---|---|
| Indexed pages | Search Console | TBD | All sitemap URLs indexed |
| Impressions / clicks | Search Console | TBD | +200% |
| Avg. position, top 10 queries | Search Console | TBD | Top 20 for long-tail terms |
| Lighthouse mobile (perf / a11y / BP / SEO) | Lighthouse | 98 / 100 / 100 / 100 (lab, 2026-09-30) | Hold at 95+ |
| Core Web Vitals (field) | PageSpeed / CrUX | TBD (need field data) | All "Good" |
| Referring domains | Ahrefs Webmaster Tools | TBD | 20+ |
| Engagement rate | GA4 | TBD | +15% |

Record baselines in the first week, and review every two weeks.

## Order of execution
1. Phase 1 (all items, one commit).
2. Phase 2.1–2.3, then 2.4–2.6.
3. Phase 3 pages 1–3, then 4–7, one PR per page or pair.
4. Phase 4 alongside Phase 3.
5. Phase 5 once at least 3 new pages are live.

## Risks
- Changing titles and H1s can cause short-term ranking fluctuation. Ship them together with the new pages.
- Adding many thin pages could hurt quality signals. Only publish pages with unique content and a working tool.
- Host redirects live in Cloudflare (outside the repo); the current apex to www 301 is correct, so keep it and document it.
- Live `/json-prettier` (no trailing slash) returns a 307; make it a 301 (or link only to the slash form).
- Live responses show `Cache-Control: max-age=0, must-revalidate` on everything and no HSTS or security headers (see Phase 4).
