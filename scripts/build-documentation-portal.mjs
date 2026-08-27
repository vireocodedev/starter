import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = join(root, "packages/ui/storybook-static");
const javadocRoot = join(root, "jvm/build/docs/javadoc");
const policyPath = join(root, "contracts/documentation-release-policy.json");
const policy = readJson(policyPath);
const release = policy.releases.find(candidate => candidate.id === policy.currentRelease);

if (!release) fail(`current documentation release ${policy.currentRelease} is not declared`);
if (!existsSync(join(outputRoot, "index.json"))) {
  fail("Storybook output is missing; run corepack npm run build-storybook first");
}
if (!existsSync(join(javadocRoot, "index.html"))) {
  fail("aggregate Javadoc is missing; run ./jvm/gradlew -p jvm aggregateJavadoc first");
}

const generatedRoots = ["api", "docs", "latest", "versions", "versions.json"];
for (const generatedRoot of generatedRoots) {
  const target = join(outputRoot, generatedRoot);
  if (existsSync(target)) rmSync(target, { force: true, recursive: true });
}

const storybookEntries = readdirSync(outputRoot);
const versionRoot = join(outputRoot, "versions", release.id);
const versionedStorybookRoot = join(versionRoot, "storybook");
mkdirSync(versionedStorybookRoot, { recursive: true });
for (const entry of storybookEntries) {
  cpSync(join(outputRoot, entry), join(versionedStorybookRoot, entry), { recursive: true });
}

const typeScriptReference = buildTypeScriptReference(versionRoot, release);
const versionedJavadocRoot = join(versionRoot, "api/jvm");
cpSync(javadocRoot, versionedJavadocRoot, { recursive: true });

const storybookSearch = collectStorybookSearch(versionedStorybookRoot);
const javadocSearch = collectJavadocSearch(versionedJavadocRoot);
const searchIndex = [...storybookSearch, ...typeScriptReference.search, ...javadocSearch];
writeJson(join(versionRoot, "search-index.json"), searchIndex);
writeJson(join(outputRoot, "versions.json"), {
  schemaVersion: policy.schemaVersion,
  currentRelease: release.id,
  releases: policy.releases.map(candidate => ({
    id: candidate.id,
    status: candidate.status,
    npm: candidate.npm,
    jvm: candidate.jvm,
    url: `versions/${candidate.id}/`,
  })),
});
for (const historicalRelease of policy.releases.filter(candidate => candidate.id !== release.id)) {
  cpSync(join(root, historicalRelease.archivePath), join(outputRoot, "versions", historicalRelease.id), {
    recursive: true,
  });
}
writeFileSync(join(outputRoot, "versions/index.html"), renderVersions(policy));

writeFileSync(
  join(versionRoot, "index.html"),
  renderPortal({
    release,
    counts: {
      guides: storybookSearch.length,
      jvm: javadocSearch.length,
      typescript: typeScriptReference.search.length,
    },
  }),
);

writeRedirect(join(outputRoot, "docs/index.html"), `../versions/${release.id}/`);
writeRedirect(join(outputRoot, "latest/index.html"), `../versions/${release.id}/`);
writeRedirect(join(outputRoot, "api/typescript/index.html"), `../../versions/${release.id}/api/typescript/`);
writeRedirect(join(outputRoot, "api/jvm/index.html"), `../../versions/${release.id}/api/jvm/`);

console.log(
  `Documentation portal built for ${release.id}: ${storybookSearch.length} Storybook entries, ` +
    `${typeScriptReference.search.length} TypeScript exports, and ${javadocSearch.length} JVM API entries.`,
);

function buildTypeScriptReference(destinationRoot, currentRelease) {
  const packageDirectories = readdirSync(join(root, "packages"), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(directory => existsSync(join(root, "packages", directory, "api-surface.json")));
  const packages = packageDirectories.map(directory => {
    const packageRoot = join(root, "packages", directory);
    return {
      directory,
      packageRoot,
      manifest: readJson(join(packageRoot, "package.json")),
      surface: readJson(join(packageRoot, "api-surface.json")),
    };
  });
  const typeRoots = packages.flatMap(packageRecord =>
    Object.keys(packageRecord.surface.entryPoints).map(entryPoint =>
      resolveExportTypes(packageRecord.packageRoot, packageRecord.manifest.exports[entryPoint]),
    ),
  );
  const program = ts.createProgram(typeRoots, {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext,
  });
  const checker = program.getTypeChecker();
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const apiRoot = join(destinationRoot, "api/typescript");
  mkdirSync(apiRoot, { recursive: true });

  const packagePages = [];
  const search = [];
  for (const packageRecord of packages) {
    const releaseRecord = currentRelease.npm.find(candidate => candidate.package === packageRecord.manifest.name);
    if (!releaseRecord) fail(`${packageRecord.manifest.name} is missing from the documentation release`);
    const entryPointPages = [];
    for (const [entryPoint, surface] of Object.entries(packageRecord.surface.entryPoints)) {
      const typeRoot = resolveExportTypes(packageRecord.packageRoot, packageRecord.manifest.exports[entryPoint]);
      const sourceFile = program.getSourceFile(typeRoot);
      const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
      if (!moduleSymbol) fail(`could not inspect declarations for ${packageRecord.manifest.name} ${entryPoint}`);
      const exportsByName = new Map(checker.getExportsOfModule(moduleSymbol).map(symbol => [symbol.getName(), symbol]));
      const symbols = surface.exports.map(name => {
        const exportedSymbol = exportsByName.get(name);
        if (!exportedSymbol) fail(`${packageRecord.manifest.name} ${entryPoint} cannot resolve ${name}`);
        return describeSymbol({
          checker,
          exportedSymbol,
          packageRoot: packageRecord.packageRoot,
          printer,
          sourceFile,
        });
      });
      const pageName = entryPointFileName(packageRecord.manifest.name, entryPoint);
      const importPath =
        entryPoint === "." ? packageRecord.manifest.name : `${packageRecord.manifest.name}/${entryPoint.slice(2)}`;
      writeFileSync(
        join(apiRoot, pageName),
        renderTypeScriptEntryPoint({
          importPath,
          packageName: packageRecord.manifest.name,
          symbols,
          version: releaseRecord.version,
        }),
      );
      entryPointPages.push({ entryPoint: importPath, pageName, symbols: symbols.length });
      for (const symbol of symbols) {
        search.push({
          category: "TypeScript API",
          description: `${symbol.kind} exported from ${importPath}`,
          label: symbol.name,
          url: `api/typescript/${pageName}#${symbol.anchor}`,
        });
      }
    }
    packagePages.push({
      name: packageRecord.manifest.name,
      version: releaseRecord.version,
      entryPoints: entryPointPages,
    });
  }
  writeFileSync(join(apiRoot, "index.html"), renderTypeScriptIndex(packagePages));
  return { packages: packagePages, search };
}

function describeSymbol({ checker, exportedSymbol, packageRoot, printer, sourceFile }) {
  let symbol = exportedSymbol;
  if (symbol.flags & ts.SymbolFlags.Alias) {
    const target = checker.getAliasedSymbol(symbol);
    if (target.flags !== ts.SymbolFlags.Transient || target.declarations?.length) symbol = target;
  }
  const declarations = (symbol.declarations ?? exportedSymbol.declarations ?? [])
    .map(normalizeDeclaration)
    .filter((declaration, index, all) => all.indexOf(declaration) === index)
    .filter(declaration => declaration.getSourceFile().fileName.startsWith(`${packageRoot}${sep}`));
  const printableDeclarations = declarations.length > 0 ? declarations : (exportedSymbol.declarations ?? []);
  let signature = printableDeclarations
    .map(declaration => printer.printNode(ts.EmitHint.Unspecified, declaration, declaration.getSourceFile()))
    .join("\n");
  if (!signature) {
    const type = checker.getTypeOfSymbolAtLocation(symbol, sourceFile);
    signature = `${exportedSymbol.getName()}: ${checker.typeToString(type)}`;
  }
  const documentation = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  return {
    anchor: slug(exportedSymbol.getName()),
    documentation,
    kind: declarationKind(printableDeclarations[0]),
    name: exportedSymbol.getName(),
    signature,
  };
}

function normalizeDeclaration(declaration) {
  if (ts.isVariableDeclaration(declaration)) return declaration.parent.parent;
  if (ts.isBindingElement(declaration)) return declaration.parent.parent;
  return declaration;
}

function declarationKind(declaration) {
  if (!declaration) return "export";
  if (ts.isClassDeclaration(declaration)) return "class";
  if (ts.isEnumDeclaration(declaration)) return "enum";
  if (ts.isFunctionDeclaration(declaration)) return "function";
  if (ts.isInterfaceDeclaration(declaration)) return "interface";
  if (ts.isModuleDeclaration(declaration)) return "namespace";
  if (ts.isTypeAliasDeclaration(declaration)) return "type";
  if (ts.isVariableStatement(declaration)) return "value";
  return ts.SyntaxKind[declaration.kind].replace(/Declaration$/, "").toLowerCase();
}

function resolveExportTypes(packageRoot, exportCondition) {
  const relativePath = findTypesPath(exportCondition);
  if (!relativePath) fail(`package export in ${packageRoot} has no types condition`);
  const absolutePath = resolve(packageRoot, relativePath);
  if (!existsSync(absolutePath)) fail(`declaration output is missing: ${relative(root, absolutePath)}`);
  return absolutePath;
}

function findTypesPath(value) {
  if (typeof value === "string" && value.endsWith(".d.ts")) return value;
  if (!value || typeof value !== "object") return undefined;
  if (typeof value.types === "string") return value.types;
  for (const nested of Object.values(value)) {
    const result = findTypesPath(nested);
    if (result) return result;
  }
  return undefined;
}

function collectStorybookSearch(storybookRoot) {
  const index = readJson(join(storybookRoot, "index.json"));
  return Object.values(index.entries)
    .filter(entry => entry.type === "docs" || entry.type === "story")
    .map(entry => ({
      category: entry.type === "docs" ? "Guide or component docs" : "Component example",
      description: entry.title,
      label: entry.name === "Docs" ? entry.title : `${entry.title} — ${entry.name}`,
      url: `storybook/?path=/${entry.type}/${entry.id}`,
    }));
}

function collectJavadocSearch(javadocDestination) {
  const types = readJavadocIndex(join(javadocDestination, "type-search-index.js"));
  const members = readJavadocIndex(join(javadocDestination, "member-search-index.js"));
  const typeEntries = types
    .filter(entry => entry.p && entry.l !== "All Classes and Interfaces")
    .map(entry => ({
      category: "JVM API",
      description: entry.p,
      label: entry.l,
      url: `api/jvm/${entry.p.replaceAll(".", "/")}/${entry.u ?? `${entry.l}.html`}`,
    }));
  const memberEntries = members
    .filter(entry => entry.p && entry.c)
    .map(entry => ({
      category: "JVM member",
      description: `${entry.p}.${entry.c}`,
      label: `${entry.c}.${entry.l}`,
      url: `api/jvm/${entry.p.replaceAll(".", "/")}/${entry.c}.html#${encodeURIComponent(entry.u ?? entry.l)}`,
    }));
  return [...typeEntries, ...memberEntries];
}

function readJavadocIndex(path) {
  const source = readFileSync(path, "utf8");
  const start = source.indexOf("[");
  const end = source.lastIndexOf("]");
  if (start < 0 || end < start) fail(`cannot parse ${relative(root, path)}`);
  return JSON.parse(source.slice(start, end + 1));
}

function renderPortal({ release: currentRelease, counts }) {
  const npmVersionSummary = [...new Set(currentRelease.npm.map(entry => entry.version))].join(", ");
  const searchCount = counts.guides + counts.typescript + counts.jvm;
  return page(
    `Vireo documentation · ${currentRelease.id}`,
    `<header class="hero">
      <p class="eyebrow">Vireo Framework documentation</p>
      <h1>Build with the public contract in view.</h1>
      <p class="lede">Search the complete Storybook guide catalog, every declared TypeScript export, and the aggregate JVM API from one release-specific documentation snapshot.</p>
      <div class="versions"><span>npm ${escapeHtml(npmVersionSummary)}</span><span>JVM ${escapeHtml(currentRelease.jvm.version)}</span><span>${searchCount.toLocaleString()} searchable records</span></div>
      <label class="search"><span>Search all documentation</span><input id="docs-search" type="search" placeholder="Try VireoPageLayout, offline replay, or BaseService" autocomplete="off" /></label>
    </header>
    <main>
      <section id="search-section" aria-live="polite">
        <div class="section-heading"><h2>Search results</h2><p id="result-summary">Showing a starting selection</p></div>
        <div id="search-results" class="results"></div>
      </section>
      <section>
        <div class="section-heading"><h2>Browse by surface</h2><p>Concept first, declaration detail when you need it.</p></div>
        <div class="cards">
          ${portalCard("Guides and components", `${counts.guides} Storybook entries`, "storybook/", "Open versioned Storybook")}
          ${portalCard("TypeScript API", `${counts.typescript} declared exports`, "api/typescript/", "Open TypeScript reference")}
          ${portalCard("JVM API", `${counts.jvm} types and members`, "api/jvm/", "Open aggregate Javadocs")}
        </div>
      </section>
      <section>
        <div class="section-heading"><h2>Release and migration</h2><p>The npm and JVM families are versioned independently.</p></div>
        <div class="links">
          <a href="${currentRelease.releaseLinks.npm}">npm packages</a>
          <a href="${currentRelease.releaseLinks.jvm}">Maven Central</a>
          <a href="${currentRelease.releaseLinks.jvmTag}">JVM ${escapeHtml(currentRelease.jvm.version)} source tag</a>
          <a href="${currentRelease.releaseLinks.compatibility}">Compatibility policy</a>
          <a href="${currentRelease.releaseLinks.migration}">Migration guides</a>
          <a href="../">Documentation versions</a>
          <a href="../../versions.json">Machine-readable versions</a>
        </div>
      </section>
    </main>
    <footer>Vireo Framework by Vireo Code · documentation snapshot <code>${escapeHtml(currentRelease.id)}</code></footer>
    <script type="module">
      const input = document.querySelector("#docs-search");
      const results = document.querySelector("#search-results");
      const summary = document.querySelector("#result-summary");
      const index = await fetch("search-index.json").then(response => response.json());
      const render = () => {
        const terms = input.value.toLocaleLowerCase().trim().split(/\\s+/).filter(Boolean);
        const matches = index.filter(item => {
          const haystack = (item.label + " " + item.description + " " + item.category).toLocaleLowerCase();
          return terms.every(term => haystack.includes(term));
        });
        const visible = matches.slice(0, terms.length ? 80 : 18);
        summary.textContent = terms.length
          ? matches.length + " matching records" + (matches.length > visible.length ? "; refine to narrow the list" : "")
          : "Showing " + visible.length + " of " + index.length.toLocaleString() + " records";
        results.replaceChildren(...visible.map(item => {
          const link = document.createElement("a");
          link.className = "result";
          link.href = item.url;
          const category = document.createElement("span");
          category.className = "result-category";
          category.textContent = item.category;
          const label = document.createElement("strong");
          label.textContent = item.label;
          const description = document.createElement("span");
          description.textContent = item.description;
          link.append(category, label, description);
          return link;
        }));
      };
      input.addEventListener("input", render);
      render();
    </script>`,
  );
}

function renderTypeScriptIndex(packages) {
  const rows = packages
    .flatMap(packageRecord =>
      packageRecord.entryPoints.map(
        entryPoint =>
          `<tr><td><code>${escapeHtml(entryPoint.entryPoint)}</code></td><td>${escapeHtml(
            packageRecord.version,
          )}</td><td>${entryPoint.symbols.toLocaleString()}</td><td><a href="${entryPoint.pageName}">Reference</a></td></tr>`,
      ),
    )
    .join("");
  return page(
    "Vireo TypeScript API reference",
    `<nav><a href="../../">← Documentation home</a></nav><main><p class="eyebrow">TypeScript API</p><h1>Declared public entry points</h1><p class="lede">Generated from package export maps, checked public-surface snapshots, and emitted declaration files. Undeclared deep imports are not public API.</p><div class="table-wrap"><table><thead><tr><th>Import</th><th>Version</th><th>Exports</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></main>`,
  );
}

function renderVersions(documentationPolicy) {
  const rows = documentationPolicy.releases
    .map(releaseRecord => {
      const npmVersions = releaseRecord.npm.map(entry => `${entry.package} ${entry.version}`).join(", ");
      return `<tr><td><a href="${escapeHtml(releaseRecord.id)}/"><code>${escapeHtml(
        releaseRecord.id,
      )}</code></a></td><td>${escapeHtml(releaseRecord.status)}</td><td>${escapeHtml(
        npmVersions,
      )}</td><td>${escapeHtml(releaseRecord.jvm.version)}</td></tr>`;
    })
    .join("");
  return page(
    "Vireo documentation versions",
    `<nav><a href="../docs/">← Current documentation</a></nav><main><p class="eyebrow">Documentation releases</p><h1>Version-specific snapshots</h1><p class="lede">npm packages and the coordinated JVM family have independent release lines. Each row names the exact artifact set documented by its stable URL.</p><div class="table-wrap"><table><thead><tr><th>Snapshot</th><th>Status</th><th>npm artifacts</th><th>JVM</th></tr></thead><tbody>${rows}</tbody></table></div><p><a href="../versions.json">Read the machine-readable release index</a></p></main>`,
  );
}

function renderTypeScriptEntryPoint({ importPath, packageName, symbols, version }) {
  const symbolMarkup = symbols
    .map(
      symbol =>
        `<article class="symbol" id="${symbol.anchor}"><div class="symbol-heading"><span>${escapeHtml(
          symbol.kind,
        )}</span><a href="#${symbol.anchor}">${escapeHtml(symbol.name)}</a></div>${
          symbol.documentation ? `<p>${escapeHtml(symbol.documentation)}</p>` : ""
        }<pre><code>${escapeHtml(symbol.signature)}</code></pre></article>`,
    )
    .join("");
  return page(
    `${importPath} ${version} API`,
    `<nav><a href="index.html">← TypeScript API index</a> <a href="../../">Documentation home</a></nav><main><p class="eyebrow">${escapeHtml(
      packageName,
    )} · ${escapeHtml(version)}</p><h1><code>${escapeHtml(importPath)}</code></h1><p class="lede">${symbols.length.toLocaleString()} public exports generated from the shipped declaration graph.</p><label class="local-filter"><span>Filter this entry point</span><input id="symbol-filter" type="search" placeholder="Export name or declaration" autocomplete="off" /></label><p id="symbol-summary">Showing all ${symbols.length.toLocaleString()} exports</p><div id="symbols">${symbolMarkup}</div></main><script>const input=document.querySelector("#symbol-filter");const cards=[...document.querySelectorAll(".symbol")];const summary=document.querySelector("#symbol-summary");input.addEventListener("input",()=>{const term=input.value.toLocaleLowerCase().trim();let visible=0;for(const card of cards){const show=!term||card.textContent.toLocaleLowerCase().includes(term);card.hidden=!show;if(show)visible++}summary.textContent="Showing "+visible.toLocaleString()+" of "+cards.length.toLocaleString()+" exports"});</script>`,
  );
}

function portalCard(title, detail, href, action) {
  return `<article class="card"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(detail)}</p><a href="${href}">${escapeHtml(action)} →</a></article>`;
}

function page(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(
    title,
  )}</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath fill='%237cd9fd' d='M4 5h6l6 16L22 5h6L18 28h-4z'/%3E%3C/svg%3E"><style>${styleSheet()}</style></head><body>${body}</body></html>`;
}

function writeRedirect(path, destination) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0; url=${escapeHtml(
      destination,
    )}"><link rel="canonical" href="${escapeHtml(destination)}"><title>Vireo documentation</title></head><body><p><a href="${escapeHtml(
      destination,
    )}">Open the current Vireo documentation</a></p></body></html>`,
  );
}

function entryPointFileName(packageName, entryPoint) {
  const packagePart = packageName.replace(/^@/, "").replaceAll("/", "-");
  const entryPart = entryPoint === "." ? "root" : entryPoint.slice(2).replaceAll("/", "-");
  return `${packagePart}--${entryPart}.html`;
}

function slug(value) {
  return `symbol-${value.toLocaleLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function fail(message) {
  console.error(`Documentation portal build failed: ${message}`);
  process.exit(1);
}

function styleSheet() {
  return `
:root{color-scheme:dark;--bg:#07111f;--surface:#101e31;--surface-2:#172940;--text:#f5f8fc;--muted:#a9bad0;--aqua:#7cd9fd;--gold:#f0b44c;--border:#29415d;font-family:Inter,ui-sans-serif,system-ui,sans-serif}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 85% -10%,#16475b 0,transparent 34rem),var(--bg);color:var(--text);line-height:1.55}a{color:var(--aqua)}nav,main,footer,.hero{width:min(1180px,calc(100% - 2rem));margin-inline:auto}.hero{padding:5rem 0 2rem}.eyebrow{color:var(--gold);font-size:.78rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase}.hero h1,main h1{font-size:clamp(2.1rem,6vw,4.8rem);line-height:1.02;max-width:900px;margin:.35rem 0 1.25rem}.lede{color:var(--muted);font-size:1.15rem;max-width:780px}.versions{display:flex;flex-wrap:wrap;gap:.65rem;margin:1.5rem 0}.versions span,.result-category,.symbol-heading span{border:1px solid var(--border);border-radius:999px;color:var(--aqua);font-size:.78rem;padding:.25rem .65rem}.search,.local-filter{display:block;margin-top:2rem}.search span,.local-filter span{display:block;font-size:.85rem;font-weight:700;margin-bottom:.5rem}.search input,.local-filter input{width:100%;border:1px solid #3b607c;border-radius:14px;background:#0c1929;color:var(--text);font:inherit;font-size:1.08rem;padding:1rem 1.1rem;outline:none}.search input:focus,.local-filter input:focus{border-color:var(--aqua);box-shadow:0 0 0 3px #7cd9fd24}section{padding:2rem 0}.section-heading{display:flex;align-items:baseline;justify-content:space-between;gap:1rem}.section-heading p,#result-summary,#symbol-summary{color:var(--muted)}.results{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:.7rem}.result{display:flex;flex-direction:column;gap:.3rem;border:1px solid var(--border);border-radius:12px;background:#0e1b2c;padding:1rem;text-decoration:none}.result:hover,.card:hover{border-color:#5797ba;background:var(--surface)}.result strong{color:var(--text);overflow-wrap:anywhere}.result>span:last-child{color:var(--muted);font-size:.88rem;overflow-wrap:anywhere}.result-category{align-self:flex-start;padding:.1rem .45rem}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}.card{border:1px solid var(--border);border-radius:16px;background:var(--surface);padding:1.4rem}.card h3{margin-top:0}.card p{color:var(--muted)}.links{display:flex;flex-wrap:wrap;gap:.75rem}.links a,nav a{border:1px solid var(--border);border-radius:9px;padding:.55rem .75rem;text-decoration:none}nav{display:flex;gap:.6rem;padding-top:1.25rem}main{padding:1rem 0 4rem}footer{border-top:1px solid var(--border);color:var(--muted);padding:2rem 0 4rem}.table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;background:var(--surface)}th,td{padding:.75rem;text-align:left;border-bottom:1px solid var(--border)}.symbol{border-top:1px solid var(--border);padding:1.5rem 0;scroll-margin-top:1rem}.symbol-heading{display:flex;align-items:center;gap:.7rem}.symbol-heading a{color:var(--text);font-size:1.2rem;font-weight:800;text-decoration:none}.symbol p{color:var(--muted)}pre{overflow:auto;border:1px solid var(--border);border-radius:10px;background:#050b13;padding:1rem;font-size:.83rem;white-space:pre-wrap;word-break:break-word}code{font-family:"SFMono-Regular",Consolas,monospace}@media(max-width:760px){.hero{padding-top:3rem}.cards{grid-template-columns:1fr}.section-heading{display:block}.hero h1,main h1{font-size:2.3rem}}`;
}
