const root = document.documentElement;
const storedTheme = localStorage.getItem("vireo-docs-theme");
if (storedTheme === "light" || storedTheme === "dark") root.dataset.theme = storedTheme;

document.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const currentDark = root.dataset.theme === "dark" || (root.dataset.theme !== "light" && systemDark);
  const next = currentDark ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem("vireo-docs-theme", next);
});

for (const button of document.querySelectorAll("[data-copy-command]")) {
  button.addEventListener("click", () => copy(button, button.getAttribute("data-copy-command") ?? ""));
}

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
const navigationPanel = document.querySelector("[data-navigation-panel]");
navigationToggle?.addEventListener("click", () => {
  const open = navigationPanel?.getAttribute("data-open") !== "true";
  navigationPanel?.setAttribute("data-open", String(open));
  navigationToggle.setAttribute("aria-expanded", String(open));
});

document.addEventListener("click", event => {
  if (!navigationPanel || !navigationToggle || navigationPanel.getAttribute("data-open") !== "true") return;
  if (navigationPanel.contains(event.target) || navigationToggle.contains(event.target)) return;
  navigationPanel.setAttribute("data-open", "false");
  navigationToggle.setAttribute("aria-expanded", "false");
});

const dialog = document.querySelector("[data-search-dialog]");
const searchInput = document.querySelector("[data-search-input]");
const resultsRoot = document.querySelector("[data-search-results]");
let searchIndex;

for (const trigger of document.querySelectorAll("[data-search-open]")) trigger.addEventListener("click", openSearch);

document.addEventListener("keydown", event => {
  const target = event.target;
  const typing =
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
  if ((event.key === "/" && !typing) || (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey))) {
    event.preventDefault();
    openSearch();
  }
});

async function openSearch() {
  if (!(dialog instanceof HTMLDialogElement)) return;
  dialog.showModal();
  searchInput?.focus();
  if (!searchIndex) {
    try {
      const response = await fetch("/search-index.json", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Search index returned ${response.status}`);
      searchIndex = await response.json();
    } catch {
      if (resultsRoot) resultsRoot.textContent = "Search is temporarily unavailable.";
    }
  }
}

searchInput?.addEventListener("input", event => {
  const query = event.currentTarget.value.trim().toLowerCase();
  if (!resultsRoot) return;
  resultsRoot.replaceChildren();
  if (!query) {
    resultsRoot.append(message("Start typing to search the current Vireo documentation."));
    return;
  }
  const terms = query.split(/\s+/u).filter(Boolean);
  const matches = (searchIndex ?? [])
    .map(entry => ({ entry, score: searchScore(entry, terms) }))
    .filter(result => result.score > 0)
    .sort((left, right) => right.score - left.score || left.entry.label.localeCompare(right.entry.label))
    .slice(0, 12);
  if (matches.length === 0) {
    resultsRoot.append(message(`No current documentation matched “${query}”.`));
    return;
  }
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
