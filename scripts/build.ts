import { mkdirSync, copyFileSync, existsSync } from "fs";
import { join, basename } from "path";

// ----------------------------
// Configuration
// ----------------------------
const OUT_DIR = join(process.cwd(), "out");
mkdirSync(OUT_DIR, { recursive: true });

// ----------------------------
// Copy homepage
// ----------------------------
const homepageSrc = join(".", "homepage.html");
const homepageDest = join(OUT_DIR, "index.html");
if (existsSync(homepageSrc)) {
  copyFileSync(homepageSrc, homepageDest);
  console.log(`Copied homepage to ${homepageDest}`);
} else {
  console.warn(`Homepage not found: ${homepageSrc}`);
}

// ----------------------------
// Copy slides / notes
// ----------------------------
const slidesDir = join(".", "slides");
import { readdirSync, statSync } from "fs";

for (const dir of readdirSync(slidesDir)) {
  const slidePath = join(slidesDir, dir, "main.html");
  if (existsSync(slidePath) && statSync(join(slidesDir, dir)).isDirectory()) {
    const destDir = join(OUT_DIR, dir);
    mkdirSync(destDir, { recursive: true });
    copyFileSync(slidePath, join(destDir, "index.html"));
    console.log(`Copied slide ${slidePath} to ${join(destDir, "index.html")}`);
  }
}

console.log("All HTML files copied to out/ folder, ready for GitHub Pages deployment.");
