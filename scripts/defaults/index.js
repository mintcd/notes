// ===== Theme switching with persistence (fixed & polished) =====
(() => {
  const KEY = "theme"; // 'light' | 'dark' | 'system'

  function currentSystemPrefersDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  function cycle(mode) {
    // light -> dark -> system -> light …
    if (mode === "light") return "dark";
    if (mode === "dark") return "system";
    return "light";
  }

  function labelForNext(mode) {
    const next = cycle(mode);
    return next === "dark" ? "🌙 Switch to Dark"
      : next === "light" ? "🌞 Switch to Light"
        : "💻 Use System";
  }

  function applyTheme(mode) {
    const targets = [document.documentElement, document.body];
    targets.forEach(t => {
      if (!t) return;
      if (mode === "dark") t.setAttribute("data-theme", "dark");
      else if (mode === "light") t.setAttribute("data-theme", "light");
      else t.removeAttribute("data-theme"); // system (let CSS/media decide)
    });
  }

  function initThemeToggle() {
    const saved = localStorage.getItem(KEY) || "system";
    applyTheme(saved);

    // create toggle button if it doesn't exist
    let btn = document.getElementById("theme-toggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "theme-toggle";
      btn.className = "theme-toggle";
      btn.type = "button";
      btn.title = "Toggle theme";
      btn.setAttribute("aria-live", "polite");
      document.body.appendChild(btn);
    }

    function updateButton(mode) {
      btn.textContent = labelForNext(mode); // show the *next* action
      const isDark = mode === "dark" || (mode === "system" && currentSystemPrefersDark());
      btn.setAttribute("aria-pressed", String(isDark));
    }

    updateButton(saved);

    btn.addEventListener("click", () => {
      const old = localStorage.getItem(KEY) || "system";
      const next = cycle(old);
      localStorage.setItem(KEY, next);
      applyTheme(next);
      updateButton(next);
    });

    // Keep in sync with system changes when in "system" mode
    if (window.matchMedia) {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        const mode = localStorage.getItem(KEY) || "system";
        if (mode === "system") {
          applyTheme("system");
          updateButton("system");
        }
      };
      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", onChange);
      } else if (typeof media.addListener === "function") {
        media.addListener(onChange);
      }
    }
  }

  // Ensure <body> exists before inserting button
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
})();


// ===== TOC: wrap Pandoc TOC and animate dropdown =====
(() => {
  const rawToc = document.getElementById("TOC");
  const host = document.getElementById("toc-sidebar");
  if (!rawToc || !host) return;

  // Build card if not already built
  if (!host.querySelector(".toc-card")) {
    const card = document.createElement("div");
    card.className = "toc-card";

    const header = document.createElement("div");
    header.className = "toc-header";
    header.innerHTML = `<span class="toc-caret">▶</span><span>Contents</span>`;

    const content = document.createElement("div");
    content.className = "toc-content";
    const inner = document.createElement("div");
    inner.className = "toc-inner";
    // Move the TOC list inside
    while (rawToc.firstChild) inner.appendChild(rawToc.firstChild);
    content.appendChild(inner);

    card.appendChild(header);
    card.appendChild(content);
    host.appendChild(card);

    // Start collapsed on small screens, open on large
    function wantsOpen() {
      return window.matchMedia("(min-width: 1000px)").matches;
    }
    function setOpen(open) {
      card.classList.toggle("toc-open", open);
      // height animation
      const target = open ? inner.scrollHeight : 0;
      content.style.height = target + "px";
    }

    // initialize
    setOpen(wantsOpen());

    // on resize, recompute desired state and height
    let resizeRAF = 0;
    window.addEventListener("resize", () => {
      cancelAnimationFrame(resizeRAF);
      resizeRAF = requestAnimationFrame(() => {
        const open = card.classList.contains("toc-open");
        // if large, force open; if small and untouched, keep collapsed
        if (wantsOpen()) setOpen(true);
        else setOpen(open); // preserve state, but recompute height
      });
    });

    // toggle on header click with smooth animation
    header.addEventListener("click", () => {
      const open = card.classList.toggle("toc-open");
      // measure -> animate
      const start = content.getBoundingClientRect().height;
      content.style.height = start + "px"; // freeze current height
      const end = open ? inner.scrollHeight : 0;
      // next frame apply target
      requestAnimationFrame(() => {
        content.style.height = end + "px";
      });
    });

    // After transition ends and when open, set to 'auto' for flexibility
    content.addEventListener("transitionend", () => {
      if (card.classList.contains("toc-open")) {
        content.style.height = "auto";
      }
    });
  }
})();


// ===== Optional: active link highlight while scrolling =====
(() => {
  const sidebar = document.getElementById("toc-sidebar");
  if (!sidebar) return;
  const links = Array.from(sidebar.querySelectorAll(".toc-inner a[href^='#']"));
  if (!links.length) return;

  const map = new Map();
  links.forEach(a => {
    const id = decodeURIComponent(a.getAttribute("href").slice(1));
    const el = document.getElementById(id);
    if (el) map.set(el, a);
  });

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      // find nearest heading above viewport top
      let best = null;
      let bestTop = -Infinity;
      map.forEach((a, el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= 100 && r.top > bestTop) { bestTop = r.top; best = a; }
      });
      links.forEach(a => a.classList.remove("is-active"));
      if (best) best.classList.add("is-active");
    });
  }

  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
