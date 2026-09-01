import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { format, resolveConfig } from "prettier";

export async function synchronizeDocumentationRelease(repositoryRoot) {
  const contractsDirectory = join(repositoryRoot, "contracts");
  const ecosystemPath = join(contractsDirectory, "ecosystem-release-contract.json");
  const documentationPath = join(contractsDirectory, "documentation-release-policy.json");
  const lifecyclePath = join(contractsDirectory, "release-lifecycle-policy.json");
  const ecosystem = readJson(ecosystemPath);
  const oldTemplateCommit = ecosystem.current?.template?.commit;
  const oldTemplateVersion = ecosystem.current?.template?.version;
  if (!/^[a-f0-9]{40}$/u.test(oldTemplateCommit ?? "")) {
    throw new Error("Ecosystem current template must pin an exact starter-template commit");
  }
  if (!/^\d+\.\d+\.\d+$/u.test(oldTemplateVersion ?? "")) {
    throw new Error("Ecosystem current template must declare a semantic version");
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
  const templateReleaseUrl = `https://github.com/vireocodedev/vireo-template/releases/tag/${encodeURIComponent(templateTag)}`;

  const gradleProperties = readFileSync(join(repositoryRoot, "jvm", "gradle.properties"), "utf8");
  const jvmVersion = gradleProperties.match(/^version=(.+)$/mu)?.[1];
  if (!jvmVersion) throw new Error("jvm/gradle.properties has no version");

  const createSourcePath = join(repositoryRoot, "packages", "create-vireo", "src", "index.ts");
  let createSource = readFileSync(createSourcePath, "utf8");
  let templateCommit = createSource.match(/TEMPLATE_COMMIT = "([a-f0-9]{40})"/u)?.[1];
  if (!templateCommit) throw new Error("create-vireo does not pin an exact starter-template commit");
  const declaredCreateVireoVersion = createSource.match(/CREATE_VIREO_PACKAGE_VERSION = "([^"]+)"/u)?.[1];
  if (!declaredCreateVireoVersion)
    throw new Error("create-vireo does not declare its generated-project package version");
  const declaredTemplateStarterJvmBaseline = createSource.match(/TEMPLATE_STARTER_JVM_BASELINE = "([^"]+)"/u)?.[1];
  if (!declaredTemplateStarterJvmBaseline) {
    throw new Error("create-vireo does not declare its starter JVM baseline");
  }
  createSource = createSource.replace(
    `CREATE_VIREO_PACKAGE_VERSION = "${declaredCreateVireoVersion}"`,
    `CREATE_VIREO_PACKAGE_VERSION = "${createVireoVersion}"`,
  );

  const upgradePolicyPath = join(repositoryRoot, "packages", "create-vireo", "schema", "vireo-upgrade-policy.json");
  const upgradePolicy = readJson(upgradePolicyPath);
  const projectUpgradePath = join(repositoryRoot, "contracts", "project-upgrade-policy.json");
  const projectUpgrade = readJson(projectUpgradePath);
  const publicUpgradeRelease = upgradePolicy.releaseGraph?.publicRelease;
  const candidateUpgradeRelease = upgradePolicy.releaseGraph?.candidateRelease;
  const priorPublicUpgradeRelease = upgradePolicy.releaseGraph?.edges?.find(
    edge => edge.to === publicUpgradeRelease,
  )?.from;
  const candidateTemplateCommit = projectUpgrade.finalization?.targetTemplateCommit;
  if (
    upgradePolicy.releaseGraph?.candidateRelease !== undefined &&
    upgradePolicy.releaseGraph.candidateRelease !== createVireoVersion
  ) {
    throw new Error(
      `Candidate upgrade release ${upgradePolicy.releaseGraph.candidateRelease} cannot finalize until create-vireo is versioned to the same release`,
    );
  }
  if (
    upgradePolicy.releaseGraph?.candidateRelease === createVireoVersion &&
    typeof candidateTemplateCommit === "string" &&
    /^[a-f0-9]{40}$/u.test(candidateTemplateCommit)
  ) {
    createSource = createSource.replace(
      `TEMPLATE_COMMIT = "${templateCommit}"`,
      `TEMPLATE_COMMIT = "${candidateTemplateCommit}"`,
    );
    createSource = createSource.replace(
      `TEMPLATE_STARTER_JVM_BASELINE = "${declaredTemplateStarterJvmBaseline}"`,
      `TEMPLATE_STARTER_JVM_BASELINE = "${jvmVersion}"`,
    );
    templateCommit = candidateTemplateCommit;
  }
  finalizeCandidateUpgrade({ upgradePolicy, projectUpgrade, createVireoVersion, templateCommit });
  const currentUpgradeRelease = upgradePolicy.releaseGraph?.releases?.find(
    release =>
      release.release === (upgradePolicy.releaseGraph?.candidateRelease ?? upgradePolicy.releaseGraph?.publicRelease),
  );
  if (!currentUpgradeRelease || typeof currentUpgradeRelease.rootVireoScript !== "string") {
    throw new Error("create-vireo upgrade policy has no candidate/current release root Vireo script");
  }
  currentUpgradeRelease.rootVireoScript = `npx --yes --package=create-vireo@${createVireoVersion} vireo`;
  currentUpgradeRelease.templateCommit = templateCommit;
  currentUpgradeRelease.starterJvmVersion = jvmVersion;
  const currentReleaseCoordinate =
    projectUpgrade.releaseCoordinates?.[
      upgradePolicy.releaseGraph?.candidateRelease ?? upgradePolicy.releaseGraph?.publicRelease
    ];
  if (!currentReleaseCoordinate || typeof currentReleaseCoordinate !== "object") {
    throw new Error("Project-upgrade policy has no current release coordinate");
  }
  currentReleaseCoordinate.createVireo = createVireoVersion;
  currentReleaseCoordinate.templateVersion = templateVersion;
  currentReleaseCoordinate.templateCommit = templateCommit;
  currentReleaseCoordinate.starterJvmVersion = jvmVersion;

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
  currentDocumentation.releaseLinks.jvmTag = `https://github.com/vireocodedev/vireo/releases/tag/jvm-v${jvmVersion}`;
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
  const siteOutputs = replaceCurrentTemplateReferencesInSite(
    repositoryRoot,
    oldTemplateCommit,
    templateCommit,
    oldTemplateVersion,
    templateVersion,
  );
  const currentReleaseGuidance =
    candidateUpgradeRelease === createVireoVersion
      ? synchronizeCurrentReleaseGuidance({
          repositoryRoot,
          readme,
          compatibilityMarkdown,
          oldTemplateCommit,
          templateCommit,
          oldTemplateVersion,
          templateVersion,
          priorPublicUpgradeRelease,
          publicUpgradeRelease,
          candidateUpgradeRelease,
          jvmVersion,
        })
      : undefined;

  const outputs = [
    [ecosystemPath, JSON.stringify(ecosystem)],
    [documentationPath, JSON.stringify(documentation)],
    [lifecyclePath, JSON.stringify(lifecycle)],
    [createSourcePath, createSource],
    [upgradePolicyPath, JSON.stringify(upgradePolicy)],
    [projectUpgradePath, JSON.stringify(projectUpgrade)],
    [packageLockPath, JSON.stringify(packageLock)],
    [readmePath, currentReleaseGuidance?.readme ?? readme],
    [compatibilityPath, currentReleaseGuidance?.compatibilityMarkdown ?? compatibilityMarkdown],
    [portalPath, portal],
    ...(currentReleaseGuidance?.outputs ?? []),
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

function finalizeCandidateUpgrade({ upgradePolicy, projectUpgrade, createVireoVersion, templateCommit }) {
  const graph = upgradePolicy.releaseGraph;
  if (!graph?.candidateRelease) return;
  const candidateRelease = graph.candidateRelease;
  if (createVireoVersion !== candidateRelease) {
    throw new Error(
      `Candidate upgrade release ${candidateRelease} cannot finalize until create-vireo is versioned to the same release`,
    );
  }
  const current = graph.releases?.find(release => release.release === graph.publicRelease);
  const candidate = graph.releases?.find(release => release.release === candidateRelease);
  const currentCoordinate = projectUpgrade.releaseCoordinates?.[graph.publicRelease];
  const candidateCoordinate = projectUpgrade.releaseCoordinates?.[candidateRelease];
  if (
    !current ||
    current.status !== "current" ||
    !/^[a-f0-9]{40}$/u.test(current.templateCommit ?? "") ||
    !candidate ||
    candidate.status !== "candidate" ||
    candidate.templateCommit !== templateCommit ||
    !/^[a-f0-9]{40}$/u.test(templateCommit) ||
    !graph.edges?.some(edge => edge.from === current.release && edge.to === candidate.release) ||
    projectUpgrade.publicationState !== "candidate" ||
    projectUpgrade.publicRelease !== current.release ||
    projectUpgrade.candidateRelease !== candidate.release ||
    projectUpgrade.previousRelease !== current.release ||
    projectUpgrade.finalization?.targetTemplateCommit !== templateCommit ||
    currentCoordinate?.status !== "current" ||
    candidateCoordinate?.status !== "candidate" ||
    candidateCoordinate?.templateCommit !== templateCommit
  ) {
    throw new Error("Candidate project-upgrade release is not ready for immutable finalization");
  }

  current.status = "historical";
  candidate.status = "current";
  graph.publicRelease = candidate.release;
  graph.previousRelease = current.release;
  delete graph.candidateRelease;

  currentCoordinate.status = "historical";
  candidateCoordinate.status = "current";
  projectUpgrade.publicRelease = candidate.release;
  projectUpgrade.previousRelease = current.release;
  projectUpgrade.publicationState = "final";
  delete projectUpgrade.candidateRelease;
  delete projectUpgrade.finalization;
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

function replaceCurrentTemplateReferencesInSite(
  repositoryRoot,
  oldTemplateCommit,
  templateCommit,
  oldTemplateVersion,
  templateVersion,
) {
  if (oldTemplateCommit === templateCommit && oldTemplateVersion === templateVersion) return [];
  const currentReferences = [
    { path: "content/offline.md", commits: 2, versionReference: `pinned ${oldTemplateVersion} Template` },
    {
      path: "content/design-system-overview.md",
      commits: 7,
      versionReference: `current ${oldTemplateVersion} Template`,
    },
    { path: "content/manifest.json", commits: 9 },
    { path: "verify.mjs", commits: 2 },
    { path: "build.test.mjs", commits: 2 },
  ];
  return currentReferences.map(reference => {
    const path = join(repositoryRoot, "site", reference.path);
    let content = replaceExactCount(
      readFileSync(path, "utf8"),
      oldTemplateCommit,
      templateCommit,
      reference.commits,
      `site/${reference.path} current Template commit`,
    );
    if (reference.versionReference) {
      content = replaceRequired(
        content,
        reference.versionReference,
        reference.versionReference.replace(oldTemplateVersion, templateVersion),
        `site/${reference.path} current Template version`,
      );
    }
    return [path, content];
  });
}

function synchronizeCurrentReleaseGuidance({
  repositoryRoot,
  readme,
  compatibilityMarkdown,
  oldTemplateCommit,
  templateCommit,
  oldTemplateVersion,
  templateVersion,
  priorPublicUpgradeRelease,
  publicUpgradeRelease,
  candidateUpgradeRelease,
  jvmVersion,
}) {
  if (!priorPublicUpgradeRelease || !publicUpgradeRelease || !candidateUpgradeRelease) {
    throw new Error("Candidate finalization must retain the prior public project-upgrade edge");
  }
  const historicalEdge = `${priorPublicUpgradeRelease}→${publicUpgradeRelease}`;
  const currentEdge = `${publicUpgradeRelease}→${candidateUpgradeRelease}`;
  const updatedReadme = replaceRequired(
    readme.replaceAll(oldTemplateCommit, templateCommit),
    `in \`create-vireo@${publicUpgradeRelease}\`. Its version-aware\nproject upgrade currently supports the explicit adjacent ${historicalEdge} release\npair;`,
    `in \`create-vireo@${candidateUpgradeRelease}\`. Its version-aware\nproject upgrade currently supports the explicit adjacent ${currentEdge} release\npair; ${historicalEdge} remains retained historical evidence;`,
    "README.md current project-upgrade guidance",
  );
  let updatedCompatibility = replaceRequired(
    compatibilityMarkdown,
    `edge is ${historicalEdge};`,
    `edge is ${currentEdge}; ${historicalEdge} remains retained historical evidence;`,
    "docs/COMPATIBILITY.md current project-upgrade edge",
  );
  updatedCompatibility = replaceCurrentTemplateBaseline(
    updatedCompatibility,
    oldTemplateVersion,
    templateVersion,
    publicUpgradeRelease,
    candidateUpgradeRelease,
    historicalEdge,
    jvmVersion,
    "docs/COMPATIBILITY.md current Template baseline",
  );

  const createReadmePath = join(repositoryRoot, "packages", "create-vireo", "README.md");
  let createReadme = readFileSync(createReadmePath, "utf8").replaceAll(oldTemplateCommit, templateCommit);
  createReadme = replaceRequired(
    createReadme,
    `The current supported adjacent release pair is a project created by \`create-vireo\`\n${priorPublicUpgradeRelease} upgraded to ${publicUpgradeRelease}.`,
    `The current supported adjacent release pair is a project created by \`create-vireo\`\n${publicUpgradeRelease} upgraded to ${candidateUpgradeRelease}. The ${historicalEdge} edge remains historical evidence.`,
    "packages/create-vireo/README.md current project-upgrade pair",
  );
  for (const mode of ["--dry-run", "--apply --accept-application-owned"]) {
    createReadme = replaceRequired(
      createReadme,
      `vireo upgrade --to ${publicUpgradeRelease} ${mode}`,
      `vireo upgrade --to ${candidateUpgradeRelease} ${mode}`,
      `packages/create-vireo/README.md current ${mode} command`,
    );
  }
  createReadme = replaceRequired(
    createReadme,
    `For the current ${historicalEdge}\nedge, Vireo adds the six managed application-skill files under\n\`.agents/skills/\`; it never overwrites the application-owned root\n\`AGENTS.md\`, source, deployment descriptors, or \`.github\`\nreview policy.`,
    `For the current ${currentEdge}\nedge, Vireo updates only managed release-coordinate, provenance, and pinned CLI metadata while retaining the six managed application-skill files introduced by the historical ${historicalEdge} edge; it never overwrites the application-owned root\n\`AGENTS.md\`, source, deployment descriptors, or \`.github\` review policy.`,
    "packages/create-vireo/README.md current managed edge description",
  );
  createReadme = replaceCurrentTemplateBaseline(
    createReadme,
    oldTemplateVersion,
    templateVersion,
    publicUpgradeRelease,
    candidateUpgradeRelease,
    historicalEdge,
    jvmVersion,
    "packages/create-vireo/README.md current Template baseline",
  );

  const npmReleasePath = join(repositoryRoot, "docs", "NPM_RELEASE.md");
  const npmRelease = replaceRequired(
    readFileSync(npmReleasePath, "utf8"),
    `\`starter-template@${oldTemplateVersion}\` release is already published`,
    `\`starter-template@${templateVersion}\` release is already published`,
    "docs/NPM_RELEASE.md current Template release prerequisite",
  );
  const additionalGuidanceOutputs = synchronizeAdditionalCurrentGuidance({
    repositoryRoot,
    priorPublicUpgradeRelease,
    publicUpgradeRelease,
    candidateUpgradeRelease,
  });
  return {
    readme: updatedReadme,
    compatibilityMarkdown: updatedCompatibility,
    outputs: [[createReadmePath, createReadme], [npmReleasePath, npmRelease], ...additionalGuidanceOutputs],
  };
}

function synchronizeAdditionalCurrentGuidance({
  repositoryRoot,
  priorPublicUpgradeRelease,
  publicUpgradeRelease,
  candidateUpgradeRelease,
}) {
  const historicalEdge = `${priorPublicUpgradeRelease}→${publicUpgradeRelease}`;
  const currentEdge = `${publicUpgradeRelease}→${candidateUpgradeRelease}`;
  const historicalHyphenEdge = `${priorPublicUpgradeRelease}-to-${publicUpgradeRelease}`;
  const currentHyphenEdge = `${publicUpgradeRelease}-to-${candidateUpgradeRelease}`;
  const frontendProfilePath = join(repositoryRoot, "docs", "architecture", "frontend-only-profile.md");
  let frontendProfile = replaceRequired(
    readFileSync(frontendProfilePath, "utf8"),
    `is \`create-vireo@${publicUpgradeRelease}\`.`,
    `is \`create-vireo@${candidateUpgradeRelease}\`.`,
    "docs/architecture/frontend-only-profile.md current profile contract",
  );
  frontendProfile = replaceRequired(
    frontendProfile,
    `The public \`create-vireo@${publicUpgradeRelease}\` CLI unit suite`,
    `The public \`create-vireo@${candidateUpgradeRelease}\` CLI unit suite`,
    "docs/architecture/frontend-only-profile.md current profile evidence",
  );

  const generatedOwnershipPath = join(repositoryRoot, "docs", "architecture", "generated-code-ownership.md");
  const generatedOwnership = replaceRequired(
    readFileSync(generatedOwnershipPath, "utf8"),
    `The current supported ${historicalHyphenEdge} project upgrade admits declared manifests without\nregeneration.`,
    `The current supported ${currentHyphenEdge} project upgrade admits declared manifests without\nregeneration. The ${historicalHyphenEdge} edge remains retained historical evidence.`,
    "docs/architecture/generated-code-ownership.md current project-upgrade edge",
  );

  const phaseBacklogPath = join(repositoryRoot, "docs", "roadmap", "phase-4", "backlog.md");
  const phaseBacklog = replaceRequired(
    readFileSync(phaseBacklogPath, "utf8"),
    `The current public \`create-vireo@${publicUpgradeRelease}\` line and its supported ${historicalEdge}\nadjacent upgrade fixture are complete.`,
    `The current public \`create-vireo@${candidateUpgradeRelease}\` line and its supported ${currentEdge}\nadjacent upgrade fixture are complete; ${historicalEdge} remains retained historical evidence.`,
    "docs/roadmap/phase-4/backlog.md current release contract",
  );

  const readinessPath = join(repositoryRoot, "docs", "roadmap", "phase-4", "production-readiness-criteria.md");
  const readinessCriteria = replaceRequired(
    readFileSync(readinessPath, "utf8"),
    `Public \`create-vireo\` ${publicUpgradeRelease} declares the current ${historicalEdge} edge with dry run, explicit apply, refusal, ownership and rollback guidance; frontend/full-stack unit fixtures exercise the six managed application-skill additions for both profiles.`,
    `Public \`create-vireo\` ${candidateUpgradeRelease} declares the current ${currentEdge} edge with dry run, explicit apply, refusal, ownership and rollback guidance; its metadata/provenance fixtures retain the six managed application-skill additions introduced by the historical ${historicalEdge} edge.`,
    "docs/roadmap/phase-4/production-readiness-criteria.md current release compatibility",
  );
  return [
    [frontendProfilePath, frontendProfile],
    [generatedOwnershipPath, generatedOwnership],
    [phaseBacklogPath, phaseBacklog],
    [readinessPath, readinessCriteria],
  ];
}

function replaceCurrentTemplateBaseline(
  markdown,
  oldTemplateVersion,
  templateVersion,
  publicUpgradeRelease,
  candidateUpgradeRelease,
  historicalEdge,
  jvmVersion,
  label,
) {
  const pattern = new RegExp(
    "The immutable `starter-template@" +
      escapeRegExp(oldTemplateVersion) +
      "` source (?:baseline retains\\n`starterVersion=[^`]+`; `create-vireo@" +
      escapeRegExp(publicUpgradeRelease) +
      "` normalizes generated and upgraded\\nfull-stack consumers to the coordinated `" +
      escapeRegExp(jvmVersion) +
      "` JVM release\\.|commit intentionally retains its\\n`starterVersion=[^`]+` baseline\\. Full-stack creation and the " +
      escapeRegExp(historicalEdge) +
      " upgrade\\nnormalize that managed declaration to the current Vireo JVM release, `" +
      escapeRegExp(jvmVersion) +
      "`, before\\nrecording managed hashes\\.)",
    "u",
  );
  const replacement = `The immutable \`starter-template@${templateVersion}\` source baseline uses\n\`starterVersion=${jvmVersion}\`; \`create-vireo@${candidateUpgradeRelease}\` generates and upgrades\nfull-stack consumers with the coordinated \`${jvmVersion}\` JVM release.`;
  return replacePatternOnce(markdown, pattern, replacement, label);
}

function replaceRequired(markdown, from, to, label) {
  return replaceExactCount(markdown, from, to, 1, label);
}

function replaceExactCount(markdown, from, to, expectedCount, label) {
  const matches = markdown.split(from).length - 1;
  if (matches !== expectedCount)
    throw new Error(`${label} must contain exactly ${expectedCount} current-state reference(s)`);
  return markdown.replaceAll(from, to);
}

function replacePatternOnce(markdown, pattern, replacement, label) {
  const matches = [...markdown.matchAll(new RegExp(pattern.source, `${pattern.flags}g`))];
  if (matches.length !== 1) throw new Error(`${label} must contain exactly one current-state reference`);
  return markdown.replace(pattern, replacement);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
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
