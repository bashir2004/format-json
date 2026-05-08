# JSON Viewer

A fast, privacy-first, modern online JSON viewer. Zero dependencies, 100% client-side.

## Features

- **Interactive Tree Viewer** — expand/collapse nodes, click values to copy, breadcrumb navigation
- **Syntax-aware Editor** — line numbers, real-time validation, error messages with position
- **Format & Minify** — one-click beautify or compress
- **Search** — find keys/values in the tree with prev/next navigation
- **JSON Diff** — compare two JSON documents side-by-side
- **Multiple Input Methods** — paste, drag-and-drop files, import from file picker, or fetch from URL
- **Export** — download as formatted JSON, minified JSON, CSV (for arrays), or YAML
- **Dark/Light Theme** — respects system preference, toggleable
- **PWA** — installable as a desktop/mobile app, works offline
- **Responsive** — works on mobile screens
- **Private** — all processing happens in your browser; nothing is sent to any server

## Running Locally

Just open `index.html` in a browser. No build step, no `npm install`, no server required.

For the PWA and service worker to function, serve with any static file server:

```bash
# Python
python -m http.server 8000

# Node.js (npx)
npx serve .

# VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+F` | Format / Beautify |
| `Ctrl+Shift+M` | Minify |
| `Tab` | Insert 2 spaces (in editor) |

## Tech Stack

- Pure HTML5 + CSS3 + vanilla JavaScript
- No frameworks, no build tools, no dependencies
- CSS custom properties for theming
- Service Worker for offline PWA support

## Deployment

Deploy to any static hosting: GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3, etc.

## License

MIT
