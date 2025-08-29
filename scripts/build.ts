import { mkdirSync, copyFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

// ----------------------------
// Configuration
// ----------------------------
const OUT_DIR = "out";
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

function copyImages(srcDir: string, destDir: string) {
  mkdirSync(destDir, { recursive: true });
  for (const entry of readdirSync(srcDir)) {
    const srcPath = join(srcDir, entry);
    const destPath = join(destDir, entry);
    const stats = statSync(srcPath);
    if (stats.isDirectory()) {
      copyImages(srcPath, destPath); // recursively handle subdirectories
    } else if (entry.endsWith(".svg") || entry.endsWith(".png")) {
      copyFileSync(srcPath, destPath);
      console.log(`Copied ${srcPath} to ${destPath}`);
    }
  }
}

for (const dir of readdirSync(slidesDir)) {
  const slidePath = join(slidesDir, dir);
  const htmlFile = join(slidePath, "main.html");

  if (existsSync(htmlFile) && statSync(slidePath).isDirectory()) {
    const destDir = join(OUT_DIR, dir);
    mkdirSync(destDir, { recursive: true });
    copyFileSync(htmlFile, join(destDir, "index.html"));
    console.log(`Copied slide ${htmlFile} to ${join(destDir, "index.html")}`);

    // Copy only SVG and PNG images if folder exists
    const imagesSrc = join(slidePath, "images");
    const imagesDest = join(destDir, "images");
    if (existsSync(imagesSrc) && statSync(imagesSrc).isDirectory()) {
      copyImages(imagesSrc, imagesDest);
    }
  }
}

console.log("All HTML files and relevant images copied to out/ folder, ready for GitHub Pages deployment.");
