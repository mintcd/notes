import re
import subprocess
from pathlib import Path

# ----------------------------
# Configuration
# ----------------------------
ROOT_DIR = Path(".")  # Root folder to search for main.tex
SLIDES_DIR = ROOT_DIR / "slides"
LATEX = "latex"
DVISVGM = "dvisvgm"
TIKZ_LIBS = "arrows,automata,positioning,calc,decorations.pathmorphing,shapes.geometric"

PANDOC_CMD = "pandoc"
BIB_FILE = "refs.bib"
PANDOC_OPTIONS = ["--citeproc", "--bibliography", BIB_FILE, "-t", "revealjs", "-s", "--mathjax"]

# ----------------------------
# Function to inline \include and \input
# ----------------------------
def inline_includes(tex_path, visited=None):
    if visited is None:
        visited = set()
    if tex_path.resolve() in visited:
        return ""
    visited.add(tex_path.resolve())

    content = tex_path.read_text(encoding="utf-8")
    lines = content.splitlines()
    merged = []
    for line in lines:
        m = re.match(r'\\(include|input)\{(.+?)\}', line.strip())
        if m:
            cmd, inc_path = m.groups()
            inc_file = (tex_path.parent / f"{inc_path}.tex").resolve()
            if inc_file.exists():
                merged.append(inline_includes(inc_file, visited))
            else:
                print(f"Warning: included file {inc_file} not found, skipping")
        else:
            merged.append(line)
    return "\n".join(merged)

# ----------------------------
# Function to process one main.tex
# ----------------------------
def process_main_tex(main_tex: Path):
    print(f"\nProcessing: {main_tex}")
    output_dir = main_tex.parent / "tikz_images"
    output_dir.mkdir(exist_ok=True)
    final_tex = main_tex.parent / "main-temp.tex"

    # Inline all includes
    merged_content = inline_includes(main_tex)

    # Find all TikZ blocks
    tikz_blocks = re.findall(r"\\begin{tikzpicture}(.*?)\\end{tikzpicture}", merged_content, re.DOTALL)
    if not tikz_blocks:
        print("No TikZ blocks found.")
    else:
        for i, block in enumerate(tikz_blocks, start=1):
            tikz_tex_content = f"""
\\documentclass[tikz,border=2pt]{{standalone}}
\\usepackage{{tikz}}
\\usepackage{{amsmath}}
\\usetikzlibrary{{{TIKZ_LIBS}}}
\\begin{{document}}
\\begin{{tikzpicture}}
{block}
\\end{{tikzpicture}}
\\end{{document}}
"""
            tikz_file = output_dir / f"tikz_{i}.tex"
            tikz_file.write_text(tikz_tex_content, encoding="utf-8")

            # Compile to DVI
            subprocess.run([
                LATEX,
                "-interaction=nonstopmode",
                "-halt-on-error",
                "-output-directory", str(output_dir.resolve()),
                str(tikz_file.resolve())
            ], check=True)

            # Convert DVI to SVG
            dvi_file = output_dir / f"tikz_{i}.dvi"
            svg_file = output_dir / f"tikz_{i}.svg"
            subprocess.run([
                DVISVGM,
                "--no-fonts",
                str(dvi_file.resolve()),
                "-o",
                str(svg_file.resolve())
            ], check=True)
            print(f"Saved SVG: {svg_file}")

    # Replace TikZ with \includegraphics
    def replace_tikz(match, idx=[0]):
        idx[0] += 1
        return f'\\includegraphics{{tikz_images/tikz_{idx[0]}.svg}}'

    final_content = re.sub(r"\\begin{tikzpicture}.*?\\end{tikzpicture}", replace_tikz, merged_content, flags=re.DOTALL)
    final_tex.write_text(final_content, encoding="utf-8")
    print(f"Prepared LaTeX for Pandoc: {final_tex}")

    # ----------------------------
    # Run Pandoc
    # ----------------------------
    bib_path = main_tex.parent / "refs.bib"
    output_html = main_tex.parent / "main.html"
    subprocess.run([
        PANDOC_CMD,
        str(final_tex),
        "--citeproc",
        "--bibliography", str(bib_path),
        "-t", "revealjs",
        "-s",
        "--mathjax",
        "-o", str(output_html)
    ], check=True)

# ----------------------------
# Main loop: find all main.tex files
# ----------------------------
for main_tex in SLIDES_DIR.rglob("main.tex"):
    process_main_tex(main_tex)

print("\nAll TikZ images converted and HTML slides generated for each main.tex!")
