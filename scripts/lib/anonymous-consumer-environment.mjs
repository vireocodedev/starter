import { existsSync, lstatSync, mkdirSync, realpathSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const credentialKey = /(?:^|_)(?:auth|token|password|secret|credential|apikey|api_key)(?:_|$)/iu;

export function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function publicReleaseIdentity(contract) {
  const current = contract?.current;
  if (!current || typeof current.id !== "string" || !Array.isArray(current.npm) || !current.maven) {
    throw new Error("Ecosystem contract must declare a current public release identity.");
  }
  const createVireo = current.npm.find(entry => entry.name === "create-vireo");
  if (!createVireo || !isExactVersion(createVireo.version)) {
    throw new Error("Ecosystem contract must declare an exact public create-vireo version.");
  }
  if (!isExactVersion(current.maven.version)) throw new Error("Ecosystem contract must declare an exact public Maven version.");
  if (current.id !== `npm-${createVireo.version}_jvm-${current.maven.version}`)
    throw new Error("Ecosystem contract release id must exactly match the public npm and Maven coordinates.");
  if (!isExactVersion(current.template?.version) || current.template.version !== createVireo.version) {
    throw new Error("Ecosystem contract Template version must match the public create-vireo version.");
  }
  if (!/^[0-9a-f]{40}$/u.test(current.template?.commit ?? "") || current.template.tag !== `starter-template@${current.template.version}`) {
    throw new Error("Ecosystem contract Template commit/tag is not immutable and coherent.");
  }
  for (const entry of current.npm) {
    if (typeof entry?.name !== "string" || !isExactVersion(entry.version)) {
      throw new Error("Ecosystem contract contains an invalid public npm coordinate.");
    }
  }
  return {
    id: current.id,
    createVireoVersion: createVireo.version,
    npm: current.npm.map(({ name, version }) => ({ name, version })),
    maven: { group: current.maven.group, version: current.maven.version, modules: [...current.maven.modules] },
    template: { version: current.template?.version, commit: current.template?.commit, tag: current.template?.tag },
  };
}

function isExactVersion(value) {
  return typeof value === "string" && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(value);
}

export function anonymousEnvironment({ root, environment = process.env, registry, playwrightBrowsersPath }) {
  const pathEntries = String(environment.PATH ?? "")
    .split(":")
    .filter(entry => entry && !/(?:node_modules\/\.bin|vireocode|starter)/iu.test(entry));
  if (pathEntries.length === 0) throw new Error("Anonymous consumer environment requires a controlled executable PATH.");
  const home = join(root, "home");
  const npmUserConfig = join(root, "npmrc");
  const npmCache = join(root, "npm-cache");
  const gradleUserHome = join(root, "gradle-user-home");
  const mavenRepository = join(root, "maven-repository");
  const corepackHome = join(root, "corepack");
  const dockerConfig = join(root, "docker-config");
  const playwrightBrowsers = playwrightBrowsersPath ?? join(root, "vireo-anonymous-playwright");
  if (!/^(?:\/|[A-Za-z]:[\\/])/u.test(playwrightBrowsers) || !/vireo-anonymous-playwright/u.test(playwrightBrowsers)) {
    throw new Error("Anonymous consumer Playwright browser cache must be an explicit dedicated absolute path.");
  }
  for (const directory of [home, npmCache, gradleUserHome, mavenRepository, corepackHome, dockerConfig, playwrightBrowsers])
    mkdirSync(directory, { recursive: true });
  mkdirSync(gradleUserHome, { recursive: true });
  writeFileSync(npmUserConfig, `registry=${registry}\nalways-auth=false\n`);
  return {
    PATH: pathEntries.join(":"),
    CI: "true",
    HOME: home,
    XDG_CONFIG_HOME: join(root, "xdg-config"),
    XDG_CACHE_HOME: join(root, "xdg-cache"),
    XDG_DATA_HOME: join(root, "xdg-data"),
    COREPACK_HOME: corepackHome,
    npm_config_cache: npmCache,
    npm_config_prefix: join(root, "npm-prefix"),
    npm_config_registry: registry,
    npm_config_userconfig: npmUserConfig,
    GRADLE_USER_HOME: gradleUserHome,
    MAVEN_OPTS: `-Dmaven.repo.local=${mavenRepository}`,
    DOCKER_CONFIG: dockerConfig,
    PLAYWRIGHT_BROWSERS_PATH: playwrightBrowsers,
  };
}

export function assertAnonymousInstallation({ consumerRoot, packageNames, registry }) {
  const resolvedRoot = realpathSync(consumerRoot);
  const lock = readJson(join(consumerRoot, "package-lock.json"));
  for (const name of packageNames) {
    const installed = join(consumerRoot, "node_modules", ...name.split("/"));
    if (!existsSync(installed) || lstatSync(installed).isSymbolicLink()) {
      throw new Error(`${name} must be a downloaded, non-linked package.`);
    }
    if (!realpathSync(installed).startsWith(`${resolvedRoot}/`)) {
      throw new Error(`${name} resolved outside the isolated consumer.`);
    }
    const lockEntry = lock.packages?.[`node_modules/${name}`];
    if (!lockEntry?.resolved?.startsWith(`${registry}/`) || !lockEntry.integrity) {
      throw new Error(`${name} is not locked to the public npm registry.`);
    }
  }
}

export function assertAnonymousVireoLock({ consumerRoot, release, registry }) {
  const lock = readJson(join(consumerRoot, "package-lock.json"));
  const expectedVersions = new Map(release.npm.map(entry => [entry.name, entry.version]));
  const entries = Object.entries(lock.packages ?? {}).filter(([path]) => path.startsWith("node_modules/@vireocodedev/"));
  if (entries.length === 0) throw new Error("Anonymous consumer lockfile contains no Vireo public packages.");
  for (const [path, entry] of entries) {
    const name = path.slice("node_modules/".length);
    if (!expectedVersions.has(name) || entry.version !== expectedVersions.get(name)) {
      throw new Error(`${name} does not match an exact current public Vireo coordinate.`);
    }
    if (!entry.resolved?.startsWith(`${registry}/`) || !entry.integrity) {
      throw new Error(`${name} was not resolved from the public npm registry.`);
    }
  }
}

export function assertExactPublicNpmConsumer({ consumerRoot, release, registry }) {
  assertAnonymousInstallation({ consumerRoot, packageNames: release.npm.map(entry => entry.name), registry });
  const lock = readJson(join(consumerRoot, "package-lock.json"));
  for (const { name, version } of release.npm) {
    const entry = lock.packages?.[`node_modules/${name}`];
    if (entry?.version !== version) throw new Error(`${name} must resolve exactly to ${version}.`);
  }
}

export function assertNoMavenLocal(command, environment) {
  const rendered = [command.executable, ...(command.arguments ?? [])].join(" ");
  if (/mavenLocal|\.m2\/repository|useLocalStarter=true/iu.test(rendered)) {
    throw new Error("Anonymous consumer commands may not use Maven Local or local Vireo candidates.");
  }
  if (!environment.HOME || !environment.XDG_CONFIG_HOME || !environment.COREPACK_HOME || !environment.DOCKER_CONFIG) {
    throw new Error("Anonymous consumer environment is incomplete.");
  }
  if (environment.GRADLE_USER_HOME?.includes(".gradle") || environment.MAVEN_OPTS?.includes(".m2/repository")) {
    throw new Error("Anonymous consumer environment may not inherit Gradle or Maven Local homes.");
  }
}

export function relativeEvidencePath(root, path) {
  const result = relative(resolve(root), resolve(path));
  if (!result || result.startsWith("..") || result.includes("..")) throw new Error("Evidence path escapes its isolated root.");
  return result;
}
