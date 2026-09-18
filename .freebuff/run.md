# Run doc — terminal personal site (Vue 3 + Vite)

Static, dependency-light project. The Preview tab uses the **standalone HTML
mode**: a single self-contained file, no server process needed.

## How to reproduce the artifacts

`preview/standalone.html` is generated (it is gitignored). To rebuild it:

```powershell
npm install          # only if node_modules is missing
npm run build:standalone
```

That script (`scripts/build-standalone.mjs`) builds with Vite (hash router +
`window.__dotGrid` debug hook enabled via env vars), inlines the JS/CSS/
favicon into one file, and writes `preview/standalone.html`.

The normal production build remains `npm run build` → `dist/`.

## How to run / preview

- **Preview tab (current mode)**: register `E:\programming\personal\preview\standalone.html`
  with `register_preview { htmlPath }`. No process, port, or install needed —
  the file must be regenerated after any source change (command above).
- **Dev server (live reload, optional)**: `npm run dev` → serves on Vite's
  default port 5173 (adapt with `-- --port <free-port>` if taken). Register
  with `register_preview { url, pid }`.
- **Production check**: `npm run preview` serves `dist/` (port 4173).
