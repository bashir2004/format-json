# Format JSON — Free Online JSON Formatter, Validator & Beautifier

**[format-json.net](https://www.format-json.net/)** is a fast, privacy-first JSON toolkit that runs entirely in your browser. No server uploads, no accounts, no tracking beyond basic analytics. Paste your JSON, and every operation — formatting, validation, diffing, exporting — happens locally on your device.

---

## Why another JSON formatter?

Most online JSON tools have one or more of these problems: they upload your data to a server, they're slow on large payloads, or they do one thing and nothing else. This tool was built to fix all three. It handles multi-megabyte JSON without freezing, it never sends your data anywhere, and it covers the full workflow a developer actually needs — not just pretty-printing, but validating, navigating, comparing, and exporting.

---

## Live Tool

**[https://www.format-json.net/](https://www.format-json.net/)**  
Also available at: [https://www.format-json.net/json-prettier/](https://www.format-json.net/json-prettier/)

---

## What it does

### Format & Beautify JSON

Paste minified or poorly indented JSON and click **Format** (or `Ctrl+Shift+F`) to get clean, readable output with consistent 2-space indentation.

Before:
```json
{"user":{"id":1,"name":"Alice","roles":["admin","editor"],"active":true}}
```

After:
```json
{
  "user": {
    "id": 1,
    "name": "Alice",
    "roles": [
      "admin",
      "editor"
    ],
    "active": true
  }
}
```

---

### Validate JSON & Pinpoint Errors

Real-time validation underlines syntax errors as you type, with a message that names the exact line and column. The most common mistakes it catches:

- **Trailing commas** — `[1, 2, 3,]` is invalid JSON (it is valid JavaScript, which causes confusion)
- **Single quotes** — JSON requires double quotes for all strings and keys
- **Unquoted keys** — `{name: "Alice"}` is a JavaScript object literal, not JSON
- **Comments** — JSON has no comment syntax; `// ...` and `/* ... */` will cause parse errors
- **`undefined` values** — `undefined` is not a valid JSON value; use `null`

Example of a common mistake the validator catches immediately:

```json
{
  "status": "ok",
  "results": [
    {"id": 1, "value": 42},
    {"id": 2, "value": 99},   ← trailing comma — invalid
  ]
}
```

---

### Minify JSON

Strips all whitespace to produce the smallest valid representation — useful before embedding JSON in environment variables, HTTP request bodies, or configuration strings where byte size matters.

```json
{"status":"ok","results":[{"id":1,"value":42},{"id":2,"value":99}]}
```

`Ctrl+Shift+M` to minify directly from the keyboard.

---

### Interactive Tree Viewer

Switch to the **Tree Viewer** tab to explore deeply nested structures without scrolling through raw text. Every node is collapsible. Click any value to copy it to the clipboard. A breadcrumb trail at the top shows your current path inside the document — useful when you are three levels deep inside a large API response.

The tree also supports a **table view** for arrays of objects. Instead of expanding each item individually, the array renders as a spreadsheet-style table, which makes it much faster to spot patterns or compare values across records.

---

### JSON Diff

The **Diff** tab lets you paste two JSON documents and compare them side-by-side. Added keys are highlighted in green, removed keys in red, changed values in amber. It normalises key order before diffing, so a difference in property ordering does not show up as a change — only actual value differences do.

This is especially useful when comparing:
- API responses across environments (dev vs. staging vs. production)
- Configuration snapshots before and after a deployment
- Two versions of a schema

---

### Code Generator

The **Code Gen** tab takes any valid JSON and generates ready-to-use type definitions or data structures in multiple languages:

- **TypeScript** — interfaces with inferred types
- **Python** — `TypedDict` definitions
- **Go** — structs with `json:"..."` tags
- **Rust** — `serde`-compatible structs

If you frequently receive a JSON payload and need to write a matching type, this tab saves the tedious manual work.

---

### Export Options

From either the editor or tree view, you can export the current document as:

| Format | Use case |
|---|---|
| Formatted JSON | Human-readable copy for documentation or code review |
| Minified JSON | Compact copy for production use |
| CSV | When the JSON is an array of flat objects; useful for opening in Excel or Google Sheets |
| YAML | Configuration files, Kubernetes manifests, CI/CD pipelines |

---

### Load JSON from a URL

The **URL** button fetches JSON directly from a remote endpoint into the editor. Useful for quickly inspecting a public API response without writing a fetch call or switching to curl. Note: the request goes from your browser (not from a server), so CORS restrictions apply the same way they would for any browser fetch.

---

## Input methods

| Method | How |
|---|---|
| Paste | Click the editor, paste with `Ctrl+V` |
| Drag and drop | Drag a `.json` or `.txt` file onto the editor |
| File picker | Click **Import** and select a file |
| URL fetch | Click **URL**, enter an endpoint, press Enter |

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+F` | Format / Beautify |
| `Ctrl+Shift+M` | Minify |
| `Tab` | Insert 2 spaces (in editor) |
| `Ctrl+F` | Search within the tree view |

---

## Privacy

All JSON processing happens in your browser via the JavaScript engine. Nothing is ever sent to a server. The source is open and auditable in this repository. The only external request the page makes is to Google Tag Manager for anonymous usage analytics — no JSON content is included in those requests.

This matters in practice. If you are working with API keys, credentials, PII, or internal configuration data, you should not paste it into an online tool that processes it server-side. This tool has no server-side processing.

---

## PWA — Works offline

The tool is installable as a Progressive Web App. After the first load, the service worker caches all assets. You can add it to your home screen or desktop and use it without a network connection. The cache is versioned; when the tool is updated, the service worker fetches new assets automatically on next load.

---

## Running Locally

No build step. No package manager. Open `index.html` in a browser.

For the service worker and PWA to function correctly, serve over HTTP (not the `file://` protocol):

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code — right-click index.html → Open with Live Server
```

---

## Tech Stack

- Pure HTML5, CSS3, and vanilla JavaScript — no frameworks, no build tools, no npm
- CSS custom properties for theming; system preference respected via `prefers-color-scheme`
- Service Worker with explicit cache versioning for offline PWA support
- Zero third-party runtime dependencies

---

## Deployment

Any static host works: GitHub Pages, Cloudflare Pages, Netlify, Vercel, S3 + CloudFront, or any web server that can serve static files.

The current production deployment uses Cloudflare Workers static asset routing (`wrangler.jsonc`).

---

## Common JSON formatting questions

**What is the difference between JSON and JavaScript object literals?**  
JSON is a strict data interchange format. Unlike JavaScript object literals, JSON requires all keys and string values to use double quotes, does not allow trailing commas, does not allow `undefined`, and has no comment syntax. The validator in this tool flags all of these specifically.

**Why does `JSON.parse()` throw but my object looks fine?**  
The most frequent cause is a trailing comma after the last item in an array or object. Browsers accept this in JavaScript object literals but `JSON.parse()` follows the JSON spec strictly. Paste your string into the validator to find the exact position.

**When should I minify JSON?**  
Minification reduces payload size for HTTP responses (though `Content-Encoding: gzip` usually achieves better compression on repetitive JSON). It also helps when embedding JSON as a string inside another format, such as an environment variable or a Terraform variable file, where whitespace and line breaks would be disruptive.

**How do I convert JSON to CSV?**  
The export menu includes a CSV option that works when the root JSON value is an array of objects with consistent keys. Each object becomes a row; keys become column headers. If the objects have nested values, those are serialised as JSON strings in the cell.

---

## License

MIT
