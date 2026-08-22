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
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(repoRoot, "packages");
const rootNodeModules = join(repoRoot, "node_modules");

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

function validatePackageContents(packageDirectory, manifest) {
  const files = readdirSync(packageDirectory, { withFileTypes: true });
  const unexpected = files
    .map(entry => entry.name)
    .filter(name => name !== "dist" && name !== "package.json" && !/^(?:README|LICENSE)/iu.test(name));
  if (unexpected.length > 0) {
    throw new Error(`${manifest.name} publishes unexpected top-level files: ${unexpected.join(", ")}`);
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

  execFileSync("npm", ["pack", "--workspaces", "--pack-destination", tarballRoot, "--json", "--ignore-scripts"], {
    cwd: repoRoot,
    env: { ...process.env, npm_config_cache: join(auditRoot, "npm-cache") },
    stdio: "ignore",
  });

  const packages = publishedPackages();
  const tarballs = readdirSync(tarballRoot).filter(file => file.endsWith(".tgz"));
  if (tarballs.length !== packages.length) {
    throw new Error(`Expected ${packages.length} tarballs, but npm produced ${tarballs.length}.`);
  }

  const nodeSpecifiers = [];
  const browserSpecifiers = [];
  const summary = [];
  for (const { manifest: sourceManifest } of packages) {
    const prefix = `${sourceManifest.name.replace(/^@/u, "").replace(/\//gu, "-")}-${sourceManifest.version}`;
    const tarball = tarballs.find(file => file === `${prefix}.tgz`);
    if (!tarball) throw new Error(`No tarball was produced for ${sourceManifest.name}.`);

    const packageDirectory = join(consumerScope, sourceManifest.name.split("/")[1]);
    mkdirSync(packageDirectory, { recursive: true });
    execFileSync("tar", ["-xzf", join(tarballRoot, tarball), "-C", packageDirectory, "--strip-components=1"]);

    const packedManifest = JSON.parse(readFileSync(join(packageDirectory, "package.json"), "utf8"));
    validatePackageContents(packageDirectory, packedManifest);
    const packageEntries = packageSpecifiers(packedManifest);
    if (packedManifest.name === "@vireocodedev/starter-ui") browserSpecifiers.push(...packageEntries);
    else nodeSpecifiers.push(...packageEntries);
    summary.push({ name: packedManifest.name, entries: packageEntries.length, tarball });
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
  console.log("Package                                      Entries  Tarball");
  console.log("-------------------------------------------  -------  -----------------------------------------------");
  for (const item of summary) {
    console.log(`${item.name.padEnd(43)}  ${String(item.entries).padStart(7)}  ${basename(item.tarball)}`);
  }
  console.log("");
  console.log(
    `Validated ${summary.length} packages and ${nodeSpecifiers.length + browserSpecifiers.length} public runtime entry points (${nodeSpecifiers.length} native ESM, ${browserSpecifiers.length} browser-bundled).`,
  );
} finally {
  rmSync(auditRoot, { recursive: true, force: true });
}
