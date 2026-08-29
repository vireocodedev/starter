import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const h = React.createElement;

export function renderWebsitePage({ website, page, navigation, allPages }) {
  return `<!doctype html>${renderToStaticMarkup(h(WebsiteDocument, { website, page, navigation, allPages }))}\n`;
}

function WebsiteDocument({ website, page, navigation, allPages }) {
  const canonical = new URL(page.canonicalPath ?? page.path, website.canonicalUrl).href;
  return h(
    "html",
    { lang: "en", "data-theme": "system" },
    h(
      "head",
      null,
      h("meta", { charSet: "utf-8" }),
      h("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      h("meta", { name: "description", content: page.description }),
      h("meta", { name: "theme-color", content: "#07111f" }),
      page.noIndex ? h("meta", { name: "robots", content: "noindex" }) : null,
      h("meta", { property: "og:type", content: page.kind === "home" ? "website" : "article" }),
      h("meta", { property: "og:title", content: `${page.title} · Vireo Framework` }),
      h("meta", { property: "og:description", content: page.description }),
      h("meta", { property: "og:url", content: canonical }),
      h("meta", { property: "og:image", content: website.links.flagshipImage }),
      h("meta", { property: "og:image:alt", content: "Vireo Framework flagship operational application" }),
      h("meta", { name: "twitter:card", content: "summary_large_image" }),
      h("meta", { name: "twitter:image", content: website.links.flagshipImage }),
      h("link", { rel: "canonical", href: canonical }),
      h("link", { rel: "stylesheet", href: "/assets/site.css" }),
      h("link", { rel: "icon", type: "image/svg+xml", href: "/assets/favicon.svg" }),
      h("title", null, `${page.title} · Vireo Framework`),
      h("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            name: "Vireo Framework",
            codeRepository: website.links.source,
            license: "https://opensource.org/license/mit",
            programmingLanguage: ["TypeScript", "Java"],
            runtimePlatform: ["React", "Spring Boot"],
            url: website.canonicalUrl,
          }),
        },
      }),
    ),
    h(
      "body",
      null,
      h("a", { className: "skip-link", href: "#main" }, "Skip to content"),
      h(SiteHeader, { website, page }),
      page.kind === "home"
        ? h(LandingPage, { website })
        : h(DocumentationPage, { website, page, navigation, allPages }),
      h(SiteFooter, { website }),
      h(SearchDialog, null),
      h("script", { src: "/assets/site.js", defer: true }),
    ),
  );
}

function SiteHeader({ website, page }) {
  const activePath = page.basePath ?? page.path;
  const activeHref = activePath.startsWith("/docs/components/")
    ? "/docs/components/"
    : activePath.startsWith("/docs/")
      ? "/docs/"
      : activePath.startsWith("/examples/")
        ? "/examples/"
        : activePath.startsWith("/reference/")
          ? "/reference/"
          : undefined;
  const links = [
    ["/docs/", "Docs"],
    ["/docs/components/", "Components"],
    ["/examples/", "Examples"],
    ["/reference/", "Reference"],
  ];
  return h(
    "header",
    { className: "site-header" },
    h(
      "div",
      { className: `site-header__inner${page.kind === "home" ? " site-header__inner--home" : ""}` },
      page.kind === "home"
        ? null
        : h(
            "button",
            {
              className: "icon-button mobile-only",
              type: "button",
              "data-navigation-toggle": true,
              "aria-label": "Open documentation navigation",
              "aria-expanded": "false",
            },
            "☰",
          ),
      h(
        "a",
        { className: "brand", href: "/", "aria-label": "Vireo Framework home" },
        h(VireoMark),
        h("span", null, "Vireo", h("small", null, "Framework")),
      ),
      h(
        "nav",
        { className: "site-nav", "aria-label": "Primary navigation" },
        ...links.map(([href, label]) =>
          h("a", { href, "aria-current": activeHref === href ? "page" : undefined, key: href }, label),
        ),
      ),
      h(
        "div",
        { className: "header-actions" },
        h(
          "button",
          { className: "search-trigger", type: "button", "data-search-open": true },
          h("span", null, "Search"),
          h(SearchIcon),
          h("kbd", null, "⌘ K"),
        ),
        h("a", { className: "version-pill", href: "/versions/" }, `v${website.documentation.version}`),
        h(
          "button",
          {
            className: "icon-button",
            type: "button",
            "data-theme-toggle": true,
            "data-theme-target": "light",
            "aria-label": "Use light theme",
            title: "Use light theme",
          },
          h(ThemeIcon, { mode: "light" }),
          h(ThemeIcon, { mode: "dark" }),
        ),
        h(
          "a",
          {
            className: "github-link",
            href: website.links.source,
            target: "_blank",
            rel: "noreferrer",
            "aria-label": "Vireo on GitHub",
          },
          "GitHub",
        ),
      ),
    ),
  );
}

function LandingPage({ website }) {
  const createCommand = "npm create vireo@latest my-app";
  const frontendCommand = "npm create vireo@latest my-app -- --profile frontend";
  const scopedPackages = website.currentRelease.npm.filter(entry => entry.package !== "create-vireo");
  return h(
    "main",
    { id: "main" },
    h(
      "section",
      { className: "home-hero" },
      h("div", { className: "hero-glow hero-glow--one" }),
      h("div", { className: "hero-glow hero-glow--two" }),
      h(
        "div",
        { className: "home-hero__content" },
        h("p", { className: "eyebrow" }, "React · optional Spring Boot · operational applications"),
        h("h1", null, "Build the workflow.", h("span", null, "Keep the foundation.")),
        h(
          "p",
          { className: "home-hero__lede" },
          "Vireo connects responsive UI, replaceable backend adapters, generated vertical slices and version-aware contracts—without taking ownership of your product domain.",
        ),
        h(
          "div",
          { className: "actions" },
          h("a", { className: "button button--primary", href: "/docs/getting-started/" }, "Get started"),
          h(
            "a",
            { className: "button", href: website.links.demo, target: "_blank", rel: "noreferrer" },
            "Explore the live demo",
          ),
        ),
        h(
          "div",
          { className: "hero-meta" },
          h("span", null, "MIT licensed"),
          h("span", null, "Public 0.x"),
          h("span", null, "Frontend-only or full-stack"),
        ),
      ),
      h(
        "aside",
        { className: "command-card", "aria-label": "Create a Vireo application" },
        h(
          "div",
          { className: "command-card__top" },
          h("span", null, "Terminal"),
          h("span", { className: "status-live" }, "public release"),
        ),
        h(Command, { label: "Complete application", command: createCommand }),
        h(Command, { label: "Frontend repository only", command: frontendCommand }),
        h(
          "a",
          { className: "command-card__link", href: "/docs/getting-started/choose-your-profile/" },
          "Compare project profiles →",
        ),
      ),
    ),
    h(
      "section",
      { className: "proof-strip", "aria-label": "Current public release" },
      h(
        "div",
        { className: "proof-strip__inner" },
        h(
          "div",
          null,
          h("strong", null, `create-vireo ${website.currentRelease.createVireo}`),
          h("span", null, "Create, generate and upgrade"),
        ),
        h(
          "div",
          null,
          h("strong", null, `${scopedPackages.length} npm libraries`),
          h("span", null, "Typed React foundations"),
        ),
        h(
          "div",
          null,
          h("strong", null, `${website.currentRelease.jvm.modules.length} JVM modules`),
          h("span", null, "Spring Boot building blocks"),
        ),
        h("div", null, h("strong", null, "Live HTTPS demo"), h("span", null, "Monitored and reset safely")),
      ),
    ),
    h(
      "figure",
      { className: "flagship-proof" },
      h("img", {
        src: website.links.flagshipImage,
        alt: "Vireo flagship application showing its responsive operational workflow",
        loading: "eager",
        width: 1440,
        height: 900,
      }),
      h(
        "figcaption",
        null,
        "The current pinned Starter Template—not a concept render. ",
        h("a", { href: website.links.demo, target: "_blank", rel: "noreferrer" }, "Try the disposable live demo"),
        " or ",
        h("a", { href: "/docs/getting-started/" }, "build the guided workflow"),
        ".",
      ),
    ),
    h(HomeSection, {
      eyebrow: "Choose your path",
      title: "One framework. Two ownership models.",
      description:
        "Start with the boundary your organization already has. Both profiles share the same frontend libraries, generated contracts and upgrade tooling.",
      children: h(
        "div",
        { className: "feature-grid feature-grid--two" },
        h(FeatureCard, {
          number: "01",
          title: "Frontend-only",
          description: "A mock-backed React application for teams integrating with a separately owned company API.",
          href: "/docs/getting-started/frontend-only/",
          action: "Build a frontend",
        }),
        h(FeatureCard, {
          number: "02",
          title: "Complete application",
          description:
            "React and Spring Boot composed as one production-shaped vertical application with H2 or PostgreSQL.",
          href: "/docs/getting-started/full-stack/",
          action: "Build full-stack",
        }),
      ),
    }),
    h(HomeSection, {
      eyebrow: "Learn by doing",
      title: "Documentation that follows the work.",
      description:
        "Start with a task, understand the boundary, inspect an interactive component only when it helps, and use raw API reference as the final escape hatch.",
      tone: "soft",
      children: h(
        "div",
        { className: "path-grid" },
        h(PathCard, {
          label: "Start",
          title: "Install and run",
          description: "Choose a profile and reach a working application.",
          href: "/docs/getting-started/",
        }),
        h(PathCard, {
          label: "Understand",
          title: "Architecture and ownership",
          description: "See which concerns Vireo owns and which remain application code.",
          href: "/docs/concepts/architecture/",
        }),
        h(PathCard, {
          label: "Build",
          title: "Generate a vertical slice",
          description: "Create a reviewable capability from one versioned schema.",
          href: "/docs/cli/generate/",
        }),
        h(PathCard, {
          label: "Explore",
          title: "Interactive components",
          description: "Open the Storybook catalogue for live states and controls.",
          href: "/storybook/",
        }),
      ),
    }),
    h(HomeSection, {
      eyebrow: "Framework map",
      title: "Connected primitives, explicit seams.",
      description:
        "Vireo is not one indivisible runtime. Adopt the application template, the CLI, selected frontend packages or coordinated Spring modules.",
      children: h(
        "div",
        { className: "capability-cloud" },
        ...[
          "Responsive page composition",
          "Query contracts",
          "Forms and validation",
          "History",
          "Localization",
          "Offline shell",
          "Application navigation",
          "Spring authorization",
          "Generated capabilities",
          "Upgrade contracts",
        ].map(value => h("span", { key: value }, value)),
      ),
    }),
    h(
      "section",
      { className: "home-cta" },
      h(
        "div",
        null,
        h("p", { className: "eyebrow" }, `Vireo ${website.documentation.version}`),
        h("h2", null, "Ready to inspect the real thing?"),
        h("p", null, "Follow the 30-minute vertical slice, or open the deployed flagship before installing anything."),
      ),
      h(
        "div",
        { className: "actions" },
        h(
          "a",
          { className: "button button--primary", href: "/docs/guides/30-minute-vertical-slice/" },
          "Follow the tutorial",
        ),
        h("a", { className: "button", href: website.links.demo }, "Open demo"),
      ),
    ),
  );
}

function DocumentationPage({ website, page, navigation, allPages }) {
  const sidebarNavigation = createSidebarNavigation(navigation, allPages);
  const section = sidebarNavigation.find(candidate =>
    candidate.pages.some(candidatePage => candidatePage.path === page.basePath),
  );
  const currentIndex = allPages.findIndex(candidate => candidate.path === page.basePath);
  const previous = currentIndex > 0 ? allPages[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 ? allPages[currentIndex + 1] : undefined;
  return h(
    "main",
    { id: "main", className: "docs-shell" },
    h(
      "aside",
      { className: "docs-sidebar", "data-navigation-panel": true },
      h(
        "div",
        { className: "docs-sidebar__version" },
        h("span", null, "Documentation"),
        h("strong", null, `Vireo ${website.documentation.version}`),
      ),
      h(
        "nav",
        { "aria-label": "Documentation navigation" },
        ...sidebarNavigation.map(group =>
          h(
            "section",
            { className: "navigation-group", key: group.label },
            h("h2", null, group.label),
            h(
              "ul",
              null,
              ...group.pages.map(item =>
                h(
                  "li",
                  { key: item.path },
                  h(
                    "a",
                    {
                      href: versionHref(item.path, page),
                      "aria-current": item.path === page.basePath ? "page" : undefined,
                    },
                    item.shortTitle ?? item.title,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    h(
      "div",
      { className: "docs-main" },
      page.versioned
        ? h(
            "div",
            { className: "version-banner" },
            h("strong", null, `Vireo ${website.documentation.version} snapshot`),
            h("span", null, "You are reading the version-specific copy."),
            h("a", { href: page.basePath }, "Open current docs"),
          )
        : null,
      h(
        "div",
        { className: "breadcrumbs", "aria-label": "Breadcrumb" },
        h("a", { href: versionHref("/docs/", page) }, "Docs"),
        section ? h("span", null, section.label) : null,
        h("span", { "aria-current": "page" }, page.title),
      ),
      h(
        "div",
        { className: "article-layout" },
        h(
          "article",
          { className: "docs-article" },
          h(
            "header",
            { className: "article-header" },
            h("p", { className: "eyebrow" }, page.category),
            h("h1", null, page.title),
            h("p", { className: "article-lede" }, page.description),
            h(
              "div",
              { className: "article-meta" },
              h("span", null, `Vireo ${website.documentation.version}`),
              page.readingMinutes ? h("span", null, `${page.readingMinutes} min read`) : null,
            ),
          ),
          h("div", { className: "article-content", dangerouslySetInnerHTML: { __html: page.html } }),
          h(
            "nav",
            { className: "article-pagination", "aria-label": "Adjacent documentation" },
            previous
              ? h(
                  "a",
                  { href: versionHref(previous.path, page) },
                  h("small", null, "Previous"),
                  h("strong", null, previous.title),
                )
              : h("span"),
            next
              ? h("a", { href: versionHref(next.path, page) }, h("small", null, "Next"), h("strong", null, next.title))
              : null,
          ),
          page.sourceUrl
            ? h(
                "p",
                { className: "source-note" },
                "Documentation source: ",
                h("a", { href: page.sourceUrl, target: "_blank", rel: "noreferrer" }, page.sourceLabel ?? "GitHub"),
              )
            : null,
        ),
        page.headings.length > 0
          ? h(
              "aside",
              { className: "table-of-contents" },
              h("strong", null, "On this page"),
              h(
                "nav",
                null,
                ...page.headings
                  .filter(item => item.level === 2)
                  .map(item =>
                    h("a", { href: `#${item.anchor}`, key: item.anchor, "data-toc-link": item.anchor }, item.label),
                  ),
              ),
            )
          : null,
      ),
    ),
  );
}

function SiteFooter({ website }) {
  return h(
    "footer",
    { className: "site-footer" },
    h(
      "div",
      null,
      h("a", { className: "brand brand--footer", href: "/" }, h(VireoMark), h("span", null, "Vireo Framework")),
      h(
        "p",
        null,
        "Production-shaped foundations for operational React applications, with an optional complete Spring Boot path.",
      ),
    ),
    h(
      "div",
      null,
      h("strong", null, "Learn"),
      h("a", { href: "/docs/getting-started/" }, "Get started"),
      h("a", { href: "/docs/concepts/architecture/" }, "Architecture"),
      h("a", { href: "/storybook/" }, "Storybook"),
    ),
    h(
      "div",
      null,
      h("strong", null, "Build"),
      h("a", { href: "/docs/cli/" }, "CLI"),
      h("a", { href: "/docs/components/" }, "Components"),
      h("a", { href: "/docs/deployment/" }, "Deployment"),
    ),
    h(
      "div",
      null,
      h("strong", null, "Project"),
      h("a", { href: website.links.source }, "GitHub"),
      h("a", { href: "/roadmap/" }, "Roadmap"),
      h("a", { href: "/community/" }, "Community"),
    ),
    h(
      "p",
      { className: "site-footer__legal" },
      `Vireo ${website.documentation.version} · MIT licensed · Public 0.x software. Applications retain ownership of domain rules, authorization policy and sensitive-data decisions.`,
    ),
  );
}

function SearchDialog() {
  return h(
    "dialog",
    { className: "search-dialog", "data-search-dialog": true },
    h(
      "form",
      { method: "dialog", className: "search-dialog__header" },
      h(
        "label",
        null,
        h("span", { className: "visually-hidden" }, "Search Vireo documentation"),
        h("input", {
          type: "search",
          placeholder: "Search guides, concepts, CLI and references…",
          autoComplete: "off",
          "data-search-input": true,
        }),
      ),
      h("button", { type: "submit", "aria-label": "Close search" }, "Esc"),
    ),
    h(
      "div",
      { className: "search-results", "data-search-results": true },
      h("p", null, "Start typing to search the current Vireo documentation."),
    ),
  );
}

function HomeSection({ eyebrow, title, description, children, tone }) {
  return h(
    "section",
    { className: `home-section${tone ? ` home-section--${tone}` : ""}` },
    h(
      "div",
      { className: "section-heading" },
      h("div", null, h("p", { className: "eyebrow" }, eyebrow), h("h2", null, title)),
      h("p", null, description),
    ),
    children,
  );
}

function FeatureCard({ number, title, description, href, action }) {
  return h(
    "article",
    { className: "feature-card" },
    h("span", null, number),
    h("h3", null, title),
    h("p", null, description),
    h("a", { href }, `${action} →`),
  );
}

function PathCard({ label, title, description, href }) {
  return h(
    "a",
    { className: "path-card", href },
    h("span", null, label),
    h("strong", null, title),
    h("p", null, description),
    h("i", null, "→"),
  );
}

function Command({ label, command }) {
  return h(
    "div",
    { className: "command" },
    h("span", null, label),
    h(
      "div",
      null,
      h("code", null, command),
      h("button", { type: "button", "data-copy-command": command, "aria-label": `Copy ${label} command` }, "Copy"),
    ),
  );
}

function VireoMark() {
  return h(
    "svg",
    { viewBox: "0 0 36 36", "aria-hidden": "true" },
    h(
      "defs",
      null,
      h(
        "linearGradient",
        { id: "vireo-mark", x1: "0", y1: "0", x2: "1", y2: "1" },
        h("stop", { offset: "0", stopColor: "#73e0ff" }),
        h("stop", { offset: "1", stopColor: "#5b7cff" }),
      ),
    ),
    h("path", {
      fill: "url(#vireo-mark)",
      d: "M18 2.5 32 10.3v15.4L18 33.5 4 25.7V10.3Zm0 5.1-8.9 5v10.8l8.9 5 8.9-5V12.6Z",
    }),
    h("path", { fill: "currentColor", d: "m12.2 13.1 5.8 10 5.8-10h-4l-1.8 3.5-1.8-3.5Z" }),
  );
}

function ThemeIcon({ mode }) {
  const properties = {
    className: `theme-icon theme-icon--${mode}`,
    "data-theme-icon": mode,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };
  if (mode === "light") {
    return h(
      "svg",
      properties,
      h("circle", { cx: 12, cy: 12, r: 4 }),
      h("path", {
        d: "M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42",
      }),
    );
  }
  return h("svg", properties, h("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" }));
}

function SearchIcon() {
  return h(
    "svg",
    {
      className: "search-icon",
      "data-search-icon": true,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      "aria-hidden": "true",
    },
    h("circle", { cx: 11, cy: 11, r: 7 }),
    h("path", { d: "m20 20-4-4" }),
  );
}

function createSidebarNavigation(navigation, allPages) {
  const pagesByPath = new Map(allPages.map(page => [page.path, page]));
  const supplementalGroups = [
    { label: "Explore", paths: ["/examples/", "/storybook/"] },
    {
      label: "Reference",
      paths: ["/reference/", "/reference/typescript/", "/reference/java/", "/versions/"],
    },
    { label: "Project", paths: ["/roadmap/", "/community/"] },
  ].map(group => ({
    label: group.label,
    pages: group.paths.map(path => pagesByPath.get(path)).filter(Boolean),
  }));
  return [...navigation, ...supplementalGroups.filter(group => group.pages.length > 0)];
}

function versionHref(path, page) {
  if (!page.versioned || !path.startsWith("/docs/")) return path;
  return path.replace("/docs/", `/docs/${page.documentationVersion}/`);
}
