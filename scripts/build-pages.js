#!/usr/bin/env node
/*
 * Generates the SEO landing pages (one folder per tool, e.g. /json-diff/).
 *
 * Every page reuses the tool shell from index.html (toolbar, panels, dialogs)
 * so they never drift out of sync with the app, and adds its own head metadata,
 * H1, copy, FAQ and FAQ JSON-LD.
 *
 * Usage:  node scripts/build-pages.js
 * After adding a page: add it to sitemap.xml and the ASSETS list in sw.js.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://www.format-json.net';

const pages = [
  {
    slug: 'json-prettier',
    brand: 'JSON Prettier',
    nav: 'JSON Prettier',
    blurb: 'pretty print JSON and repair invalid JSON',
    title: 'JSON Prettier — Pretty Print & Fix Invalid JSON Online',
    description: 'Pretty print JSON online and fix invalid JSON. Choose 2-space, 4-space or tab indent, repair trailing commas, single quotes and comments, and see exact error positions. Runs in your browser.',
    ogTitle: 'JSON Prettier — Pretty Print & Fix Invalid JSON',
    ogDescription: 'Pretty print JSON with custom indentation and repair invalid JSON — trailing commas, single quotes, comments — right in your browser.',
    appDescription: 'JSON Prettier pretty prints JSON with custom indentation and repairs invalid JSON such as trailing commas, single quotes and comments, entirely in your browser.',
    h1: 'JSON Prettier: Pretty Print & Fix Invalid JSON Online',
    lead: 'Pretty print minified or messy JSON into clean, indented code, and repair the mistakes that make JSON invalid. Paste your data, choose an indent, and get readable output in one click. It runs entirely in your browser.',
    sections: [
      ['Pretty print JSON', `<p>Pretty printing adds line breaks and consistent indentation so nested objects and arrays are easy to read. Choose 2 spaces, 4 spaces, or tabs, then click <strong>Format</strong> or press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd>. Pretty printing only changes whitespace: keys, values, and their order stay exactly as you wrote them. If you also want a stable order, <strong>Sort Keys</strong> alphabetizes every object. Need it compact again? <strong>Minify</strong> removes all whitespace.</p>`],
      ['Fix invalid JSON', `<p>If your JSON will not parse, the editor shows the error with its line and column. A <strong>Repair JSON</strong> button then appears and tries to fix the common causes automatically:</p>
      <ul>
        <li>Removes <code>//</code> and <code>/* */</code> comments.</li>
        <li>Removes trailing commas before <code>]</code> and <code>}</code>.</li>
        <li>Adds double quotes around unquoted keys.</li>
        <li>Converts single-quoted strings to double quotes.</li>
        <li>Replaces <code>True</code>, <code>False</code>, <code>None</code>, <code>undefined</code>, <code>NaN</code>, and <code>Infinity</code> with valid JSON values (<code>true</code>, <code>false</code>, or <code>null</code>).</li>
      </ul>
      <p>Repair cannot guess missing brackets or lost data. If the result still does not parse, your text is left as it was so you can fix it by hand using the error position.</p>`],
      ['Why JSON is invalid: common errors', `<p><strong>Unexpected token</strong> usually means a stray character, a trailing comma, or a single quote. <strong>Unexpected end of JSON input</strong> means a closing brace or bracket is missing. <strong>Unterminated string</strong> means a quote was never closed, often because of an unescaped line break or a backslash. Paste the JSON here and the error position tells you where to look.</p>`],
      ['Beyond pretty printing', `<p>Explore the result in the collapsible tree viewer, compare two documents in the Diff tab, or export to CSV or YAML. For a full overview of every feature, see the <a href="/">JSON formatter, validator and diff tool</a>. Working with tokens? Try the <a href="/json-web-token/">JWT Decoder</a>.</p>`],
    ],
    faq: [
      ['What does pretty printing JSON do?', 'It re-indents your JSON with line breaks so it is easy to read. Only whitespace changes, so the data itself is identical.'],
      ['Can it fix invalid JSON?', 'Often, yes. Repair JSON removes comments and trailing commas, quotes bare keys, converts single quotes, and maps Python and JavaScript values to JSON. It cannot restore missing brackets or lost data.'],
      ['Which indentation can I use?', '2 spaces, 4 spaces, or a tab. Your choice is applied when you click Format.'],
      ['Is my JSON uploaded anywhere?', 'No. Formatting, validation, and repair all run in your browser. Nothing is sent to a server.'],
      ['Does it work offline?', 'Yes. After the first visit the app is cached as a Progressive Web App and works without a connection.'],
    ],
  },
  {
    slug: 'json-validator',
    brand: 'JSON Validator',
    nav: 'JSON Validator',
    blurb: 'check JSON syntax and find errors',
    title: 'JSON Validator — Check & Validate JSON Syntax Online',
    description: 'Free online JSON validator. Paste JSON to check its syntax instantly, see the exact line and column of any error, and repair common mistakes. Private — runs in your browser.',
    ogTitle: 'JSON Validator — Check JSON Syntax Online',
    ogDescription: 'Validate JSON as you type and find the exact line and column of syntax errors. Free, private, and runs in your browser.',
    appDescription: 'A free online JSON validator that checks syntax as you type, reports the line and column of errors, and can repair common mistakes, entirely in your browser.',
    h1: 'JSON Validator: Check JSON Syntax Online',
    lead: 'Paste your JSON and it is checked instantly. If something is wrong, you see what and where. Nothing is uploaded: validation runs in your browser.',
    sections: [
      ['How to validate JSON', `<ol>
        <li>Paste your JSON into the editor, drop a <code>.json</code> file on the page, or load it from a URL.</li>
        <li>The status bar updates as you type. Valid JSON is confirmed, and invalid JSON shows an error message.</li>
        <li>When the parser reports a position, the message includes the line and column so you can go straight to it.</li>
        <li>Fix the problem, or click <strong>Repair JSON</strong> to try an automatic fix.</li>
      </ol>`],
      ['What the validator checks', `<p>Validation uses your browser's built-in JSON parser, so it accepts exactly what <code>JSON.parse</code> accepts: strict JSON syntax. Strings and keys must use double quotes, values must be an object, array, string, number, <code>true</code>, <code>false</code>, or <code>null</code>, and there can be no comments or trailing commas. This is a <strong>syntax</strong> check. It does not validate your data against a JSON Schema.</p>`],
      ['Common JSON errors and what they mean', `<ul>
        <li><strong>Unexpected token</strong>: a character that JSON does not allow at that position, such as a single quote, a trailing comma, or a comment.</li>
        <li><strong>Unexpected end of JSON input</strong>: the text stops early, usually because a closing <code>}</code> or <code>]</code> is missing.</li>
        <li><strong>Expected property name</strong>: an object key is unquoted, or there is a comma after the last property.</li>
        <li><strong>Unterminated string</strong>: a string was opened but never closed, often from a raw line break or an unescaped quote inside it.</li>
        <li><strong>Bad control character</strong>: a tab or newline inside a string that should be written as <code>\\t</code> or <code>\\n</code>.</li>
      </ul>
      <p>Exact wording varies by browser, because each engine writes its own messages.</p>`],
      ['Repair invalid JSON', `<p>The <strong>Repair JSON</strong> button removes comments and trailing commas, quotes bare keys, converts single quotes, and replaces <code>True</code>, <code>False</code>, <code>None</code>, <code>undefined</code>, <code>NaN</code>, and <code>Infinity</code>. It cannot recover missing brackets or lost data, and it leaves your text unchanged if the result still is not valid. Once your JSON is valid, <strong>Format</strong> re-indents it and the tree viewer lets you inspect it.</p>`],
    ],
    faq: [
      ['How do I validate JSON?', 'Paste it into the editor. It is validated as you type, and errors appear with a message and, when available, the line and column.'],
      ['Does it validate against a JSON Schema?', 'No. It checks JSON syntax only, using the same rules as JSON.parse in your browser.'],
      ['Why does my JSON with comments fail?', 'Standard JSON does not allow comments. Remove them, or use Repair JSON to strip them automatically.'],
      ['Is my JSON sent to a server?', 'No. Everything happens in your browser, so your data never leaves your device.'],
      ['Is there a size limit?', 'There is no server-side limit because nothing is uploaded. Very large documents are limited only by your browser and device memory.'],
    ],
  },
  {
    slug: 'json-diff',
    brand: 'JSON Diff',
    nav: 'JSON Diff',
    blurb: 'compare two JSON documents',
    defaultTab: 'diff',
    title: 'JSON Diff — Compare Two JSON Files Online',
    description: 'Compare two JSON documents online. Paste both sides, click Compare, and see every added, removed and changed value with its full path. Free and runs in your browser.',
    ogTitle: 'JSON Diff — Compare Two JSON Documents Online',
    ogDescription: 'Paste two JSON documents and see added, removed and changed values with their paths. Free, private, browser-based.',
    appDescription: 'A free online JSON diff tool that compares two JSON documents and lists added, removed and changed values with their paths, entirely in your browser.',
    h1: 'JSON Diff: Compare Two JSON Documents Online',
    lead: 'Paste two JSON documents side by side and see exactly what changed: added, removed, or modified values, each with its full path. Nothing is uploaded, so it is safe for real API responses and config files.',
    sections: [
      ['How to compare JSON', `<ol>
        <li>The <strong>Diff</strong> tab is open for you. The left panel is pre-filled with whatever is in the editor, and you can overwrite it.</li>
        <li>Paste the second document into the right panel.</li>
        <li>Click <strong>Compare</strong>.</li>
      </ol>
      <p>Both sides must be valid JSON. If one is not, you are told which side has the problem. Use the <a href="/json-validator/">JSON validator</a> to find the error.</p>`],
      ['Reading the results', `<p>Each difference is one line, with the path from the root (<code>$</code>) to the value:</p>
      <ul>
        <li><strong>+ added</strong> (green): the key exists only in the right document.</li>
        <li><strong>- removed</strong> (red): the key exists only in the left document.</li>
        <li><strong>~ changed</strong> (yellow): the value differs, shown as old value → new value. A change of type, such as a string becoming a number, is reported as a change.</li>
      </ul>
      <p>Paths look like <code>$.user.address.city</code>. Array items are addressed by index, such as <code>$.items.2.price</code>, so inserting an item near the start of an array shifts the indexes after it. Objects are compared by key, so the order of keys does not matter. If the documents match, you see "Documents are identical".</p>`],
      ['What to use it for', `<ul>
        <li>Compare an API response between staging and production.</li>
        <li>Check what changed in a configuration file before you deploy.</li>
        <li>Review a data export against last week's export.</li>
        <li>Confirm that a refactor still returns the same payload.</li>
      </ul>`],
      ['Tips for cleaner comparisons', `<p>Run both documents through <strong>Format</strong> first so they are easy to read alongside the results, and use <strong>Sort Keys</strong> if you want to eyeball them in the same order. For a broader tour of the tool, see the <a href="/">JSON formatter and viewer</a>.</p>`],
    ],
    faq: [
      ['How do I compare two JSON files?', 'Open the Diff tab, paste one document on each side, and click Compare. Differences are listed with their paths.'],
      ['Does key order matter?', 'No. Objects are compared key by key, so the same data in a different key order is reported as identical.'],
      ['How are arrays compared?', 'By position. Item 0 is compared with item 0, item 1 with item 1, and so on, so inserting an item early in an array shows later items as changed.'],
      ['Can I compare files instead of pasting?', 'Load a file into the editor and it fills the left side of the diff. For the right side, paste the contents.'],
      ['Is my data uploaded?', 'No. The comparison runs in your browser and nothing is sent to a server.'],
    ],
  },
  {
    slug: 'json-to-csv',
    brand: 'JSON to CSV',
    nav: 'JSON to CSV',
    blurb: 'convert JSON to CSV (and CSV back to JSON)',
    title: 'JSON to CSV Converter — Export JSON as CSV Online',
    description: 'Convert JSON to CSV online. Paste an array of objects, export a CSV file for Excel or Google Sheets, or import CSV back to JSON. Free and runs in your browser.',
    ogTitle: 'JSON to CSV Converter — Free & Private',
    ogDescription: 'Turn a JSON array into a CSV file for spreadsheets, or import CSV as JSON. Everything runs in your browser.',
    appDescription: 'A free online converter that exports JSON arrays to CSV files and imports CSV back to JSON, entirely in your browser.',
    h1: 'JSON to CSV Converter Online',
    lead: 'Turn a JSON array of objects into a CSV file you can open in Excel or Google Sheets, or import a CSV and get JSON back. The conversion happens in your browser, so your data stays with you.',
    sections: [
      ['How to convert JSON to CSV', `<ol>
        <li>Paste your JSON into the editor. It should be an array of objects.</li>
        <li>Open the <strong>Export</strong> menu and choose <strong>CSV (arrays)</strong>.</li>
        <li>A file named <code>data.csv</code> downloads. Open it in a spreadsheet.</li>
      </ol>
      <p>For example, <code>[{"id":1,"name":"Ada"},{"id":2,"name":"Grace"}]</code> becomes a header row <code>id,name</code> followed by one row per object.</p>`],
      ['What shape of JSON works best', `<p>CSV is flat, so the tool works best with an array of flat objects, like rows from an API or database. A few details:</p>
      <ul>
        <li>The header row is the union of all keys in all objects. If an object lacks a key, its cell is left empty.</li>
        <li>Values containing commas, quotes, or line breaks are quoted, and quotes inside them are doubled, following standard CSV rules.</li>
        <li><code>null</code> becomes an empty cell.</li>
        <li><strong>Nested objects and arrays are not flattened.</strong> Flatten them first, or remove those fields with the tree viewer's field filter before exporting.</li>
      </ul>
      <p>If your JSON is a single object, it is exported as one row. If it is not an object or array of objects, you are told that CSV export works best with arrays of objects.</p>`],
      ['Convert CSV to JSON', `<p>Use the <strong>CSV</strong> button in the toolbar to import a <code>.csv</code> file. The first row is used as keys, and each following row becomes an object. Empty cells and <code>null</code> become <code>null</code>, and <code>true</code> and <code>false</code> become booleans. Then use <strong>Format</strong> to tidy the result.</p>`],
      ['Other export formats', `<p>The same menu exports formatted or minified JSON, <a href="/json-to-yaml/">YAML</a>, TOML, and SQL INSERT statements. Need to shrink JSON instead? See the <a href="/json-minify/">JSON minifier</a>.</p>`],
    ],
    faq: [
      ['How do I convert JSON to CSV?', 'Paste a JSON array of objects, open the Export menu, and pick CSV. A data.csv file downloads.'],
      ['Can it handle nested JSON?', 'Not automatically. Nested objects and arrays are not flattened, so flatten them first or hide those fields before exporting.'],
      ['Can I convert CSV to JSON?', 'Yes. Use the CSV import button. The first row becomes the keys and each row becomes an object.'],
      ['Will it open in Excel?', 'Yes. The file is standard comma-separated text that Excel and Google Sheets can open.'],
      ['Is my data uploaded?', 'No. The conversion runs entirely in your browser.'],
    ],
  },
  {
    slug: 'json-to-yaml',
    brand: 'JSON to YAML',
    nav: 'JSON to YAML',
    blurb: 'convert JSON to YAML',
    title: 'JSON to YAML Converter — Convert JSON to YAML Online',
    description: 'Convert JSON to YAML online. Paste JSON, export a YAML file for Kubernetes, GitHub Actions, OpenAPI or Docker Compose configs. Free and runs in your browser.',
    ogTitle: 'JSON to YAML Converter — Free & Private',
    ogDescription: 'Convert JSON to clean, 2-space-indented YAML in your browser. Free and private.',
    appDescription: 'A free online converter that turns JSON into YAML files, entirely in your browser.',
    h1: 'JSON to YAML Converter Online',
    lead: 'Paste JSON and export it as YAML for config files. The conversion runs in your browser, so nothing you paste is uploaded.',
    sections: [
      ['How to convert JSON to YAML', `<ol>
        <li>Paste your JSON into the editor. It must be valid, so check the status bar.</li>
        <li>Open the <strong>Export</strong> menu and choose <strong>YAML</strong>.</li>
        <li>A file named <code>data.yaml</code> downloads.</li>
      </ol>
      <p>For example, <code>{"name":"app","ports":[80,443]}</code> becomes:</p>
      <pre><code>name: app
ports:
  - 80
  - 443</code></pre>`],
      ['What the output looks like', `<ul>
        <li>Nesting uses 2-space indentation.</li>
        <li>Numbers, booleans, and <code>null</code> keep their types.</li>
        <li>Empty arrays are written as <code>[]</code>.</li>
        <li>Strings that contain a colon, <code>#</code>, quotes, a line break, or leading or trailing spaces are double-quoted so they stay strings.</li>
      </ul>
      <p>Review the result before committing it. YAML has many dialects, and strings such as <code>yes</code> or <code>on</code> can be read as booleans by some parsers.</p>`],
      ['Where YAML is used', `<p>YAML is the usual format for Kubernetes manifests, GitHub Actions workflows, Docker Compose files, OpenAPI specifications, and many CI and application configs. JSON is a good starting point for these when your data comes from an API or a generator.</p>`],
      ['JSON vs YAML: which to use', `<p>JSON is strict and unambiguous, which makes it ideal for APIs and machine-to-machine data. YAML trades that strictness for readability: no braces or quotes for most values, and it supports comments, which JSON does not. That is why configuration files are usually written in YAML while the same data travels between services as JSON. YAML is a superset of JSON in most parsers, so valid JSON can often be pasted into a YAML file unchanged, but converting it gives you the readable form.</p>`],
      ['Other formats', `<p>The Export menu also produces <a href="/json-to-csv/">CSV</a>, TOML, and SQL INSERT statements, and formatted or minified JSON. This tool converts from JSON to YAML; it does not convert YAML back to JSON. To tidy your JSON first, use <strong>Format</strong> or see the <a href="/json-prettier/">JSON Prettier</a>.</p>`],
    ],
    faq: [
      ['How do I convert JSON to YAML?', 'Paste valid JSON, open the Export menu, and choose YAML. A data.yaml file downloads.'],
      ['Can I convert YAML to JSON?', 'Not with this tool. It exports JSON to YAML only.'],
      ['Which indentation does the YAML use?', 'Two spaces per level.'],
      ['Are types preserved?', 'Yes. Numbers, booleans, and null stay as such, and strings with special characters are quoted.'],
      ['Is my data uploaded?', 'No. The conversion runs entirely in your browser.'],
    ],
  },
  {
    slug: 'json-minify',
    brand: 'JSON Minifier',
    nav: 'JSON Minifier',
    blurb: 'minify JSON and remove whitespace',
    title: 'JSON Minifier — Minify & Compress JSON Online',
    description: 'Minify JSON online. Remove all whitespace to get the smallest valid JSON for APIs, config and storage. One click or Ctrl+Shift+M. Free and runs in your browser.',
    ogTitle: 'JSON Minifier — Minify JSON Online',
    ogDescription: 'Strip whitespace from JSON in one click. Free, private, and runs in your browser.',
    appDescription: 'A free online JSON minifier that removes whitespace to produce compact JSON, entirely in your browser.',
    h1: 'JSON Minifier: Minify JSON Online',
    lead: 'Remove every unnecessary space and line break from your JSON in one click. The output is the same data in the smallest valid form, produced in your browser.',
    sections: [
      ['How to minify JSON', `<ol>
        <li>Paste your JSON into the editor.</li>
        <li>Click <strong>Minify</strong> or press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd>.</li>
        <li>Copy the result, or open <strong>Export</strong> and choose <strong>JSON (minified)</strong> to download <code>data.min.json</code>.</li>
      </ol>
      <p>Invalid JSON cannot be minified, so fix any error shown in the status bar first. The <a href="/json-validator/">JSON validator</a> explains common errors.</p>`],
      ['What minifying changes', `<p>Minifying removes whitespace outside of strings: indentation, line breaks, and spaces after colons and commas. Keys, values, and their order are untouched, and whitespace inside strings is preserved, so the data is identical. To make it readable again, click <strong>Format</strong>.</p>`],
      ['Example', `<p>This formatted JSON:</p>
      <pre><code>{
  "id": 7,
  "tags": ["a", "b"],
  "active": true
}</code></pre>
      <p>becomes this minified JSON:</p>
      <pre><code>{"id":7,"tags":["a","b"],"active":true}</code></pre>
      <p>Same data, 14 characters shorter here. The saving grows with nesting depth and indent size.</p>`],
      ['When to minify JSON', `<ul>
        <li>API responses and request bodies, to send fewer bytes.</li>
        <li>JSON embedded in HTML, environment variables, or command-line arguments, where line breaks are awkward.</li>
        <li>Values stored in a database column, cache, or <code>localStorage</code>.</li>
      </ul>
      <p>The saving depends on how much whitespace the original had. Deeply indented JSON shrinks more than JSON that was already compact. Minifying is different from compression: servers usually also apply gzip or Brotli, and the two work together.</p>`],
      ['Related tools', `<p>Need the opposite? <a href="/json-prettier/">JSON Prettier</a> pretty prints with 2 spaces, 4 spaces, or tabs. You can also <a href="/json-to-csv/">export to CSV</a> or <a href="/json-to-yaml/">YAML</a>, or <a href="/json-diff/">compare two documents</a>.</p>`],
    ],
    faq: [
      ['How do I minify JSON?', 'Paste it into the editor and click Minify, or press Ctrl+Shift+M.'],
      ['Does minifying change my data?', 'No. Only whitespace outside strings is removed. Keys, values, and order stay the same.'],
      ['How do I undo minification?', 'Click Format to re-indent the JSON, or use Undo.'],
      ['Is minified JSON the same as compressed JSON?', 'No. Minifying removes whitespace. Compression such as gzip is applied separately by the server and can be combined with it.'],
      ['Is my data uploaded?', 'No. Minification runs entirely in your browser.'],
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────
const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const text = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const jsonLd = obj => '  <script type="application/ld+json">\n' +
  JSON.stringify(obj, null, 2).replace(/^/gm, '  ') + '\n  </script>';

const home = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const cut = (from, to) => {
  const a = home.indexOf(from);
  const b = home.indexOf(to, a);
  if (a < 0 || b < 0) throw new Error(`Marker not found in index.html: ${from} .. ${to}`);
  return home.slice(a, b);
};

const gtmHead = cut('  <!-- Google Tag Manager -->', '  <meta charset');
const shell = cut('<body>', '  <!-- SEO: visible').slice('<body>'.length);
const footer = cut('  <footer class="site-footer">', '  <script src="js/i18n.js"');

function build(page) {
  const url = `${SITE}/${page.slug}/`;
  const ogImage = `${SITE}/og-image.png`;
  const others = pages.filter(p => p.slug !== page.slug);

  const head = `<!DOCTYPE html>
<html lang="en">
<head>
${gtmHead}  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}" />
  <meta name="author" content="format-json.net" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${url}" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(page.ogTitle)}" />
  <meta property="og:description" content="${esc(page.ogDescription)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:site_name" content="Format JSON" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(page.ogTitle)}" />
  <meta name="twitter:description" content="${esc(page.ogDescription)}" />
  <meta name="twitter:image" content="${ogImage}" />

${jsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: page.brand,
    url,
    description: page.appDescription,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires a modern web browser',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  })}

${jsonLd({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faq.map(([q, a]) => ({
      '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  })}

${jsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: page.brand, item: url },
    ],
  })}

  <link rel="preload" href="../css/styles.css" as="style" />
  <link rel="preload" href="../js/i18n.js" as="script" />
  <link rel="preload" href="../js/app.js" as="script" />

  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <link rel="icon" type="image/png" href="/icons/favicon-48.png" sizes="48x48" />
  <link rel="apple-touch-icon" href="../icons/icon-192.png" />
  <link rel="stylesheet" href="../css/styles.css" />
  <link rel="manifest" href="../manifest.json" />
  <meta name="theme-color" content="#1e1e2e" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</head>
`;

  let body = shell
    .replace('<div class="logo">{ } <span>Format JSON</span></div>',
      `<div class="logo">{ } <span>${esc(page.brand)}</span></div>`)
    .replace('      <a href="#about"',
      '      <a href="/" class="tool-link" title="Open Format JSON">Format JSON</a>\n      <a href="#about"');

  const sections = page.sections.map(([h2, html]) =>
    `    <section>\n      <h2>${h2}</h2>\n      ${html.trim()}\n    </section>`).join('\n\n');

  const related = others.map(p =>
    `        <li><a href="/${p.slug}/">${p.nav}</a>: ${p.blurb}.</li>`).join('\n');

  const faq = page.faq.map(([q, a]) =>
    `      <h3>${q}</h3>\n      <p>${a}</p>`).join('\n\n');

  const article = `  <!-- SEO: visible, crawlable content below the tool (generated by scripts/build-pages.js) -->
  <article id="about" class="seo-content" aria-label="About this tool">
    <button id="btn-close-about" class="about-close-btn" title="Close" aria-label="Close about section">&times;</button>
    <h1>${esc(page.h1)}</h1>
    <p class="lead">${page.lead}</p>

${sections}

    <section>
      <h2>More JSON tools</h2>
      <ul>
        <li><a href="/">Format JSON</a>: formatter, validator, tree viewer and diff.</li>
${related}
        <li><a href="/json-web-token/">JWT Decoder</a>: decode and inspect JSON Web Tokens.</li>
      </ul>
    </section>

    <section id="faq">
      <h2>Frequently asked questions</h2>
${faq}
    </section>
  </article>

`;

  const bodyTag = page.defaultTab ? `<body data-default-tab="${page.defaultTab}">` : '<body>';
  const out = head + bodyTag + body + article + footer +
    '  <script src="../js/i18n.js" defer></script>\n  <script src="../js/app.js" defer></script>\n</body>\n</html>\n';

  // Sanity checks so a template change cannot silently break a page
  [...out.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].forEach(m => JSON.parse(m[1]));
  if ((out.match(/<h1/g) || []).length !== 1) throw new Error(`${page.slug}: expected exactly one <h1>`);

  const dir = path.join(ROOT, page.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), out);
  console.log(`built /${page.slug}/  (${out.length} bytes)`);
}

pages.forEach(build);
