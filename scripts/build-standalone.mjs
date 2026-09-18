/**
 * Dev helper: builds the site with Vite, then inlines the JS/CSS/favicon
 * into one self-contained HTML file for sandboxed preview purposes.
 * Uses hash history (VITE_ROUTER_MODE=hash) because the sandboxed preview
 * server only serves the one file. Output: preview/standalone.html (gitignored)
 */
import { build } from "vite";
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";

process.env.VITE_ROUTER_MODE = "hash";
process.env.VITE_DOT_DEBUG = "true"; // expose window.__dotGrid physics hook
await build({ logLevel: "error" });

const html = readFileSync("dist/index.html", "utf8");

const jsFile = html.match(/<script[^>]*src="\/(assets\/[^"]+\.js)"/)?.[1];
const cssFile = html.match(/<link[^>]*rel="stylesheet"[^>]*href="\/(assets\/[^"]+\.css)"/)?.[1];
if (!jsFile || !cssFile) throw new Error("Could not locate built JS/CSS in dist/index.html");

let js = readFileSync(`dist/${jsFile}`, "utf8");

/**
 * Vite emits images over ~4KB as separate files under dist/assets, but this
 * preview is a single self-served file — so inline every image asset into
 * the JS as a base64 data URI before embedding it.
 */
const IMAGE_EXT = /(png|jpe?g|gif|webp|avif|svg)/;
const assetFiles = readdirSync("dist/assets");
const dataUriCache = new Map();
const toDataUri = (fileName) => {
  if (dataUriCache.has(fileName)) return dataUriCache.get(fileName);
  const ext = fileName.split(".").pop().toLowerCase();
  const mime = ext === "svg" ? "image/svg+xml" : `image/${ext === "jpg" ? "jpeg" : ext}`;
  const uri = `data:${mime};base64,${readFileSync(`dist/assets/${fileName}`).toString("base64")}`;
  dataUriCache.set(fileName, uri);
  return uri;
};
js = js.replace(/"(\/assets\/[A-Za-z0-9._-]+)"/g, (match, url) => {
  const name = url.slice("/assets/".length);
  const ext = name.split(".").pop().toLowerCase();
  return IMAGE_EXT.test(ext) && assetFiles.includes(name) ? JSON.stringify(toDataUri(name)) : match;
});

const css = readFileSync(`dist/${cssFile}`, "utf8");
const favicon = readFileSync("public/favicon.svg", "utf8").replace(
  /`/g,
  "\\`",
);

const inlined = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#050805" />
    <meta name="robots" content="index, follow" />
    <meta
      name="description"
      content="Personal website of a developer who likes terminals a bit too much. Projects live on GitHub."
    />
    <meta property="og:title" content="Home" />
    <meta
      property="og:description"
      content="Personal website of a software developer and long-time Linux user. Projects live on GitHub."
    />
    <meta property="og:type" content="website" />
    <link rel="icon" href="data:image/svg+xml,${encodeURIComponent(readFileSync("public/favicon.svg", "utf8"))}" />
    <title>Home</title>
    <style>
      html {
        background: #050805;
      }
    </style>
    <style>
${css}
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module">${js}</script>
  </body>
</html>
`;

mkdirSync("preview", { recursive: true });
writeFileSync("preview/standalone.html", inlined);
rmSync("dist", { recursive: true, force: true });
console.log("Wrote preview/standalone.html");
