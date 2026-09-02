import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { decodeExactNpmProvenance, validateExactNpmRecord } from "./lib/anonymous-public-evidence.mjs";
import { retryTransientNpmRegistryOperation } from "./npm-registry-retry.mjs";
import { resolvePackageBin } from "./package-bin.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = join(root, "packages");
const rootModules = join(root, "node_modules");
const registry = "https://registry.npmjs.org";
const githubApi = "https://api.github.com";
const expectedPackages = new Map([
  ["create-vireo", "create-vireo"],
  ["history", "@vireocodedev/history"],
  ["infrastructure", "@vireocodedev/infrastructure"],
  ["localization", "@vireocodedev/localization"],
  ["queryengine", "@vireocodedev/query"],
  ["shell", "@vireocodedev/shell"],
  ["sqlite", "@vireocodedev/sqlite"],
  ["ui", "@vireocodedev/ui"],
]);

export function parseCommandLine(arguments_ = process.argv.slice(2)) {
  const options = {
    output: "npm-public-verification.json",
    contract: "contracts/ecosystem-release-contract.json",
    expectedReleaseId: null,
  };
  let hasOutput = false;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--contract") {
      options.contract = arguments_[++index] ?? "";
      if (!options.contract) throw new Error("--contract requires a path.");
    } else if (argument === "--expected-release-id") {
      options.expectedReleaseId = arguments_[++index] ?? "";
      if (!options.expectedReleaseId) throw new Error("--expected-release-id requires an exact release id.");
    } else if (argument.startsWith("-")) throw new Error(`Unknown option ${argument}.`);
    else if (!hasOutput) {
      options.output = argument;
      hasOutput = true;
    } else
      throw new Error(
        "Usage: node scripts/verify-npm-public-release.mjs [output] [--contract path] [--expected-release-id id]",
      );
  }
  return options;
}

function positiveInteger(value, fallback) {
  if (value == null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0)
    throw new Error(`Expected a positive integer, received ${JSON.stringify(value)}.`);
  return parsed;
}
function sleep(milliseconds) {
  return new Promise(resolvePromise => setTimeout(resolvePromise, milliseconds));
}
function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
function sha512(bytes) {
  return createHash("sha512").update(bytes).digest("hex");
}
function specifiers(manifest) {
  return Object.keys(manifest.exports ?? { ".": manifest.main }).map(key =>
    key === "." ? manifest.name : `${manifest.name}${key.slice(1)}`,
  );
}
function installedVersion(name, packageDirectories = []) {
  const manifestPath = [rootModules, ...packageDirectories.map(directory => join(directory, "node_modules"))]
    .map(modules => join(modules, name, "package.json"))
    .find(existsSync);
  if (!manifestPath) throw new Error(`Public consumer verification requires ${name}; run npm ci first.`);
  return JSON.parse(readFileSync(manifestPath, "utf8")).version;
}
function anonymousEnvironment(auditRoot) {
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

export function assertExactContract({ contract, manifests, expectedReleaseId }) {
  const release = contract?.current;
  if (!release?.id || !Array.isArray(release.npm) || !release?.template?.commit || !contract?.npmPublicationProvenance)
    throw new Error("The ecosystem release contract is missing its exact public identity.");
  if (expectedReleaseId && expectedReleaseId !== release.id)
    throw new Error(`Expected release ${expectedReleaseId}, found ${release.id} in the ecosystem contract.`);
  const versions = new Map(release.npm.map(entry => [entry.name, entry.version]));
  if (versions.size !== expectedPackages.size || [...expectedPackages.values()].some(name => !versions.has(name)))
    throw new Error("The ecosystem release contract must list exactly the eight public npm packages.");
  if (
    manifests.length !== expectedPackages.size ||
    new Set(manifests.map(entry => entry.directory)).size !== expectedPackages.size
  ) {
    throw new Error("Local public package inventory must contain exactly the eight public packages.");
  }
  for (const { directory, manifest } of manifests) {
    const name = expectedPackages.get(directory);
    if (manifest.name !== name || manifest.private === true)
      throw new Error(`${directory} is not the expected public package ${name}.`);
    if (versions.get(name) !== manifest.version)
      throw new Error(`${name}@${manifest.version} does not match the exact ecosystem release contract.`);
  }
  return release;
}

async function fetchRequired(url, accept = "application/json") {
  const response = await fetch(url, { headers: { accept } });
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}.`);
  return response;
}
async function packageMetadata(manifest, attempts, intervalMs) {
  const coordinate = `${manifest.name}@${manifest.version}`;
  const endpoint = `${registry}/${encodeURIComponent(manifest.name)}/${encodeURIComponent(manifest.version)}`;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(endpoint, { headers: { accept: "application/json" } });
    if (response.ok) {
      const metadata = await response.json();
      if (metadata.name !== manifest.name || metadata.version !== manifest.version)
        throw new Error(`${coordinate} returned mismatched registry metadata.`);
      if (
        metadata.dist?.integrity &&
        metadata.dist?.tarball?.startsWith(`${registry}/`) &&
        metadata.dist?.attestations?.url
      )
        return { coordinate, metadata, attestationUrl: metadata.dist.attestations.url };
      if (attempt === attempts)
        throw new Error(`${coordinate} has incomplete public npm distribution or provenance metadata.`);
    } else if (response.status !== 404 || attempt === attempts)
      throw new Error(`${coordinate} did not become publicly visible after ${attempts} attempts.`);
    console.log(`${coordinate} is not fully visible yet (attempt ${attempt}/${attempts}); waiting ${intervalMs} ms.`);
    await sleep(intervalMs);
  }
  throw new Error(`${coordinate} did not become publicly visible after ${attempts} attempts.`);
}
function assertInside(base, path, description) {
  const fromBase = relative(base, path);
  if (fromBase === "" || fromBase === ".." || fromBase.startsWith(`..${sep}`))
    throw new Error(`${description} escapes its package root.`);
}
function verifyIntegrity(bytes, integrity, coordinate) {
  const match = /^sha512-([A-Za-z0-9+/]+={0,2})$/u.exec(integrity ?? "");
  if (
    !match ||
    Buffer.from(match[1], "base64").length !== 64 ||
    createHash("sha512").update(bytes).digest("base64") !== match[1]
  )
    throw new Error(`${coordinate} tarball does not match valid npm SHA-512 registry integrity.`);
}
async function resolvePeeledReleaseTag(version, repository) {
  const name = `create-vireo@${version}`;
  const ref = await (
    await fetchRequired(`${githubApi}/repos/${repository}/git/ref/tags/${encodeURIComponent(name)}`)
  ).json();
  let object = ref.object;
  for (let depth = 0; depth < 4 && object?.type === "tag"; depth += 1)
    object = (await (await fetchRequired(`${githubApi}/repos/${repository}/git/tags/${object.sha}`)).json()).object;
  if (object?.type !== "commit" || !/^[0-9a-f]{40}$/u.test(object.sha ?? ""))
    throw new Error(`${name} does not peel to a commit.`);
  return { name, ref: ref.ref, object: ref.object?.sha ?? null, commit: object.sha };
}
function inventory(packageDirectory) {
  const files = [];
  const visit = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      assertInside(packageDirectory, path, "Packed package inventory");
      if (entry.isSymbolicLink())
        throw new Error(`Packed package contains a symbolic link: ${relative(packageDirectory, path)}`);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(relative(packageDirectory, path).replaceAll("\\", "/"));
      else throw new Error(`Packed package contains an unsupported entry: ${relative(packageDirectory, path)}`);
    }
  };
  visit(packageDirectory);
  return files.toSorted();
}
function publishedTargets(manifest) {
  const targets = [];
  const visit = value => {
    if (typeof value === "string") targets.push(value);
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") Object.values(value).forEach(visit);
  };
  visit(manifest.exports ?? manifest.main);
  return [...new Set(targets)];
}
function canonicalRepository(value) {
  const raw = typeof value === "string" ? value : value?.url;
  if (typeof raw !== "string") return null;
  return raw.replace(/^git\+/u, "").replace(/\.git$/u, "");
}
function inspectPackedPackage({ tarball, expected, metadata, auditRoot }) {
  const unpackRoot = mkdtempSync(join(auditRoot, "packed-"));
  try {
    const archiveEntries = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
    if (
      archiveEntries.length === 0 ||
      archiveEntries.some(
        entry => !entry.startsWith("package/") || entry.startsWith("/") || entry.split("/").includes(".."),
      )
    ) {
      throw new Error(`${expected.name} packed archive contains an unsafe inventory path.`);
    }
    execFileSync("tar", ["-xzf", tarball, "-C", unpackRoot], { stdio: "pipe" });
    const directory = join(unpackRoot, "package");
    if (!existsSync(directory) || !lstatSync(directory).isDirectory())
      throw new Error(`${expected.name} tarball has no package root.`);
    const manifest = JSON.parse(readFileSync(join(directory, "package.json"), "utf8"));
    if (manifest.name !== expected.name || manifest.version !== expected.version)
      throw new Error(`${expected.name} packed identity does not match the ecosystem contract.`);
    const files = inventory(directory);
    if (!files.includes("package.json") || !files.includes("LICENSE") || manifest.license !== "MIT")
      throw new Error(`${expected.name} packed package must include LICENSE and declare MIT.`);
    const exports = publishedTargets(manifest);
    for (const target of exports) {
      if (!target.startsWith("./"))
        throw new Error(`${expected.name} export target is not package-relative: ${target}`);
      const path = resolve(directory, target);
      assertInside(directory, path, `${expected.name} export`);
      if (!existsSync(path) || !lstatSync(path).isFile())
        throw new Error(`${expected.name} export target is missing: ${target}`);
    }
    const bin = typeof manifest.bin === "string" ? { [expected.name]: manifest.bin } : (manifest.bin ?? {});
    for (const [name, target] of Object.entries(bin)) {
      if (typeof target !== "string" || !target.startsWith("./"))
        throw new Error(`${expected.name} bin ${name} is not package-relative.`);
      const path = resolve(directory, target);
      assertInside(directory, path, `${expected.name} bin`);
      if (!existsSync(path) || !lstatSync(path).isFile()) throw new Error(`${expected.name} bin ${name} is missing.`);
    }
    return {
      repository: canonicalRepository(manifest.repository),
      metadataRepository: canonicalRepository(metadata.repository),
      license: manifest.license,
      licenseFile: "LICENSE",
      packageJson: { name: manifest.name, version: manifest.version, type: manifest.type ?? null },
      inventory: files,
      unpackedBytes: files.reduce((total, path) => total + statSync(join(directory, path)).size, 0),
      inventorySafe: true,
      exports: specifiers(manifest),
      exportTargets: exports,
      exportsSafe: true,
      bin,
      binSafe: true,
    };
  } finally {
    rmSync(unpackRoot, { recursive: true, force: true });
  }
}
function signatureRecord(audit, expected) {
  const verified = audit?.verified?.find(entry => entry?.name === expected.name && entry?.version === expected.version);
  if (!verified || !Array.isArray(verified.attestationBundles) || verified.attestationBundles.length === 0)
    throw new Error(`${expected.name}@${expected.version} was not fully verified by npm audit signatures.`);
  return { registrySignaturesValid: true, verifiedAttestationBundles: verified.attestationBundles.length };
}

export async function verifyNpmPublicRelease({ outputPath, contractPath, expectedReleaseId }) {
  const attempts = positiveInteger(process.env.NPM_PUBLIC_VERIFY_ATTEMPTS, 80);
  const intervalMs = positiveInteger(process.env.NPM_PUBLIC_VERIFY_INTERVAL_MS, 15_000);
  const contract = JSON.parse(readFileSync(contractPath, "utf8"));
  const packages = [...expectedPackages].map(([directory, name]) => ({
    directory,
    path: join(packageRoot, directory),
    name,
    manifest: JSON.parse(readFileSync(join(packageRoot, directory, "package.json"), "utf8")),
  }));
  const release = assertExactContract({ contract, manifests: packages, expectedReleaseId });
  const createVersion = release.npm.find(entry => entry.name === "create-vireo")?.version;
  const releaseTag = await resolvePeeledReleaseTag(
    createVersion,
    contract.npmPublicationProvenance.canonicalRepository,
  );
  const metadata = new Map();
  for (const entry of packages) metadata.set(entry.name, await packageMetadata(entry.manifest, attempts, intervalMs));
  const auditRoot = mkdtempSync(join(tmpdir(), "vireo-public-npm-"));
  const consumerRoot = join(auditRoot, "consumer");
  const consumerModules = join(consumerRoot, "node_modules");
  try {
    mkdirSync(consumerRoot, { recursive: true });
    writeFileSync(join(auditRoot, "anonymous.npmrc"), `registry=${registry}/\nalways-auth=false\n`);
    const directories = packages.map(entry => entry.path),
      external = new Set();
    for (const { manifest } of packages)
      for (const field of ["dependencies", "peerDependencies", "optionalDependencies"])
        for (const name of Object.keys(manifest[field] ?? {}))
          if (!name.startsWith("@vireocodedev/")) external.add(name);
    const rootManifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const consumerManifest = {
      name: "vireo-anonymous-public-consumer",
      private: true,
      type: "module",
      dependencies: {
        ...Object.fromEntries([...external].sort().map(name => [name, installedVersion(name, directories)])),
        ...Object.fromEntries(release.npm.map(entry => [entry.name, entry.version])),
      },
      devDependencies: {
        "@types/react": installedVersion("@types/react", directories),
        "@types/react-dom": installedVersion("@types/react-dom", directories),
        "@types/react-transition-group": installedVersion("@types/react-transition-group", directories),
        typescript: rootManifest.devDependencies.typescript,
        vite: installedVersion("vite", directories),
      },
    };
    writeFileSync(join(consumerRoot, "package.json"), `${JSON.stringify(consumerManifest, null, 2)}\n`);
    const environment = anonymousEnvironment(auditRoot);
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
            { cwd: consumerRoot, env: environment, encoding: "utf8", stdio: ["ignore", "inherit", "pipe"] },
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
          rmSync(consumerModules, { recursive: true, force: true });
          rmSync(join(consumerRoot, "package-lock.json"), { force: true });
          console.log(
            `Anonymous install encountered a registry 404 (attempt ${attempt}/${attempts}); waiting ${intervalMs} ms.`,
          );
        },
      },
    );
    execFileSync("corepack", ["npm", "ls", "--all", "--silent"], {
      cwd: consumerRoot,
      env: environment,
      stdio: "ignore",
    });
    const audit = JSON.parse(
      execFileSync("corepack", ["npm", "audit", "signatures", "--json", "--include-attestations"], {
        cwd: consumerRoot,
        env: environment,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
      }),
    );
    const lockfile = JSON.parse(readFileSync(join(consumerRoot, "package-lock.json"), "utf8"));
    const records = [];
    for (const expected of release.npm) {
      const entry = metadata.get(expected.name),
        bytes = Buffer.from(
          await (await fetchRequired(entry.metadata.dist.tarball, "application/octet-stream")).arrayBuffer(),
        );
      verifyIntegrity(bytes, entry.metadata.dist.integrity, entry.coordinate);
      const tarball = join(
        auditRoot,
        `${expected.name.replace(/^@/u, "").replaceAll("/", "-")}-${expected.version}.tgz`,
      );
      writeFileSync(tarball, bytes);
      const attestation = await (await fetchRequired(entry.attestationUrl)).json();
      const provenance = decodeExactNpmProvenance({
        attestation,
        expected,
        integrity: entry.metadata.dist.integrity,
        releaseTagCommit: releaseTag.commit,
        policy: contract.npmPublicationProvenance,
      });
      const installed = join(consumerModules, ...expected.name.split("/")),
        installedManifest = JSON.parse(readFileSync(join(installed, "package.json"), "utf8")),
        lock = lockfile.packages?.[`node_modules/${expected.name}`];
      if (
        lstatSync(installed).isSymbolicLink() ||
        !realpathSync(installed).startsWith(`${realpathSync(consumerRoot)}/`) ||
        installedManifest.name !== expected.name ||
        installedManifest.version !== expected.version ||
        !lock?.resolved?.startsWith(`${registry}/`) ||
        lock.integrity !== entry.metadata.dist.integrity
      )
        throw new Error(`${entry.coordinate} was not installed exactly from its public npm tarball.`);
      const record = {
        name: expected.name,
        version: expected.version,
        coordinate: entry.coordinate,
        integrity: entry.metadata.dist.integrity,
        tarball: entry.metadata.dist.tarball,
        sha256: sha256(bytes),
        sha512: sha512(bytes),
        attestationUrl: entry.attestationUrl,
        ...inspectPackedPackage({ tarball, expected, metadata: entry.metadata, auditRoot }),
        ...signatureRecord(audit, expected),
        provenance,
        installed: { resolved: lock.resolved, integrity: lock.integrity, exports: specifiers(installedManifest) },
      };
      const problems = validateExactNpmRecord({ record, expected, releaseTagCommit: releaseTag.commit });
      if (problems.length > 0)
        throw new Error(`${entry.coordinate} exact public verification failed:\n- ${problems.join("\n- ")}`);
      records.push(record);
    }
    const nodeSpecifiers = records
        .filter(item => item.name !== "@vireocodedev/ui")
        .flatMap(item => item.installed.exports),
      browserSpecifiers = records
        .filter(item => item.name === "@vireocodedev/ui")
        .flatMap(item => item.installed.exports),
      allSpecifiers = [...nodeSpecifiers, ...browserSpecifiers];
    const runtimeSmoke = `const specifiers = JSON.parse(process.argv[1]); const expectedRoot = process.argv[2]; for (const specifier of specifiers) { const resolved = import.meta.resolve(specifier); if (!resolved.startsWith(expectedRoot)) throw new Error(specifier + " resolved outside npm consumer: " + resolved); await import(specifier); }`;
    execFileSync(
      "node",
      [
        "--input-type=module",
        "--eval",
        runtimeSmoke,
        JSON.stringify(nodeSpecifiers),
        pathToFileURL(`${consumerModules}/`).href,
      ],
      { cwd: consumerRoot, stdio: "inherit" },
    );
    const typecheckEntry = join(consumerRoot, "consumer.ts"),
      typecheckConfig = join(consumerRoot, "tsconfig.json");
    writeFileSync(
      typecheckEntry,
      `${allSpecifiers.map((item, index) => `import type * as Package${index} from ${JSON.stringify(item)};`).join("\n")}\n`,
    );
    writeFileSync(
      typecheckConfig,
      `${JSON.stringify({ compilerOptions: { jsx: "react-jsx", lib: ["ES2022", "DOM", "DOM.Iterable"], module: "ESNext", moduleResolution: "Bundler", noEmit: true, skipLibCheck: false, strict: true, target: "ES2022" }, files: [typecheckEntry] }, null, 2)}\n`,
    );
    execFileSync(
      "node",
      [resolvePackageBin(join(consumerModules, "typescript"), ["tsc", "tsc6"]), "--project", typecheckConfig],
      { cwd: consumerRoot, stdio: "inherit" },
    );
    const browserEntry = join(consumerRoot, "browser-entry.mjs"),
      viteConfig = join(consumerRoot, "vite.config.mjs");
    writeFileSync(browserEntry, `${browserSpecifiers.map(item => `import ${JSON.stringify(item)};`).join("\n")}\n`);
    writeFileSync(
      viteConfig,
      `export default { logLevel: "silent", build: { lib: { entry: ${JSON.stringify(browserEntry)}, formats: ["es"], fileName: "browser-smoke" }, rollupOptions: { external: id => !id.startsWith("@vireocodedev/") && !id.startsWith(".") && !id.startsWith("/") } } };\n`,
    );
    execFileSync("node", [join(consumerModules, "vite/bin/vite.js"), "build", "--config", viteConfig], {
      cwd: consumerRoot,
      stdio: "inherit",
    });
    const evidence = {
      schemaVersion: 2,
      verifiedAt: new Date().toISOString(),
      repository: "https://github.com/vireocodedev/vireo",
      release: {
        id: release.id,
        contract: relative(root, contractPath).replaceAll("\\", "/"),
        template: release.template,
      },
      releaseTag,
      registry,
      anonymousInstall: true,
      strictPeerDependencies: true,
      skipLibCheck: false,
      runtimeEntryPoints: nodeSpecifiers.length,
      browserEntryPoints: browserSpecifiers.length,
      packages: records,
      registryPackages: records.map(({ name, version, integrity, tarball, attestationUrl }) => ({
        name,
        version,
        integrity,
        tarball,
        attestation: attestationUrl,
      })),
      resolvedPackages: records.map(({ name, version, installed }) => ({ name, version, ...installed })),
      signatureAudit: { verifiedPackages: records.length, exactPackageSignatures: true },
    };
    writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(
      `Verified ${records.length} exact public packages and ${allSpecifiers.length} entry points from an anonymous cold npm install.`,
    );
    console.log(`Evidence: ${outputPath}`);
    return evidence;
  } finally {
    rmSync(auditRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const options = parseCommandLine();
  await verifyNpmPublicRelease({
    outputPath: resolve(root, options.output),
    contractPath: resolve(root, options.contract),
    expectedReleaseId: options.expectedReleaseId,
  });
}
