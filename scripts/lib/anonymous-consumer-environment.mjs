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

export function anonymousEnvironment({ root, environment = process.env, registry }) {
  const safe = Object.fromEntries(Object.entries(environment).filter(([key]) => !credentialKey.test(key)));
  const npmUserConfig = join(root, "npmrc");
  const npmCache = join(root, "npm-cache");
  const gradleUserHome = join(root, "gradle-user-home");
  mkdirSync(npmCache, { recursive: true });
  mkdirSync(gradleUserHome, { recursive: true });
  writeFileSync(npmUserConfig, `registry=${registry}\nalways-auth=false\n`);
  return {
    ...safe,
    CI: "true",
    npm_config_cache: npmCache,
    npm_config_registry: registry,
    npm_config_userconfig: npmUserConfig,
    GRADLE_USER_HOME: gradleUserHome,
    MAVEN_OPTS: "-Dmaven.repo.local=.anonymous-maven-repository",
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

export function assertNoMavenLocal(command, environment) {
  const rendered = [command.executable, ...(command.arguments ?? [])].join(" ");
  if (/mavenLocal|\.m2\/repository|useLocalStarter=true/iu.test(rendered)) {
    throw new Error("Anonymous consumer commands may not use Maven Local or local Vireo candidates.");
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
