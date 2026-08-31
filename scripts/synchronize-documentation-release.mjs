import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { format, resolveConfig } from "prettier";

export async function synchronizeDocumentationRelease(repositoryRoot) {
  const contractsDirectory = join(repositoryRoot, "contracts");
  const ecosystemPath = join(contractsDirectory, "ecosystem-release-contract.json");
  const documentationPath = join(contractsDirectory, "documentation-release-policy.json");
  const lifecyclePath = join(contractsDirectory, "release-lifecycle-policy.json");
  const ecosystem = readJson(ecosystemPath);
  const oldTemplateCommit = ecosystem.current?.template?.commit;
  if (!/^[a-f0-9]{40}$/u.test(oldTemplateCommit ?? "")) {
    throw new Error("Ecosystem current template must pin an exact starter-template commit");
  }
  const documentation = readJson(documentationPath);
  const lifecycle = readJson(lifecyclePath);
  const currentDocumentation = documentation.releases?.find(release => release.id === documentation.currentRelease);
  if (!currentDocumentation) {
    throw new Error(`Current documentation release ${documentation.currentRelease} is not declared`);
  }

  const publicWorkspacePackages = readdirSync(join(repositoryRoot, "packages"), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => ({
      directory: entry.name,
      manifestPath: join(repositoryRoot, "packages", entry.name, "package.json"),
    }))
    .filter(record => existsSync(record.manifestPath))
    .map(({ directory, manifestPath }) => {
      const manifest = readJson(manifestPath);
      return manifest.private === true ? null : { directory, name: manifest.name, version: manifest.version };
    })
    .filter(Boolean);
  const packageVersions = new Map(publicWorkspacePackages.map(({ name, version }) => [name, version]));
  const packageLockPath = join(repositoryRoot, "package-lock.json");
  const packageLock = readJson(packageLockPath);
  updatePublicWorkspaceLockEntries(packageLock, publicWorkspacePackages);
  const createVireoVersion = packageVersions.get("create-vireo");
  if (!createVireoVersion) throw new Error("create-vireo has no public workspace manifest");
  const templateVersion = createVireoVersion;
  const templateTag = `starter-template@${templateVersion}`;
  const templateReleaseUrl = `https://github.com/vireocodedev/starter-template/releases/tag/${encodeURIComponent(templateTag)}`;

  const gradleProperties = readFileSync(join(repositoryRoot, "jvm", "gradle.properties"), "utf8");
  const jvmVersion = gradleProperties.match(/^version=(.+)$/mu)?.[1];
  if (!jvmVersion) throw new Error("jvm/gradle.properties has no version");

  const createSourcePath = join(repositoryRoot, "packages", "create-vireo", "src", "index.ts");
  let createSource = readFileSync(createSourcePath, "utf8");
  const templateCommit = createSource.match(/TEMPLATE_COMMIT = "([a-f0-9]{40})"/u)?.[1];
  if (!templateCommit) throw new Error("create-vireo does not pin an exact starter-template commit");
  const declaredCreateVireoVersion = createSource.match(/CREATE_VIREO_PACKAGE_VERSION = "([^"]+)"/u)?.[1];
  if (!declaredCreateVireoVersion)
    throw new Error("create-vireo does not declare its generated-project package version");
  createSource = createSource.replace(
    `CREATE_VIREO_PACKAGE_VERSION = "${declaredCreateVireoVersion}"`,
    `CREATE_VIREO_PACKAGE_VERSION = "${createVireoVersion}"`,
  );

  const upgradePolicyPath = join(repositoryRoot, "packages", "create-vireo", "schema", "vireo-upgrade-policy.json");
  const upgradePolicy = readJson(upgradePolicyPath);
  if (typeof upgradePolicy.target?.rootVireoScript !== "string") {
    throw new Error("create-vireo upgrade policy has no target root Vireo script");
  }
  upgradePolicy.target.rootVireoScript = `npx --yes --package=create-vireo@${createVireoVersion} vireo`;

  const oldReleaseId = ecosystem.current?.id;
  if (!oldReleaseId || documentation.currentRelease !== oldReleaseId) {
    throw new Error("Ecosystem and documentation current release IDs do not match");
  }
  const nextReleaseId = `npm-${createVireoVersion}_jvm-${jvmVersion}`;

  updateNpmEntries(ecosystem.current?.npm, packageVersions, "Ecosystem release");
  ecosystem.current.id = nextReleaseId;
  ecosystem.current.maven.version = jvmVersion;
  ecosystem.current.template.version = templateVersion;
  ecosystem.current.template.tag = templateTag;
  ecosystem.current.template.commit = templateCommit;
  ecosystem.current.template.releaseUrl = templateReleaseUrl;

  const compatibility = ecosystem.compatibility?.sets?.find(
    candidate => candidate.id === ecosystem.compatibility?.defaultSet,
  );
  if (!compatibility) throw new Error("Ecosystem default compatibility set is not declared");
  compatibility.release = nextReleaseId;
  compatibility.npm = Object.fromEntries(packageVersions);
  compatibility.mavenBom = `${ecosystem.current.maven.group}:vireo-bom:${jvmVersion}`;
  compatibility.templateVersion = templateVersion;
  compatibility.templateTag = templateTag;
  compatibility.templateCommit = templateCommit;
  compatibility.templateReleaseUrl = templateReleaseUrl;
  updateReleaseReferences(ecosystem.supportLines, oldReleaseId, nextReleaseId);

  updateNpmEntries(currentDocumentation.npm, packageVersions, "Documentation release", "package");
  currentDocumentation.id = nextReleaseId;
  currentDocumentation.jvm.version = jvmVersion;
  currentDocumentation.template.version = templateVersion;
  currentDocumentation.template.tag = templateTag;
  currentDocumentation.template.commit = templateCommit;
  currentDocumentation.template.releaseUrl = templateReleaseUrl;
  currentDocumentation.releaseLinks.jvmTag = `https://github.com/vireocodedev/starter/releases/tag/jvm-v${jvmVersion}`;
  currentDocumentation.releaseLinks.template = templateReleaseUrl;
  documentation.currentRelease = nextReleaseId;
  updateReleaseReferences(lifecycle.supportLines, oldReleaseId, nextReleaseId);

  const readmePath = join(repositoryRoot, "README.md");
  const compatibilityPath = join(repositoryRoot, "docs", "COMPATIBILITY.md");
  const portalPath = join(repositoryRoot, "docs", "DOCUMENTATION_PORTAL.md");
  let readme = readFileSync(readmePath, "utf8");
  let compatibilityMarkdown = readFileSync(compatibilityPath, "utf8");
  for (const [name, version] of packageVersions) {
    readme = replaceMarkdownTableVersion(readme, name, version, readmePath);
    compatibilityMarkdown = replaceMarkdownTableVersion(compatibilityMarkdown, name, version, compatibilityPath);
  }
  compatibilityMarkdown = replaceMarkdownTableVersion(
    compatibilityMarkdown,
    `${ecosystem.current.maven.group}:vireo-*`,
    jvmVersion,
    compatibilityPath,
  );
  const portal = readFileSync(portalPath, "utf8").replaceAll(oldReleaseId, nextReleaseId);
  const siteOutputs = replaceCurrentTemplateCommitInSite(repositoryRoot, oldTemplateCommit, templateCommit);

  const outputs = [
    [ecosystemPath, JSON.stringify(ecosystem)],
    [documentationPath, JSON.stringify(documentation)],
    [lifecyclePath, JSON.stringify(lifecycle)],
    [createSourcePath, createSource],
    [upgradePolicyPath, JSON.stringify(upgradePolicy)],
    [packageLockPath, JSON.stringify(packageLock)],
    [readmePath, readme],
    [compatibilityPath, compatibilityMarkdown],
    [portalPath, portal],
    ...siteOutputs,
  ];
  const formatted = await Promise.all(
    outputs.map(async ([path, content]) => {
      const prettierOptions = (await resolveConfig(path)) ?? {};
      return [path, await format(content, { ...prettierOptions, filepath: path })];
    }),
  );
  for (const [path, content] of formatted) writeFileSync(path, content);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function updatePublicWorkspaceLockEntries(packageLock, publicWorkspacePackages) {
  if (!packageLock.packages || typeof packageLock.packages !== "object") {
    throw new Error("Root package-lock.json must declare workspace package entries");
  }
  for (const { directory, name, version } of publicWorkspacePackages) {
    const path = `packages/${directory}`;
    const entry = packageLock.packages[path];
    if (!entry || typeof entry !== "object") {
      throw new Error(`Root package-lock.json is missing public workspace entry ${path} (${name})`);
    }
    entry.version = version;
  }
}

function replaceCurrentTemplateCommitInSite(repositoryRoot, oldTemplateCommit, templateCommit) {
  if (oldTemplateCommit === templateCommit) return [];
  return collectSiteTextSources(join(repositoryRoot, "site"))
    .map(path => [path, readFileSync(path, "utf8").replaceAll(oldTemplateCommit, templateCommit)])
    .filter(([path, content]) => content !== readFileSync(path, "utf8"));
}

function collectSiteTextSources(directory) {
  if (!existsSync(directory)) return [];
  const excludedDirectories = new Set(["build", "dist", "node_modules", "static"]);
  const textExtensions = new Set([".json", ".md", ".mjs"]);
  const paths = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!excludedDirectories.has(entry.name)) paths.push(...collectSiteTextSources(path));
    } else if (entry.isFile() && textExtensions.has(extname(entry.name))) {
      paths.push(path);
    }
  }
  return paths;
}

function updateNpmEntries(entries, packageVersions, label, nameKey = "name") {
  if (!Array.isArray(entries)) throw new Error(`${label} npm artifacts are not declared`);
  const declaredNames = new Set(entries.map(entry => entry[nameKey]));
  const workspaceNames = new Set(packageVersions.keys());
  if (
    declaredNames.size !== entries.length ||
    declaredNames.size !== workspaceNames.size ||
    [...workspaceNames].some(name => !declaredNames.has(name))
  ) {
    throw new Error(`${label} npm artifacts do not match the public workspaces`);
  }
  for (const entry of entries) entry.version = packageVersions.get(entry[nameKey]);
}

function updateReleaseReferences(lines, oldReleaseId, nextReleaseId) {
  if (!Array.isArray(lines)) throw new Error("Release support lines are not declared");
  let replacements = 0;
  for (const line of lines) {
    if (line.release !== oldReleaseId) continue;
    line.release = nextReleaseId;
    replacements += 1;
  }
  if (replacements === 0) throw new Error(`No support line references current release ${oldReleaseId}`);
}

function replaceMarkdownTableVersion(markdown, artifact, version, path) {
  let matches = 0;
  const lines = markdown.split("\n").map(line => {
    if (!line.startsWith("|")) return line;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map(cell => cell.trim());
    if (cells.length < 2 || !cells[0].includes(artifact)) return line;
    matches += 1;
    cells[1] = version;
    return `| ${cells.join(" | ")} |`;
  });
  if (matches !== 1) throw new Error(`${path} must contain exactly one table row for ${artifact}`);
  return lines.join("\n");
}
