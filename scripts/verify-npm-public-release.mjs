import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { retryTransientNpmRegistryOperation } from "./npm-registry-retry.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagesRoot = join(repositoryRoot, "packages");
const rootNodeModules = join(repositoryRoot, "node_modules");
const registry = "https://registry.npmjs.org";
const outputPath = resolve(repositoryRoot, process.argv[2] ?? ".npm-public-verification.json");
const attempts = positiveInteger(process.env.NPM_PUBLIC_VERIFY_ATTEMPTS, 80);
const intervalMs = positiveInteger(process.env.NPM_PUBLIC_VERIFY_INTERVAL_MS, 15_000);
const expectedPackages = new Map([
  ["history", "@vireocodedev/history"],
  ["infrastructure", "@vireocodedev/infrastructure"],
  ["localization", "@vireocodedev/localization"],
  ["queryengine", "@vireocodedev/query"],
  ["shell", "@vireocodedev/shell"],
  ["sqlite", "@vireocodedev/sqlite"],
  ["ui", "@vireocodedev/ui"],
]);

function positiveInteger(value, fallback) {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive integer, received ${JSON.stringify(value)}.`);
  }
  return parsed;
}

function sleep(milliseconds) {
  return new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));
}

function packageSpecifiers(manifest) {
  return Object.keys(manifest.exports ?? { ".": manifest.main }).map(subpath =>
    subpath === "." ? manifest.name : `${manifest.name}${subpath.slice(1)}`,
  );
}

function installedVersion(name, packageDirectories = []) {
  const manifestPath = [rootNodeModules, ...packageDirectories.map(directory => join(directory, "node_modules"))]
    .map(nodeModules => join(nodeModules, name, "package.json"))
    .find(existsSync);
  if (!manifestPath) throw new Error(`Public consumer verification requires ${name}; run npm ci first.`);
  return JSON.parse(readFileSync(manifestPath, "utf8")).version;
}

function anonymousNpmEnvironment(auditRoot) {
  const environment = Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) =>
        !/(?:^|_)(?:node_auth_token|npm_token|github_token)$/iu.test(key) &&
        !(key.toLowerCase().startsWith("npm_config_") && /auth|token|userconfig/iu.test(key)),
    ),
  );
  return {
    ...environment,
    CI: "true",
    npm_config_always_auth: "false",
    npm_config_cache: join(auditRoot, "npm-cache"),
    npm_config_registry: registry,
    npm_config_userconfig: join(auditRoot, "anonymous.npmrc"),
  };
}

async function registryMetadata(manifest) {
  const coordinate = `${manifest.name}@${manifest.version}`;
  const endpoint = `${registry}/${encodeURIComponent(manifest.name)}/${encodeURIComponent(manifest.version)}`;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(endpoint, { headers: { accept: "application/json" } });
    if (response.ok) {
      const metadata = await response.json();
      if (metadata.name !== manifest.name || metadata.version !== manifest.version) {
        throw new Error(`${coordinate} returned mismatched registry metadata.`);
      }
      if (!metadata.dist?.integrity || !metadata.dist?.tarball?.startsWith(`${registry}/`)) {
        throw new Error(`${coordinate} has incomplete public npm distribution metadata.`);
      }
      if (!metadata.dist?.attestations?.url) {
        if (attempt === attempts) {
          throw new Error(`${coordinate} is public but has no registry provenance attestation.`);
        }
        console.log(
          `${coordinate} is public but its provenance is not visible yet (attempt ${attempt}/${attempts}); waiting ${intervalMs} ms.`,
        );
        await sleep(intervalMs);
        continue;
      }
      return {
        name: metadata.name,
        version: metadata.version,
        integrity: metadata.dist.integrity,
        tarball: metadata.dist.tarball,
        attestation: metadata.dist.attestations.url,
      };
    }
    if (response.status !== 404) {
      throw new Error(`npm returned HTTP ${response.status} while checking ${coordinate}.`);
    }
    if (attempt === attempts) break;
    console.log(`${coordinate} is not visible yet (attempt ${attempt}/${attempts}); waiting ${intervalMs} ms.`);
    await sleep(intervalMs);
  }
  throw new Error(`${coordinate} did not become publicly visible after ${attempts} attempts.`);
}

const packages = [...expectedPackages].map(([directoryName, expectedName]) => {
  const directory = join(packagesRoot, directoryName);
  const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
  if (manifest.name !== expectedName || manifest.private === true) {
    throw new Error(`${directoryName} is not the expected public package ${expectedName}.`);
  }
  return { directory, manifest };
});
const packageDirectories = packages.map(({ directory }) => directory);
const externalDependencies = new Set();
for (const { manifest } of packages) {
  for (const field of ["dependencies", "peerDependencies", "optionalDependencies"]) {
    for (const name of Object.keys(manifest[field] ?? {})) {
      if (!name.startsWith("@vireocodedev/")) externalDependencies.add(name);
    }
  }
}

const registryPackages = [];
for (const { manifest } of packages) registryPackages.push(await registryMetadata(manifest));

const auditRoot = mkdtempSync(join(tmpdir(), "vireo-public-npm-"));
const consumerRoot = join(auditRoot, "consumer");
const consumerNodeModules = join(consumerRoot, "node_modules");
const consumerScope = join(consumerNodeModules, "@vireocodedev");
const anonymousNpmrc = join(auditRoot, "anonymous.npmrc");

try {
  mkdirSync(consumerRoot, { recursive: true });
  writeFileSync(anonymousNpmrc, `registry=${registry}/\nalways-auth=false\n`);
  const exactExternalDependencies = Object.fromEntries(
    [...externalDependencies].sort().map(name => [name, installedVersion(name, packageDirectories)]),
  );
  const exactVireoDependencies = Object.fromEntries(packages.map(({ manifest }) => [manifest.name, manifest.version]));
  const rootManifest = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8"));
  const consumerManifest = {
    name: "vireo-anonymous-public-consumer",
    private: true,
    type: "module",
    dependencies: { ...exactExternalDependencies, ...exactVireoDependencies },
    devDependencies: {
      "@types/react": installedVersion("@types/react", packageDirectories),
      "@types/react-dom": installedVersion("@types/react-dom", packageDirectories),
      "@types/react-transition-group": installedVersion("@types/react-transition-group", packageDirectories),
      typescript: rootManifest.devDependencies.typescript,
      vite: installedVersion("vite", packageDirectories),
    },
  };
  writeFileSync(join(consumerRoot, "package.json"), `${JSON.stringify(consumerManifest, null, 2)}\n`);

  const npmEnvironment = anonymousNpmEnvironment(auditRoot);
  await retryTransientNpmRegistryOperation(
    () => {
      try {
        execFileSync(
          "corepack",
          [
            "npm",
            "install",
            "--ignore-scripts",
            "--no-audit",
            "--no-fund",
            "--strict-peer-deps",
            `--registry=${registry}`,
          ],
          { cwd: consumerRoot, env: npmEnvironment, encoding: "utf8", stdio: ["ignore", "inherit", "pipe"] },
        );
      } catch (error) {
        if (error.stderr) process.stderr.write(error.stderr);
        throw error;
      }
    },
    {
      attempts,
      intervalMs,
      onRetry: (_error, attempt) => {
        rmSync(consumerNodeModules, { recursive: true, force: true });
        rmSync(join(consumerRoot, "package-lock.json"), { force: true });
        console.log(
          `Anonymous install encountered a registry 404 (attempt ${attempt}/${attempts}); waiting ${intervalMs} ms.`,
        );
      },
    },
  );
  execFileSync("corepack", ["npm", "ls", "--all", "--silent"], {
    cwd: consumerRoot,
    env: npmEnvironment,
    stdio: "ignore",
  });

  const lockfile = JSON.parse(readFileSync(join(consumerRoot, "package-lock.json"), "utf8"));
  const resolvedPackages = [];
  for (const { manifest } of packages) {
    const packageDirectory = join(consumerScope, manifest.name.split("/")[1]);
    const installedManifest = JSON.parse(readFileSync(join(packageDirectory, "package.json"), "utf8"));
    const lockEntry = lockfile.packages?.[`node_modules/${manifest.name}`];
    if (lstatSync(packageDirectory).isSymbolicLink()) {
      throw new Error(`${manifest.name} was linked instead of downloaded from npm.`);
    }
    if (!realpathSync(packageDirectory).startsWith(`${realpathSync(consumerRoot)}/`)) {
      throw new Error(`${manifest.name} resolved outside the anonymous consumer.`);
    }
    if (installedManifest.name !== manifest.name || installedManifest.version !== manifest.version) {
      throw new Error(`${manifest.name} installed with an unexpected identity or version.`);
    }
    if (!lockEntry?.resolved?.startsWith(`${registry}/`) || !lockEntry.integrity) {
      throw new Error(`${manifest.name} was not locked to the public npm registry.`);
    }
    resolvedPackages.push({
      name: installedManifest.name,
      version: installedManifest.version,
      resolved: lockEntry.resolved,
      integrity: lockEntry.integrity,
      exports: packageSpecifiers(installedManifest),
    });
  }

  const nodeSpecifiers = [];
  const browserSpecifiers = [];
  for (const item of resolvedPackages) {
    if (item.name === "@vireocodedev/ui") browserSpecifiers.push(...item.exports);
    else nodeSpecifiers.push(...item.exports);
  }
  const runtimeSmoke = `
    const specifiers = JSON.parse(process.argv[1]);
    const expectedRoot = process.argv[2];
    for (const specifier of specifiers) {
      const resolved = import.meta.resolve(specifier);
      if (!resolved.startsWith(expectedRoot)) throw new Error(specifier + " resolved outside npm consumer: " + resolved);
      await import(specifier);
    }
  `;
  execFileSync(
    "node",
    [
      "--input-type=module",
      "--eval",
      runtimeSmoke,
      JSON.stringify(nodeSpecifiers),
      pathToFileURL(`${consumerScope}/`).href,
    ],
    { cwd: consumerRoot, stdio: "inherit" },
  );

  const allSpecifiers = [...nodeSpecifiers, ...browserSpecifiers];
  const typecheckEntry = join(consumerRoot, "consumer.ts");
  const typecheckConfig = join(consumerRoot, "tsconfig.json");
  writeFileSync(
    typecheckEntry,
    `${allSpecifiers
      .map((specifier, index) => `import type * as Package${index} from ${JSON.stringify(specifier)};`)
      .join("\n")}\n`,
  );
  writeFileSync(
    typecheckConfig,
    `${JSON.stringify(
      {
        compilerOptions: {
          jsx: "react-jsx",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: "ES2022",
        },
        files: [typecheckEntry],
      },
      null,
      2,
    )}\n`,
  );
  execFileSync("node", [join(consumerNodeModules, "typescript/bin/tsc"), "--project", typecheckConfig], {
    cwd: consumerRoot,
    stdio: "inherit",
  });

  const browserEntry = join(consumerRoot, "browser-entry.mjs");
  const viteConfig = join(consumerRoot, "vite.config.mjs");
  writeFileSync(
    browserEntry,
    `${browserSpecifiers.map(specifier => `import ${JSON.stringify(specifier)};`).join("\n")}\n`,
  );
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
    };\n`,
  );
  execFileSync("node", [join(consumerNodeModules, "vite/bin/vite.js"), "build", "--config", viteConfig], {
    cwd: consumerRoot,
    stdio: "inherit",
  });

  const signatureAudit = execFileSync("corepack", ["npm", "audit", "signatures"], {
    cwd: consumerRoot,
    env: npmEnvironment,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();
  const evidence = {
    schemaVersion: 1,
    verifiedAt: new Date().toISOString(),
    repository: "https://github.com/vireocodedev/starter",
    commit: process.env.GITHUB_SHA ?? null,
    registry,
    anonymousInstall: true,
    strictPeerDependencies: true,
    skipLibCheck: false,
    runtimeEntryPoints: nodeSpecifiers.length,
    browserEntryPoints: browserSpecifiers.length,
    registryPackages,
    resolvedPackages,
    signatureAudit,
  };
  writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);

  console.log(signatureAudit);
  console.log(
    `Verified ${resolvedPackages.length} public packages and ${allSpecifiers.length} entry points from an anonymous cold npm install.`,
  );
  console.log(`Evidence: ${outputPath}`);
} finally {
  rmSync(auditRoot, { recursive: true, force: true });
}
