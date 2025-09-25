// scripts/tikz-to-svg.ts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { spawnSync } from "child_process";
import { dirname, resolve, join } from "path";
import { glob } from "glob";

// ----------------------------
// Configuration
// ----------------------------
const LATEX = "latex";
const DVISVGM = "dvisvgm";
const TIKZ_LIBS =
  "arrows,automata,positioning,calc,decorations.pathmorphing,shapes.geometric";
const PANDOC_CMD = "pandoc";
const BIB_FILE = "refs.bib";

// ----------------------------
// Helpers
// ----------------------------
function run(cmd: string, args: string[], cwd?: string) {
  const result = spawnSync(cmd, args, { stdio: "inherit", cwd });
  if (result.status !== 0) {
    throw new Error(`${cmd} failed with code ${result.status}`);
  }
}

function inlineIncludes(texPath: string, visited = new Set<string>()): string {
  const absPath = resolve(texPath);
  if (visited.has(absPath)) return "";
  visited.add(absPath);

  const content = readFileSync(texPath, "utf8");
  const lines = content.split(/\r?\n/);
  const merged: string[] = [];

  const includeRegex = /\\(include|input)\{(.+?)\}/;

  for (const line of lines) {
    const m = line.trim().match(includeRegex);
    if (m) {
      const incPath = m[2];
      const incFile = resolve(dirname(texPath), `${incPath}.tex`);
      if (existsSync(incFile)) {
        merged.push(inlineIncludes(incFile, visited));
      } else {
        console.warn(`Warning: included file ${incFile} not found, skipping`);
      }
    } else {
      merged.push(line);
    }
  }
  return merged.join("\n");
}

function processMainTex(mainTex: string) {
  console.log(`\nProcessing: ${mainTex}`);
  const parentDir = dirname(mainTex);
  const outputDir = join(parentDir, "images");
  mkdirSync(outputDir, { recursive: true });

  const finalTex = join(parentDir, "main-temp.tex");

  // Inline includes
  const mergedContent = inlineIncludes(mainTex);

  // Extract TikZ blocks
  const tikzBlocks = [
    ...mergedContent.matchAll(
      /\\begin{tikzpicture}([\s\S]*?)\\end{tikzpicture}/g,
    ),
  ].map((m) => m[1]);

  if (tikzBlocks.length === 0) {
    console.log("No TikZ blocks found.");
  } else {
    tikzBlocks.forEach((block, i) => {
      const tikzTexContent = `
\\documentclass[tikz,border=2pt]{standalone}
\\usepackage{tikz}
\\usepackage{amsmath}
\\usetikzlibrary{${TIKZ_LIBS}}
\\begin{document}
\\begin{tikzpicture}
${block}
\\end{tikzpicture}
\\end{document}
`;
      const tikzFile = join(outputDir, `tikz_${i + 1}.tex`);
      writeFileSync(tikzFile, tikzTexContent, "utf8");

      // Compile to DVI
      run(LATEX, [
        "-interaction=nonstopmode",
        "-halt-on-error",
        "-output-directory",
        resolve(outputDir),
        resolve(tikzFile),
      ]);

      // Convert DVI to SVG
      const dviFile = join(outputDir, `tikz_${i + 1}.dvi`);
      const svgFile = join(outputDir, `tikz_${i + 1}.svg`);
      run(DVISVGM, ["--no-fonts", resolve(dviFile), "-o", resolve(svgFile)]);
      console.log(`Saved SVG: ${svgFile}`);
    });
  }

  // Replace TikZ blocks with \includegraphics
  let idx = 0;
  const finalContent = mergedContent.replace(
    /\\begin{tikzpicture}[\s\S]*?\\end{tikzpicture}/g,
    () => {
      idx++;
      return `\\includegraphics{images/tikz_${idx}.svg}`;
    },
  );
  writeFileSync(finalTex, finalContent, "utf8");
  console.log(`Prepared LaTeX for Pandoc: ${finalTex}`);

  // Run Pandoc -> write in-place as index.html
  const bibPath = join(parentDir, BIB_FILE);
  const outputHtml = join(parentDir, "index.html");
  const pandocArgs = [
    finalTex,
    "--citeproc",
    ...(existsSync(bibPath) ? ["--bibliography", bibPath] : []),
    "-t",
    "html5",
    "-s",
    "--mathjax",
    "-o",
    outputHtml,
  ];
  run(PANDOC_CMD, pandocArgs);
}

/**
 * Build all slide decks located under `folderPath`.
 *
 * Accepts absolute or relative path.
 *   buildSlidesAt("slides/lecture01") -> writes slides/lecture01/index.html
 *   buildSlidesAt("slides")           -> builds every subdir with main.tex
 */
export function buildSlidesAt(folderPath: string) {
  const abs = resolve(folderPath);
  const mainFiles = glob.sync(`${abs.replace(/\\/g, "/")}/**/main.tex`);
  if (mainFiles.length === 0) {
    console.warn(`No main.tex files found under: ${abs}`);
    return;
  }
  console.log(`Found ${mainFiles.length} main.tex file(s) under ${abs}.`);
  for (const mainTex of mainFiles) {
    processMainTex(mainTex);
  }
  console.log(`Done building slides under: ${abs}`);
}
