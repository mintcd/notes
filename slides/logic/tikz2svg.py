import re
import subprocess
from pathlib import Path
import sys

# ----------------------------
# Configuration
# ----------------------------
main_tex = Path("main.tex")                 # Main LaTeX file
output_dir = Path("tikz_images")           # Directory for SVGs
output_dir.mkdir(exist_ok=True)
final_tex = Path("main-temp.tex")  # Output LaTeX for Pandoc

# Paths to LaTeX executables (adjust if necessary)
LATEX = "latex"
DVISVGM = "dvisvgm"

# TikZ libraries to include
TIKZ_LIBS = "arrows,automata,positioning,calc,decorations.pathmorphing,shapes.geometric"

# ----------------------------
# Step 1: Inline all includes
# ----------------------------
def inline_includes(tex_path, visited=None):
    if visited is None:
        visited = set()
    if tex_path.resolve() in visited:
        return ""  # prevent infinite recursion
    visited.add(tex_path.resolve())

    content = tex_path.read_text(encoding="utf-8")
    lines = content.splitlines()
    merged = []
    for line in lines:
        m = re.match(r'\\(include|input)\{(.+?)\}', line.strip())
        if m:
            cmd, inc_path = m.groups()
            # resolve relative path
            inc_file = (tex_path.parent / f"{inc_path}.tex").resolve()
            if inc_file.exists():
                merged.append(inline_includes(inc_file, visited))
            else:
                print(f"Warning: included file {inc_file} not found, skipping")
        else:
            merged.append(line)
    return "\n".join(merged)

merged_content = inline_includes(main_tex)

# ----------------------------
# Step 2: Find all TikZ environments
# ----------------------------
tikz_blocks = re.findall(r"\\begin{tikzpicture}(.*?)\\end{tikzpicture}", merged_content, re.DOTALL)
if not tikz_blocks:
    print("No TikZ blocks found.")

# ----------------------------
# Step 3: Compile TikZ to selectable SVG
# ----------------------------
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

    # Convert DVI to SVG (selectable text)
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

# ----------------------------
# Step 4: Replace TikZ blocks with \includegraphics
# ----------------------------
def replace_tikz(match, idx=[0]):
    idx[0] += 1
    return f'\\includegraphics{{tikz_images/tikz_{idx[0]}.svg}}'

final_content = re.sub(r"\\begin{tikzpicture}.*?\\end{tikzpicture}", replace_tikz, merged_content, flags=re.DOTALL)

# ----------------------------
# Step 5: Write final LaTeX
# ----------------------------
final_tex.write_text(final_content, encoding="utf-8")
print(f"\nPrepared LaTeX for Pandoc: {final_tex}")
print("All TikZ images converted to selectable SVG and LaTeX ready for HTML!")
