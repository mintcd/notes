-- injectTheoremId.lua
-- Version-agnostic: no pandoc.path; Windows-friendly.
-- Adds stable ids + data-number and (when possible) data-title to theorem-like Divs.
-- Recovers amsthm optional titles via a \thmtitle{...} shim rendered as leading bold text.

local input = (PANDOC_STATE and PANDOC_STATE.input_files and PANDOC_STATE.input_files[1]) or ""
local parent_dir = input:match("^(.*)[/\\]") or ""
local parent_name = parent_dir:match("([^/\\]+)$") or "doc"

-- Supported environments -> short aliases (extend as you like)
local env_alias = {
  theorem     = "thm",
  definition  = "defn",
  lemma       = "lem",
  proposition = "prop",
  corollary   = "cor",
  example     = "ex",
  remark      = "rem",
  proof       = "proof",
  conjecture  = "conj",
  claim       = "clm",
  assumption  = "assump",
  axiom       = "ax",
  notation    = "notn",
  observation = "obs",
  question    = "q",
  solution    = "sol",
  algorithm   = "alg",
  exercise    = "exer",
  problem     = "prob",
  fact        = "fact",
  property    = "prop2",
  hypothesis  = "hyp",
  case        = "case",
}

-- --------------------------------
-- Section / environment counters
-- --------------------------------
local secnums = {}
local env_counters = {}

local function secnum_string()
  if #secnums == 0 then return nil end
  return table.concat(secnums, ".")
end

local function reset_env_counters()
  env_counters = {}
end

function Header(h)
  -- maintain hierarchical counters similar to 1, 1.1, 1.2.3, ...
  while #secnums > h.level - 1 do table.remove(secnums) end
  while #secnums < h.level - 1 do table.insert(secnums, 0) end
  if #secnums == h.level - 1 then
    table.insert(secnums, 1)
  else
    secnums[#secnums] = (secnums[#secnums] or 0) + 1
  end
  reset_env_counters()
  return nil
end

-- --------------------------------
-- Helpers
-- --------------------------------
local function has_class(div, c)
  for _, cls in ipairs(div.classes) do
    if cls == c then return true end
  end
  return false
end

local function get_env_kind(div)
  for k, _ in pairs(env_alias) do
    if has_class(div, k) then return k end
  end
  return nil
end

-- Try common attribute keys where Pandoc may place a title (for non-LaTeX sources)
local function get_env_title_attribute(div)
  local attrs = div.attributes or {}
  local t = attrs.title or attrs.name or attrs.caption or attrs.heading
  if t and t ~= "" then return t end
  return nil
end

local function stringify_inlines(inls)
  -- pandoc.utils.stringify accepts Inlines/Blocks or plain Lua strings.
  return pandoc.utils.stringify(inls)
end

-- Utility: trim spaces and a single trailing "." or ":".
local function tidy_title(s)
  s = s:gsub("^%s+", ""):gsub("%s+$", "")
  s = s:gsub("[%s]*[%.:%s]$", "")  -- drop one trailing "." or ":" (with optional spaces)
  return s
end

-- Remove first k inlines from a paragraph node
local function remove_first_inlines(para, k)
  for _ = 1, k do table.remove(para.content, 1) end
end

-- Extract a leading bold "Title." (or \thmtitle{Title}) from the first paragraph.
-- Supports:
--  - Strong(...) possibly followed by "." and Space
--  - RawInline/Str token of form \thmtitle{...}
--  - \textbf{...} usually becomes Strong(...) already
local function extract_title_from_content(div)
  if not div.content or #div.content == 0 then return nil end

  -- Find first *paragraph-like* block (skip raw blocks, empty blocks, etc.)
  local first_idx, first = nil, nil
  for i, blk in ipairs(div.content) do
    if blk.t == "Para" or blk.t == "Plain" then
      first_idx, first = i, blk
      break
    end
  end
  if not first then return nil end

  local inls = first.content
  if not inls or #inls == 0 then return nil end

  -- Case A: starts with Strong(...)
  if inls[1].t == "Strong" and inls[1].content and #inls[1].content > 0 then
    local title_txt = stringify_inlines(inls[1].content)
    local remove_count = 1

    -- If next inline is a "." or ":" remove it too (common style)
    if inls[2] and inls[2].t == "Str" and (inls[2].text == "." or inls[2].text == ":") then
      remove_count = remove_count + 1
      if inls[3] and inls[3].t == "Space" then
        remove_count = remove_count + 1
      end
    else
      -- Or just strip a following Space
      if inls[2] and inls[2].t == "Space" then
        remove_count = remove_count + 1
      end
    end

    remove_first_inlines(first, remove_count)
    div.content[first_idx] = first

    title_txt = tidy_title(title_txt)
    if title_txt ~= "" then return title_txt end
  end

  -- Case B: \thmtitle{...} appears as RawInline (latex) or Str (rare)
  local function match_thmtitle_token(tok)
    if tok.t == "RawInline" and tok.format and tok.format:match("tex") then
      return tok.text:match("\\thmtitle%s*%{(.-)%}")
    end
    if tok.t == "Str" then
      return tok.text:match("\\thmtitle%s*%{(.-)%}")
    end
    return nil
  end

  local m = match_thmtitle_token(inls[1])
  if m and m ~= "" then
    -- remove the token and an optional following punctuation/space
    local remove_count = 1
    if inls[2] and inls[2].t == "Space" then
      remove_count = remove_count + 1
    end
    remove_first_inlines(first, remove_count)
    div.content[first_idx] = first

    m = tidy_title(m)
    if m ~= "" then return m end
  end

  return nil
end

local function assign_common_attrs(div, klass, number_str)
  div.attributes = div.attributes or {}
  div.attributes["data-number"] = number_str

  -- Prefer attributes (for Markdown/fenced Div sources)
  local title = get_env_title_attribute(div)
  -- Fallback: extract from rendered content (for LaTeX + amsthm via \thmtitle{...})
  if not title then
    title = extract_title_from_content(div)
  end

  if title and title ~= "" then
    div.attributes["data-title"] = title
  end
end

-- --------------------------------
-- Main Div handler
-- --------------------------------
function Div(div)
  local klass = get_env_kind(div)
  if not klass then return nil end

  -- bump counter for this environment within current section
  env_counters[klass] = (env_counters[klass] or 0) + 1
  local base = secnum_string()
  local n = env_counters[klass]
  local number_str = base and (base .. "." .. n) or tostring(n)

  -- keep existing id if present
  if div.identifier and div.identifier ~= "" then
    assign_common_attrs(div, klass, number_str)
    return div
  end

  -- build id from parent folder, environment, and number
  local slug = (parent_name:gsub("%s+", "-"):gsub("[^%w%-_%.]", ""):lower())
  local id = string.format("%s-%s-%s", slug, klass, number_str)
  div.identifier = id

  assign_common_attrs(div, klass, number_str)
  return div
end

--[[

USAGE NOTE (LaTeX + amsthm):

Pandoc does not expose the optional amsthm title [Title] in the AST.
To capture it, define in your LaTeX preamble:

  \newcommand{\thmtitle}[1]{\textbf{#1.}\ }

Then write:
  \begin{theorem}[\thmtitle{Lagrange's Theorem}]
    ...
  \end{theorem}

This filter will:
  1) Detect that leading bold heading (or the raw \thmtitle token),
  2) Remove it from the first paragraph of the theorem body,
  3) Set data-title="Lagrange's Theorem" on the theorem Div,
  4) Also set data-number like "2.3" and a stable id like "doc-thm-2.3".

For Markdown/fenced Divs, you can do:

  ::: theorem {#thm:lagrange title="Lagrange's Theorem"}
  Content...
  :::

and the attribute will be picked up directly.

]]
