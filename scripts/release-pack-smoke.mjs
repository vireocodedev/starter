import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(repoRoot, "packages");
const rootNodeModules = join(repoRoot, "node_modules");
const rootLicense = readFileSync(join(repoRoot, "LICENSE"), "utf8");
const expectedRepositoryUrl = "git+https://github.com/vireocodedev/starter.git";
const expectedRegistry = "https://npm.pkg.github.com";
const installLifecycleScripts = ["preinstall", "install", "postinstall", "prepare", "prepublish", "prepublishOnly"];
const forbiddenPackedPath =
  /(?:^|\/)(?:\.env(?:\.|$)|\.git(?:\/|$)|\.npmrc$|__tests__(?:\/|$)|coverage(?:\/|$)|node_modules(?:\/|$)|src(?:\/|$)|storybook-static(?:\/|$)|tests?(?:\/|$))/iu;
const sensitivePackedContent = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/u,
  /\bAKIA[0-9A-Z]{16}\b/u,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/u,
  /\bnpm_[A-Za-z0-9]{20,}\b/u,
  /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/u,
  /(?:\/home\/[^/\s]+\/|[A-Za-z]:\\Users\\[^\\\s]+\\)/u,
];

function publishedPackages() {
  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const directory = join(packagesRoot, entry.name);
      const manifestPath = join(directory, "package.json");
      if (!existsSync(manifestPath)) return undefined;
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      return manifest.private ? undefined : { directory, manifest };
    })
    .filter(Boolean);
}

function entryTargets(target) {
  if (typeof target === "string") return [target];
  if (!target || typeof target !== "object") return [];
  return [target.types, target.import, target.default].filter(value => typeof value === "string");
}

function packageSpecifiers(manifest) {
  return Object.keys(manifest.exports ?? { ".": manifest.main }).map(subpath =>
    subpath === "." ? manifest.name : `${manifest.name}${subpath.slice(1)}`,
  );
}

function walkFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(path) : [path];
  });
}

function validateManifest(sourceDirectory, sourceManifest, packedManifest) {
  const expectedDirectory = relative(repoRoot, sourceDirectory).replaceAll("\\", "/");
  if (packedManifest.name !== sourceManifest.name || packedManifest.version !== sourceManifest.version) {
    throw new Error(`${sourceManifest.name} packed identity differs from its source manifest.`);
  }
  if (packedManifest.private === true) throw new Error(`${sourceManifest.name} is marked private.`);
  if (packedManifest.license !== "MIT") throw new Error(`${sourceManifest.name} must declare the MIT license.`);
  if (typeof packedManifest.description !== "string" || packedManifest.description.trim() === "") {
    throw new Error(`${sourceManifest.name} must have a package description.`);
  }
  if (
    packedManifest.repository?.type !== "git" ||
    packedManifest.repository?.url !== expectedRepositoryUrl ||
    packedManifest.repository?.directory !== expectedDirectory
  ) {
    throw new Error(`${sourceManifest.name} has incomplete or incorrect repository metadata.`);
  }
  if (packedManifest.publishConfig?.registry !== expectedRegistry) {
    throw new Error(`${sourceManifest.name} does not target the reviewed package registry.`);
  }
  if (JSON.stringify(packedManifest.files) !== JSON.stringify(["dist"])) {
    throw new Error(`${sourceManifest.name} must publish only its dist allowlist.`);
  }
  const unsafeScripts = installLifecycleScripts.filter(script => packedManifest.scripts?.[script]);
  if (unsafeScripts.length > 0) {
    throw new Error(`${sourceManifest.name} publishes install lifecycle hooks: ${unsafeScripts.join(", ")}`);
  }
}

function validatePackageContents(packageDirectory, sourceDirectory, sourceManifest, packMetadata) {
  const manifest = JSON.parse(readFileSync(join(packageDirectory, "package.json"), "utf8"));
  validateManifest(sourceDirectory, sourceManifest, manifest);

  const files = readdirSync(packageDirectory, { withFileTypes: true });
  const unexpected = files
    .map(entry => entry.name)
    .filter(name => name !== "dist" && name !== "package.json" && !/^(?:README|LICENSE)/iu.test(name));
  if (unexpected.length > 0) {
    throw new Error(`${manifest.name} publishes unexpected top-level files: ${unexpected.join(", ")}`);
  }

  for (const required of ["README.md", "LICENSE"]) {
    if (!existsSync(join(packageDirectory, required))) {
      throw new Error(`${manifest.name} tarball is missing ${required}.`);
    }
  }
  if (readFileSync(join(packageDirectory, "LICENSE"), "utf8") !== rootLicense) {
    throw new Error(`${manifest.name} publishes license text that differs from the repository license.`);
  }

  const forbiddenPaths = packMetadata.files.map(file => file.path).filter(path => forbiddenPackedPath.test(path));
  if (forbiddenPaths.length > 0) {
    throw new Error(`${manifest.name} publishes forbidden paths: ${forbiddenPaths.join(", ")}`);
  }
  for (const file of walkFiles(packageDirectory)) {
    const contents = readFileSync(file);
    if (contents.includes(0)) continue;
    const text = contents.toString("utf8");
    if (sensitivePackedContent.some(pattern => pattern.test(text))) {
      throw new Error(`${manifest.name} publishes sensitive content in ${relative(packageDirectory, file)}.`);
    }
  }

  for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
    const targets = entryTargets(target);
    if (targets.length === 0) throw new Error(`${manifest.name} ${subpath} has no publishable export target.`);
    for (const targetPath of targets) {
      if (!existsSync(join(packageDirectory, targetPath))) {
        throw new Error(`${manifest.name} ${subpath} points to missing packed file ${targetPath}.`);
      }
    }
  }

  return manifest;
}

function linkExternalDependencies(consumerNodeModules) {
  for (const entry of readdirSync(rootNodeModules, { withFileTypes: true })) {
    if (entry.name === ".bin" || entry.name === ".package-lock.json" || entry.name === "@vireocodedev") continue;
    symlinkSync(join(rootNodeModules, entry.name), join(consumerNodeModules, entry.name), "dir");
  }
}

const auditRoot = mkdtempSync(join(tmpdir(), "starter-release-smoke-"));
const tarballRoot = join(auditRoot, "tarballs");
const consumerRoot = join(auditRoot, "consumer");
const consumerNodeModules = join(consumerRoot, "node_modules");
const consumerScope = join(consumerNodeModules, "@vireocodedev");

try {
  mkdirSync(tarballRoot, { recursive: true });
  mkdirSync(consumerScope, { recursive: true });
  linkExternalDependencies(consumerNodeModules);

  const packOutput = execFileSync(
    "npm",
    ["pack", "--workspaces", "--pack-destination", tarballRoot, "--json", "--ignore-scripts"],
    {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...process.env, npm_config_cache: join(auditRoot, "npm-cache") },
      stdio: ["ignore", "pipe", "inherit"],
    },
  );
  const packMetadata = JSON.parse(packOutput);

  const packages = publishedPackages();
  const tarballs = readdirSync(tarballRoot).filter(file => file.endsWith(".tgz"));
  if (tarballs.length !== packages.length) {
    throw new Error(`Expected ${packages.length} tarballs, but npm produced ${tarballs.length}.`);
  }

  const nodeSpecifiers = [];
  const browserSpecifiers = [];
  const summary = [];
  for (const { directory: sourceDirectory, manifest: sourceManifest } of packages) {
    const prefix = `${sourceManifest.name.replace(/^@/u, "").replace(/\//gu, "-")}-${sourceManifest.version}`;
    const tarball = tarballs.find(file => file === `${prefix}.tgz`);
    if (!tarball) throw new Error(`No tarball was produced for ${sourceManifest.name}.`);

    const packageDirectory = join(consumerScope, sourceManifest.name.split("/")[1]);
    mkdirSync(packageDirectory, { recursive: true });
    execFileSync("tar", ["-xzf", join(tarballRoot, tarball), "-C", packageDirectory, "--strip-components=1"]);

    const metadata = packMetadata.find(item => item.name === sourceManifest.name);
    if (!metadata) throw new Error(`npm did not report pack metadata for ${sourceManifest.name}.`);
    const packedManifest = validatePackageContents(packageDirectory, sourceDirectory, sourceManifest, metadata);
    const packageEntries = packageSpecifiers(packedManifest);
    if (packedManifest.name === "@vireocodedev/starter-ui") browserSpecifiers.push(...packageEntries);
    else nodeSpecifiers.push(...packageEntries);
    summary.push({
      name: packedManifest.name,
      entries: packageEntries.length,
      files: metadata.entryCount,
      size: metadata.size,
      unpackedSize: metadata.unpackedSize,
      integrity: metadata.integrity,
      tarball,
    });
  }

  const smokeSource = `
    const specifiers = JSON.parse(process.argv[1]);
    const expectedRoot = process.argv[2];
    for (const specifier of specifiers) {
      const resolved = import.meta.resolve(specifier);
      if (!resolved.startsWith(expectedRoot)) {
        throw new Error(specifier + " resolved outside packed consumer: " + resolved);
      }
      await import(specifier);
    }
  `;
  const expectedRoot = pathToFileURL(`${consumerScope}/`).href;
  execFileSync("node", ["--input-type=module", "--eval", smokeSource, JSON.stringify(nodeSpecifiers), expectedRoot], {
    cwd: consumerRoot,
    stdio: "inherit",
  });

  const browserEntry = join(consumerRoot, "browser-entry.mjs");
  const viteConfig = join(consumerRoot, "vite.config.mjs");
  writeFileSync(browserEntry, browserSpecifiers.map(specifier => `import ${JSON.stringify(specifier)};`).join("\n"));
  writeFileSync(
    viteConfig,
    `export default {
      logLevel: "silent",
      build: {
        lib: { entry: ${JSON.stringify(browserEntry)}, formats: ["es"], fileName: "browser-smoke" },
        rollupOptions: {
          external: id => !id.startsWith("@vireocodedev/") && !id.startsWith(".") && !id.startsWith("/")
        }
      }
    };`,
  );
  execFileSync("node", [join(rootNodeModules, "vite/bin/vite.js"), "build", "--config", viteConfig], {
    cwd: consumerRoot,
    stdio: "inherit",
  });

  console.log("Packed release smoke test passed.");
  console.log("Package                                      Exports  Files  Packed KiB  Unpacked KiB");
  console.log("-------------------------------------------  -------  -----  ----------  ------------");
  for (const item of summary) {
    console.log(
      `${item.name.padEnd(43)}  ${String(item.entries).padStart(7)}  ${String(item.files).padStart(5)}  ${(item.size / 1024).toFixed(1).padStart(10)}  ${(item.unpackedSize / 1024).toFixed(1).padStart(12)}`,
    );
  }
  console.log("");
  console.log(
    `Validated ${summary.length} licensed packages and ${nodeSpecifiers.length + browserSpecifiers.length} public runtime entry points (${nodeSpecifiers.length} native ESM, ${browserSpecifiers.length} browser-bundled).`,
  );
  console.log("npm supplied a content integrity digest for every tarball.");
} finally {
  rmSync(auditRoot, { recursive: true, force: true });
}
