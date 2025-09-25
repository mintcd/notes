// scripts/build.ts
import { existsSync, readdirSync, statSync, copyFileSync } from "fs";
import { join, resolve } from "path";
import { buildSlidesAt } from "./tikz-to-svg.ts";

// ----------------------------
// Parse CLI args
// ----------------------------
// Usage examples:
//   node scripts/build.ts
//   node scripts/build.ts lecture01
//   node scripts/build.ts lecture01 lecture02
//   node scripts/build.ts lecture01,lecture02
//   node scripts/build.ts --only lecture01,lecture02
function parseTargets(argv: string[]): string[] | null {
  const raw = argv.filter(a => !a.startsWith("--only=") && a !== "--only");
  const flagEq = argv.find(a => a.startsWith("--only="));
  const flagBareIdx = argv.indexOf("--only");
  const fromEq = flagEq ? flagEq.slice("--only=".length) : "";
  const fromBare = flagBareIdx >= 0 && argv[flagBareIdx + 1] ? argv[flagBareIdx + 1] : "";

  const pieces: string[] = [];
  const pushCSV = (s: string) => {
    if (!s) return;
    for (const p of s.split(",").map(x => x.trim()).filter(Boolean)) pieces.push(p);
  };

  for (const a of raw) pushCSV(a);
  pushCSV(fromEq);
  pushCSV(fromBare);

  if (pieces.length === 0) return null;
  return [...new Set(pieces)];
}

const targets = parseTargets(process.argv.slice(2));

// ----------------------------
// Build in place (no "out/" dir)
// ----------------------------
const slidesRoot = resolve("slides");
if (!existsSync(slidesRoot) || !statSync(slidesRoot).isDirectory()) {
  console.error(`Slides directory not found: ${slidesRoot}`);
  process.exit(1);
}

let foldersToBuild: string[];
if (targets) {
  const missing: string[] = [];
  foldersToBuild = targets
    .map(name => join(slidesRoot, name))
    .filter(abs => {
      const ok = existsSync(abs) && statSync(abs).isDirectory();
      if (!ok) missing.push(abs);
      return ok;
    });
  if (missing.length) {
    console.warn(`Requested slide folder(s) not found:\n - ${missing.join("\n - ")}`);
  }
  if (foldersToBuild.length === 0) {
    console.warn("No matching slide folders to build. Nothing to do.");
    process.exit(0);
  }
} else {
  foldersToBuild = readdirSync(slidesRoot)
    .map(name => join(slidesRoot, name))
    .filter(abs => existsSync(abs) && statSync(abs).isDirectory());
}

// Run the TikZ→SVG→HTML pipeline per folder (produces <folder>/index.html)
for (const absFolder of foldersToBuild) {
  buildSlidesAt(absFolder);
}

// ----------------------------
// Optional: promote homepage.html -> ./index.html
// ----------------------------
const homepageSrc = resolve("homepage.html");
const homepageDest = resolve("index.html");
if (existsSync(homepageSrc)) {
  copyFileSync(homepageSrc, homepageDest);
  console.log(`Copied homepage to ${homepageDest}`);
}

console.log("Build complete (in-place).");
