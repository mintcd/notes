import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync, statSync } from "fs";
import { spawnSync } from "child_process";
import { dirname, resolve, join, basename } from "path";
import { fileURLToPath } from "url";

function run(cmd: string, args: string[], cwd?: string) {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"], // don’t spam console
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.toString() ?? "";
    const stdout = result.stdout?.toString() ?? "";
    throw new Error(
      `${cmd} failed with code ${result.status}\n` +
      (stderr || stdout || "(no output)")
    );
  }
}

function tikzTex(block: string): string {
  return `\\documentclass[tikz,border=2pt]{standalone}
  \\usepackage[T1]{fontenc}
  \\usepackage{lmodern}
  \\usepackage{tikz}
  \\usepackage{amsmath}
  % no quotes here; prefer arrows.meta over arrows
  \\usetikzlibrary{arrows.meta,automata,positioning,calc,decorations.pathmorphing,shapes.geometric}
  \\begin{document}
  ${block}
  \\end{document}
  `.trimStart();
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

function cleanTikzArtifacts(imageDir: string) {
  try {
    const entries = readdirSync(imageDir);
    for (const name of entries) {
      const p = join(imageDir, name);
      if (statSync(p).isDirectory()) continue;
      // Keep only final SVGs; remove other artifacts produced by latex/dvisvgm.
      const isTikz = /^tikz-\d+\./.test(name);
      const isSvg = name.endsWith(".svg");
      if (isTikz && !isSvg) {
        try { unlinkSync(p); } catch { /* ignore */ }
      }
    }
  } catch (e) {
    console.warn('Warning: could not clean artifacts in ' + imageDir + ':', e);
  }
}


export default function texToHtml(
  folderPath: string,
  texFile = "main.tex",
  outputFile = "index.html"
) {
  const abs = resolve(folderPath);
  const texPath = join(abs, texFile).replace(/\\/g, "/");
  const tempTex = join(folderPath, `${texFile.replace(/\.tex$/i, "")}-temp.tex`);


  if (!existsSync(texPath)) {
    throw new Error(`File not found: ${texPath}`);
  }

  console.log(`\nProcessing: ${texPath}`);
  const imageDir = join(folderPath, "images");
  mkdirSync(imageDir, { recursive: true });

  // Inline includes to a single TeX string
  const texString = inlineIncludes(texPath);

  // Extract TikZ blocks
  const tikzBlocks = [
    ...texString.matchAll(/\\begin{tikzpicture}([\s\S]*?)\\end{tikzpicture}/g),
  ].map((m) => m[0]);

  // Compile each TikZ block to SVG (with real, selectable text)
  if (tikzBlocks.length === 0) {
    console.log("No TikZ blocks found.");
  } else {
    tikzBlocks.forEach((block, i) => {
      const tex = tikzTex(block);

      const base = join(imageDir, `tikz-${i + 1}`);
      const texOut = `${base}.tex`;
      writeFileSync(texOut, tex, "utf8");

      // DVI
      run("latex", [
        "-interaction=nonstopmode",
        "-halt-on-error",
        "-output-directory",
        resolve(imageDir),
        resolve(texOut),
      ]);

      // SVG with embedded WOFF2 (keeps <text> selectable)
      const dviFile = `${base}.dvi`;
      const svgFile = `${base}.svg`;
      run("dvisvgm", ["--font-format=woff2", "--exact", resolve(dviFile), "-o", resolve(svgFile)]);
      console.log(`Saved SVG: ${svgFile}`);
    });
  }

  // Replace TikZ blocks with \includegraphics
  let idx = 0;
  const texForPandoc = texString.replace(
    /\\begin{tikzpicture}[\s\S]*?\\end{tikzpicture}/g,
    () => {
      idx++;
      return `\\includegraphics{images/tikz-${idx}.svg}`;
    }
  );
  writeFileSync(tempTex, texForPandoc, "utf8");
  console.log(`Prepared LaTeX for Pandoc: ${tempTex}`);

  // 5) Pandoc -> HTML
  const bibPath = join(folderPath, "refs.bib");
  const outputHtml = join(folderPath, outputFile);
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const filterPath = join(__dirname, "injectTheoremId.lua");
  const folderName = basename(folderPath);
  const htmlTitle = folderName.replace(/[-_]+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
  const pandocArgs = [
    tempTex,
    "--citeproc",
    ...(existsSync(bibPath) ? ["--bibliography", bibPath] : []),
    "--number-sections",
    "--lua-filter", filterPath,
    "--metadata", `pagetitle=${htmlTitle}`,
    "--toc", "--toc-depth=3",
    "-t", "html5",
    "-s",
    "--katex",
    "-o", outputHtml,
  ];
  run("pandoc", pandocArgs);

  // 6) Post-process: inline the SVGs into HTML
  let html = readFileSync(outputHtml, "utf8");
  html = html.replace(
    /<img\s+[^>]*src=["'](images\/tikz-(\d+)\.svg)["'][^>]*>/gi,
    (_match, relSrc: string) => {
      const svgPath = join(folderPath, relSrc);
      if (!existsSync(svgPath)) return _match;

      // Read and sanitize SVG (remove XML/DOCTYPE so it's valid inside HTML)
      let svg = readFileSync(svgPath, "utf8");
      svg = svg
        .replace(/<\?xml[^>]*>\s*/i, "")
        .replace(/<!DOCTYPE[^>]*>\s*/i, "")
        .trim();

      // Ensure it has the SVG namespace (most do, but just in case)
      if (!/\sxmlns=/.test(svg)) {
        svg = svg.replace(/<svg\b/i, `<svg xmlns="http://www.w3.org/2000/svg"`);
      }
      return svg;
    }
  );

  writeFileSync(outputHtml, html, "utf8");
  console.log(`Inlined SVGs into ${outputHtml}`);

  // 7) Cleanup
  unlinkSync(tempTex);
  cleanTikzArtifacts(imageDir);

  console.log(`Done building slides under: ${abs}`);
}
