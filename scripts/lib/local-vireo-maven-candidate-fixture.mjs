import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRepositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function aggregate(primary, cleanupFailures, message) {
  const errors = [...(primary ? [primary] : []), ...cleanupFailures];
  if (errors.length === 0) return undefined;
  if (errors.length === 1) return errors[0];
  return new AggregateError(errors, message);
}

async function settleCleanup(actions) {
  const settled = await Promise.allSettled(actions.map(async action => action()));
  return settled.filter(result => result.status === "rejected").map(result => result.reason);
}

/** Reads the single exact JVM release version accepted by this fixture. */
export function readJvmCandidateVersion(gradleProperties) {
  if (typeof gradleProperties !== "string") throw new Error("jvm/gradle.properties must be text.");
  const versions = gradleProperties
    .split(/\r?\n/u)
    .map(line => /^version=([^\s#]+)$/u.exec(line)?.[1])
    .filter(Boolean);
  if (versions.length !== 1) throw new Error("jvm/gradle.properties must declare exactly one exact version= value.");
  return versions[0];
}

export function assertJvmCandidateVersion({ gradleProperties, expectedVersion }) {
  if (typeof expectedVersion !== "string" || !expectedVersion)
    throw new Error("A local JVM candidate fixture requires an exact expected target version.");
  const actualVersion = readJvmCandidateVersion(gradleProperties);
  if (actualVersion !== expectedVersion)
    throw new Error(`JVM candidate version ${actualVersion} does not match fixture target ${expectedVersion}.`);
  return actualVersion;
}

export function groovySingleQuotedLiteral(value) {
  if (typeof value !== "string") throw new Error("A Groovy literal value must be text.");
  return "'" + value.replaceAll("\\", "\\\\").replaceAll("'", "\\'") + "'";
}

export function mavenCandidateInitScript(repository) {
  const repositoryUri = pathToFileURL(resolve(repository)).href;
  return `allprojects {
  repositories {
    exclusiveContent {
      forRepository {
        maven {
          url = uri(${groovySingleQuotedLiteral(repositoryUri)})
        }
      }
      filter {
        includeGroup("com.vireocode")
      }
    }
    mavenCentral()
  }
}
`;
}

export function mavenCandidatePublicationCommand({ repositoryRoot, repository }) {
  const jvmDirectory = join(repositoryRoot, "jvm");
  return {
    command: join(jvmDirectory, "gradlew"),
    args: [
      "-p",
      jvmDirectory,
      `-PvireoTestRepository=${repository}`,
      "publishMavenPublicationToVerificationRepository",
      "--no-daemon",
      "--no-build-cache",
      "--no-configuration-cache",
      "--console=plain",
    ],
  };
}

export function mavenCandidateAuditCommand({ repositoryRoot, repository, version }) {
  return {
    command: join(repositoryRoot, "jvm", "scripts", "audit-publication-artifacts.sh"),
    args: [repository, version, "verification"],
  };
}

export function mavenCandidateConsumerCommand({ initScript }) {
  return {
    command: "./gradlew",
    args: [
      "test",
      "--tests",
      "*PurchaseOrderApiIntegrationTest",
      "--init-script",
      initScript,
      "--refresh-dependencies",
      "--no-daemon",
      "--no-build-cache",
      "--no-configuration-cache",
      "--console=plain",
    ],
  };
}

/** Runs publication, auditing, and consumption while always attempting cleanup. */
export async function runMavenCandidateLifecycle({ publish, audit, callback, cleanup }) {
  let result;
  let primary;
  try {
    await publish();
    await audit();
    result = await callback();
  } catch (error) {
    primary = error;
  }
  const cleanupFailures = await settleCleanup([cleanup]);
  const failure = aggregate(
    primary,
    cleanupFailures,
    "JVM candidate fixture failed and its temporary repository could not be removed.",
  );
  if (failure) throw failure;
  return result;
}

export function removeMavenCandidateRoot(candidateRoot, remove = rm) {
  return remove(candidateRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}

/**
 * Publishes every current JVM module to an ephemeral Maven-layout repository
 * beside the generated fixture, audits it, and supplies a generated Gradle
 * init script that routes only com.vireocode through that repository.
 */
export async function withLocalVireoMavenCandidates(
  projectDirectory,
  action,
  { repositoryRoot = defaultRepositoryRoot, expectedVersion } = {},
) {
  if (typeof action !== "function") throw new Error("A local JVM candidate fixture requires a callback.");
  const root = resolve(repositoryRoot);
  const gradleProperties = await readFile(join(root, "jvm", "gradle.properties"), "utf8");
  const version = assertJvmCandidateVersion({ gradleProperties, expectedVersion });
  const candidateRoot = await mkdtemp(join(dirname(resolve(projectDirectory)), "vireo-maven-candidates-"));
  const repository = join(candidateRoot, "repository");
  const initScript = join(candidateRoot, "vireo-candidates.init.gradle");

  return runMavenCandidateLifecycle({
    publish: async () => {
      await mkdir(repository, { recursive: true });
      await writeFile(initScript, mavenCandidateInitScript(repository));
      const publication = mavenCandidatePublicationCommand({ repositoryRoot: root, repository });
      execFileSync(publication.command, publication.args, { cwd: root, stdio: "inherit" });
    },
    audit: async () => {
      const audit = mavenCandidateAuditCommand({ repositoryRoot: root, repository, version });
      execFileSync(audit.command, audit.args, { cwd: root, stdio: "inherit" });
    },
    callback: () => action({ repository, initScript, version }),
    cleanup: () => removeMavenCandidateRoot(candidateRoot),
  });
}
