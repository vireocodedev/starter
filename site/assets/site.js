const root = document.documentElement;

function readStorage(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* preferences are optional */
  }
}

const storedTheme = readStorage("vireo-docs-theme");
if (storedTheme === "light" || storedTheme === "dark") root.dataset.theme = storedTheme;
const themeToggle = document.querySelector("[data-theme-toggle]");
const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");
const currentThemeIsDark = () =>
  root.dataset.theme === "dark" || (root.dataset.theme !== "light" && Boolean(systemTheme?.matches));
function syncThemeToggle() {
  if (!themeToggle) return;
  const target = currentThemeIsDark() ? "light" : "dark";
  themeToggle.dataset.themeTarget = target;
  themeToggle.setAttribute("aria-label", `Use ${target} theme`);
  themeToggle.setAttribute("title", `Use ${target} theme`);
}
syncThemeToggle();
systemTheme?.addEventListener("change", () => {
  if (root.dataset.theme === "system") syncThemeToggle();
});
themeToggle?.addEventListener("click", () => {
  const next = currentThemeIsDark() ? "light" : "dark";
  root.dataset.theme = next;
  writeStorage("vireo-docs-theme", next);
  syncThemeToggle();
});

for (const button of document.querySelectorAll("[data-copy-command]"))
  button.addEventListener("click", () => copy(button, button.getAttribute("data-copy-command") ?? ""));
for (const button of document.querySelectorAll("[data-copy-code]")) {
  const code = button.closest(".code-block")?.querySelector("code")?.textContent ?? "";
  button.addEventListener("click", () => copy(button, code));
}
async function copy(button, value) {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(value);
    button.textContent = "Copied";
  } catch {
    button.textContent = "Select and copy";
  }
  window.setTimeout(() => {
    button.textContent = original;
  }, 1600);
}

const navigationToggle = document.querySelector("[data-navigation-toggle]");
const navigationClose = document.querySelector("[data-navigation-close]");
const navigationPanel = document.querySelector("[data-navigation-panel]");
const drawerSiblings = [
  document.querySelector(".skip-link"),
  document.querySelector(".site-header"),
  document.querySelector(".docs-main"),
  document.querySelector(".site-footer"),
  document.querySelector("[data-search-dialog]"),
].filter(Boolean);
const desktopNavigation = window.matchMedia?.("(min-width: 821px)");
let lastNavigationTrigger = null;
const navigationIsOpen = () => navigationPanel?.getAttribute("data-open") === "true";
function setNavigationOpen(open, trigger = navigationToggle, restoreFocus = true) {
  if (!navigationPanel || !navigationToggle) return;
  if (open && desktopNavigation?.matches) return;
  navigationPanel.setAttribute("data-open", String(open));
  navigationToggle.setAttribute("aria-expanded", String(open));
  navigationToggle.setAttribute("aria-label", `${open ? "Close" : "Open"} documentation navigation`);
  if (open) {
    lastNavigationTrigger = trigger;
    navigationPanel.setAttribute("role", "dialog");
    navigationPanel.setAttribute("aria-modal", "true");
    for (const sibling of drawerSiblings) sibling.inert = true;
    navigationClose?.focus();
  } else {
    navigationPanel.removeAttribute("role");
    navigationPanel.removeAttribute("aria-modal");
    for (const sibling of drawerSiblings) sibling.inert = false;
    if (restoreFocus) lastNavigationTrigger?.focus();
  }
}
navigationToggle?.addEventListener("click", () => setNavigationOpen(!navigationIsOpen(), navigationToggle));
navigationClose?.addEventListener("click", () => setNavigationOpen(false));
desktopNavigation?.addEventListener("change", event => {
  if (!event.matches || !navigationIsOpen()) return;
  setNavigationOpen(false, navigationPanel, false);
  navigationPanel?.focus();
});
function drawerFocusables() {
  if (!navigationPanel) return [];
  return [
    ...navigationPanel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ].filter(element => !element.hasAttribute("hidden"));
}

const dialog = document.querySelector("[data-search-dialog]");
const searchInput = document.querySelector("[data-search-input]");
const resultsRoot = document.querySelector("[data-search-results]");
const searchStatus = document.querySelector("[data-search-status]");
let searchIndex;
let searchIndexUrl;
for (const trigger of document.querySelectorAll("[data-search-open]")) trigger.addEventListener("click", openSearch);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && navigationIsOpen()) {
    event.preventDefault();
    setNavigationOpen(false);
    return;
  }
  if (event.key === "Tab" && navigationIsOpen()) {
    const focusables = drawerFocusables();
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
    return;
  }
  const target = event.target;
  const typing =
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if ((event.key === "/" && !typing) || (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey))) {
    event.preventDefault();
    openSearch();
  }
});
async function openSearch() {
  if (navigationIsOpen()) return;
  if (!(dialog instanceof HTMLDialogElement)) return;
  dialog.showModal();
  searchInput?.focus();
  const requestedUrl = dialog.dataset.searchIndexUrl ?? "/search-index.json";
  if (!searchIndex || searchIndexUrl !== requestedUrl) {
    searchIndexUrl = requestedUrl;
    try {
      const response = await fetch(requestedUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Search index returned ${response.status}`);
      searchIndex = await response.json();
    } catch {
      if (resultsRoot)
        resultsRoot.textContent = "Search is unavailable until this documentation version has loaded successfully.";
      if (searchStatus) searchStatus.textContent = "Search is unavailable.";
    }
  }
}
searchInput?.addEventListener("input", event => {
  const query = event.currentTarget.value.trim().toLowerCase();
  if (!resultsRoot) return;
  resultsRoot.replaceChildren();
  if (!query) {
    resultsRoot.append(message("Start typing to search this documentation version."));
    if (searchStatus) searchStatus.textContent = "Start typing to search.";
    return;
  }
  const terms = query.split(/\s+/u).filter(Boolean);
  const matches = (searchIndex ?? [])
    .map(entry => ({ entry, score: searchScore(entry, terms) }))
    .filter(result => result.score > 0)
    .sort((left, right) => right.score - left.score || left.entry.label.localeCompare(right.entry.label))
    .slice(0, 12);
  if (matches.length === 0) {
    resultsRoot.append(message(`No documentation matched “${query}”.`));
    if (searchStatus) searchStatus.textContent = `No results for ${query}.`;
    return;
  }
  const status = `${matches.length} result${matches.length === 1 ? "" : "s"} for “${query}”.`;
  if (searchStatus) searchStatus.textContent = status;
  resultsRoot.append(message(status));
  for (const { entry } of matches) resultsRoot.append(searchResult(entry));
});
function searchScore(entry, terms) {
  const label = entry.label.toLowerCase();
  const description = entry.description.toLowerCase();
  const text = entry.text.toLowerCase();
  return terms.reduce((score, term) => {
    if (!label.includes(term) && !description.includes(term) && !text.includes(term)) return -1000;
    if (label === term) score += 20;
    else if (label.startsWith(term)) score += 12;
    else if (label.includes(term)) score += 8;
    if (description.includes(term)) score += 4;
    if (text.includes(term)) score += 1;
    return score;
  }, 0);
}
function searchResult(entry) {
  const link = document.createElement("a");
  link.className = "search-result";
  link.href = entry.url;
  const category = document.createElement("span");
  category.textContent = `${entry.category} · Vireo ${entry.version}`;
  const label = document.createElement("strong");
  label.textContent = entry.label;
  const description = document.createElement("small");
  description.textContent = entry.description;
  link.append(category, label, description);
  return link;
}
function message(value) {
  const paragraph = document.createElement("p");
  paragraph.textContent = value;
  return paragraph;
}

const observedHeadings = [...document.querySelectorAll(".article-content h2[id]")];
const tocLinks = new Map(
  [...document.querySelectorAll("[data-toc-link]")].map(link => [link.getAttribute("data-toc-link"), link]),
);
if (observedHeadings.length > 0 && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
      if (!visible) return;
      for (const link of tocLinks.values()) link.removeAttribute("data-active");
      tocLinks.get(visible.target.id)?.setAttribute("data-active", "true");
    },
    { rootMargin: "-15% 0px -72% 0px" },
  );
  for (const heading of observedHeadings) observer.observe(heading);
}

if ("serviceWorker" in navigator)
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
