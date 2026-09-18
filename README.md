# Terminal-styled personal site

A green-on-black personal website with a cathode-terminal mood. Vue 3 +
TypeScript + Vite, no UI libraries.

- Typewriter headline ("Hello, mate") with blinking block cursor
- Interactive dot-grid background: every dot strains toward the cursor on a
  spring but stays clamped inside its own grid cell, so the grid never loses
  its shape; the closest dots connect to the cursor with glowing lines
- Projects button → GitHub, socials buttons (X, Discord, Email)
- Bold 404 page
- `public/robots.txt` that explicitly welcomes search engines and LLM crawlers

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build        # typechecks (vue-tsc) then builds to dist/
npm run preview      # serve the production build locally
```

## Make it yours

Edit **`src/config.ts`** — it holds the handle, tagline, intro, about text,
GitHub URL and social links. Also update the `<meta>` description in
`index.html` to match.

The typewriter speed, dot-grid density/reach/glow and CRT scanline intensity
are tweakable via the `config` objects at the top of
`src/components/TypewriterText.vue` and `src/components/DotGridBackground.vue`,
and the CSS variables at the top of `src/style.css`.

## Preview sandbox build

`npm run build:standalone` produces `preview/standalone.html` — a single file
with everything inlined, using hash routing. Handy for sharing a demo or
testing without a server; not needed for deployment.

## Deploying

`npm run build` outputs static files in `dist/`. Any static host works
(GitHub Pages, Netlify, Vercel, Cloudflare Pages). For clean URLs on
GitHub Pages/Netlify, add a `404.html` copy of `dist/index.html` so unknown
paths render the 404 page:

```bash
cp dist/index.html dist/404.html
```
