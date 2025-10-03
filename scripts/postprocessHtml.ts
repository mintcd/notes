// scripts/postprocessHtml.ts
import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const CSS_MARK = "<!-- injected:styles.css -->";
const JS_MARK = "<!-- injected:index.js -->";

function readTextSafe(path: string): string | null {
  try {
    if (existsSync(path) && statSync(path).isFile()) return readFileSync(path, "utf8");
  } catch { }
  return null;
}

export default function postprocessHtml(folderPath: string, htmlFile = "index.html") {
  const htmlPath = statSync(folderPath).isDirectory()
    ? join(folderPath, htmlFile)
    : folderPath;

  console.log(`Post-processing HTML: ${htmlPath}`);

  let html = readFileSync(htmlPath, "utf8");
  const htmlDir = dirname(htmlPath);

  // 0) Remove Pandoc's body header if present
  html = html.replace(
    /<header[^>]*id=["']title-block-header["'][\s\S]*?<\/header>\s*/i,
    ""
  );

  // 1) Extract Pandoc #TOC
  const tocMatch = html.match(/<(nav|div)\s+id=["']TOC["'][^>]*>([\s\S]*?)<\/\1>/i);
  if (tocMatch && !html.includes('id="toc-sidebar"')) {
    const tocInner = tocMatch[2];
    html = html.replace(tocMatch[0], ""); // remove original TOC
    const tocSidebar = `
<nav class="toc-sidebar" id="toc-sidebar" aria-label="Table of contents">
  <details id="toc-details">
    <summary>Contents</summary>
    ${tocInner}
  </details>
</nav>`;
    html = html.replace(/<body[^>]*>/i, m => `${m}\n${tocSidebar}\n`);
  }

  // === FIX: get script directory robustly in ESM ===
  const scriptDir = dirname(fileURLToPath(import.meta.url)); // ✅

  // Prefer project-local styles/scripts, else defaults
  const projectCss = readTextSafe(join(htmlDir, "styles.css"));
  const projectJs = readTextSafe(join(htmlDir, "index.js"));
  const defaultCss = readTextSafe(join(scriptDir, "defaults", "styles.css")) || "";
  const defaultJs = readTextSafe(join(scriptDir, "defaults", "index.js")) || "";

  const css = projectCss ?? defaultCss;
  const js = projectJs ?? defaultJs;

  // 3) Ensure color-scheme meta
  if (!/name=["']color-scheme["']/i.test(html)) {
    html = html.replace(/<\/head>/i, `  <meta name="color-scheme" content="light dark">\n</head>`);
  }

  // 4) Inline CSS (idempotent)
  if (!html.includes(CSS_MARK)) {
    html = html.replace(
      /<\/head>/i,
      `${CSS_MARK}\n<style>\n${css}\n</style>\n</head>`
    );
  }

  // 5) Inline JS (idempotent)
  if (!html.includes(JS_MARK)) {
    html = html.replace(
      /<\/body>\s*<\/html>\s*$/i,
      `${JS_MARK}\n<script>\n${js}\n</script>\n</body>\n</html>`
    );
  }

  writeFileSync(htmlPath, html, "utf8");
}
