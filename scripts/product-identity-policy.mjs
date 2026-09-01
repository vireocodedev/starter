import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const canonicalHomepage = "https://vireocode.com/reference/typescript/";
const canonicalIssues = "https://github.com/vireocodedev/vireo/issues";
const canonicalRepository = "git+https://github.com/vireocodedev/vireo.git";

export function validatePackageIdentity(manifest, directory) {
  const problems = [];
  const label = manifest.name ?? directory;
  if (typeof manifest.description !== "string" || !/\bVireo\b/u.test(manifest.description)) {
    problems.push(`${label} description must identify Vireo`);
  }
  if (
    /vireocodedev starter product|Vireo Starter (?:UI|Auth|Core|Query|History|Offline)/iu.test(
      manifest.description ?? "",
    )
  ) {
    problems.push(`${label} description uses retired product terminology`);
  }
  if (manifest.homepage !== canonicalHomepage) {
    problems.push(`${label} homepage must be ${canonicalHomepage}`);
  }
  if (manifest.bugs?.url !== canonicalIssues) {
    problems.push(`${label} bugs URL must be ${canonicalIssues}`);
  }
  if (manifest.repository?.url !== canonicalRepository || manifest.repository?.directory !== `packages/${directory}`) {
    problems.push(`${label} repository metadata must identify its source directory`);
  }
  return problems;
}

export function validateProductIdentity(root = repositoryRoot) {
  const problems = [];
  let packages = 0;
  for (const entry of readdirSync(join(root, "packages"), { withFileTypes: true })) {
    const manifestPath = join(root, "packages", entry.name, "package.json");
    if (!entry.isDirectory() || !existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (manifest.private === true) continue;
    packages += 1;
    problems.push(...validatePackageIdentity(manifest, entry.name));
  }

  const moduleTitles = {
    "vireo-auth": "Vireo Auth",
    "vireo-core": "Vireo Core",
    "vireo-history": "Vireo History",
    "vireo-offline": "Vireo Offline",
    "vireo-query": "Vireo Query Engine",
  };
  for (const [module, title] of Object.entries(moduleTitles)) {
    const readme = readFileSync(join(root, "jvm", module, "README.md"), "utf8");
    if (!readme.startsWith(`# ${title}\n`)) problems.push(`${module} README must use product title ${title}`);
  }

  const gradle = readFileSync(join(root, "jvm/build.gradle"), "utf8");
  for (const fragment of [
    "description = project.description",
    "url = 'https://vireocode.com/reference/java/'",
    "issueManagement {",
    "organization {",
  ]) {
    if (!gradle.includes(fragment)) problems.push(`Maven publication metadata must contain ${fragment}`);
  }

  const readme = readFileSync(join(root, "README.md"), "utf8");
  if (/Starter UI/u.test(readme)) problems.push("README must call the component product Vireo UI");
  return { packages, problems };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = validateProductIdentity();
  if (result.problems.length > 0) {
    console.error("Product identity policy failed:");
    for (const problem of result.problems) console.error(`- ${problem}`);
    process.exit(1);
  }
  console.log(`Product identity policy passed for ${result.packages} npm packages and 5 JVM modules.`);
}
