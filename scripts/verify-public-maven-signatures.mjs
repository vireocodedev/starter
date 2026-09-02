import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { validatePublicMavenRecord } from "./lib/anonymous-public-maven-evidence.mjs";
import { verifyCanonicalMitLicense } from "./lib/mit-license-evidence.mjs";

const args = process.argv.slice(2);
const [version, output] = args;
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const policyPath = option(
  "--policy",
  join(import.meta.dirname, "..", "contracts", "public-release-attestation-policy.json"),
);
const contractPath = option(
  "--contract",
  join(import.meta.dirname, "..", "contracts", "ecosystem-release-contract.json"),
);
const policy = JSON.parse(readFileSync(policyPath, "utf8"));
const contract = JSON.parse(readFileSync(contractPath, "utf8"));
const fingerprint = "C8C362C561046CD11C0F0DE01174796DD298F009";
const maven = policy.maven;
if (!maven?.group || !Array.isArray(maven.modules))
  throw new Error("Maven attestation policy has no artifact contract.");
if (!contract.current?.maven?.version || version !== contract.current.maven.version)
  throw new Error("Requested Maven version does not match the ecosystem contract.");
if (
  contract.current.maven.group !== maven.group ||
  JSON.stringify(contract.current.maven.modules) !== JSON.stringify(maven.modules.map(module => module.name))
)
  throw new Error("Maven policy and ecosystem contract coordinates diverge.");
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(version ?? "")) throw new Error("Expected exact Maven version.");
const root = mkdtempSync(join(tmpdir(), "vireo-public-signatures-"));
try {
  execFileSync(
    "gpg",
    ["--homedir", root, "--import", join(import.meta.dirname, "..", "contracts", "vireo-release-signing-key.asc")],
    { stdio: "ignore" },
  );
  const listed = execFileSync("gpg", ["--homedir", root, "--with-colons", "--fingerprint", fingerprint], {
    encoding: "utf8",
  });
  if (!listed.includes(`fpr:::::::::${fingerprint}:`))
    throw new Error("Checked-in Vireo public key does not match the pinned signer fingerprint.");
  const verified = [];
  for (const module of maven.modules)
    for (const artifactSpec of module.artifacts ?? []) {
      const classifier = artifactSpec.classifier ?? "";
      const extension = artifactSpec.extension;
      const subject = `${module.name}-${version}${classifier}.${extension}`;
      const url = `${maven.registry.replace(/\/$/u, "")}/${maven.group.replaceAll(".", "/")}/${module.name}/${version}/${subject}`;
      const artifact = join(root, subject);
      const signature = `${artifact}.asc`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Missing public Maven subject ${subject}.`);
      writeFileSync(artifact, Buffer.from(await response.arrayBuffer()));
      const checksum = await fetch(`${url}.sha256`);
      if (!checksum.ok) throw new Error(`Missing checksum ${subject}.sha256.`);
      const expected = (await checksum.text()).trim().split(/\s+/u)[0];
      if (createHash("sha256").update(readFileSync(artifact)).digest("hex") !== expected)
        throw new Error(`Checksum mismatch for ${subject}.`);
      const asc = await fetch(`${url}.asc`);
      if (!asc.ok) throw new Error(`Missing detached signature ${subject}.asc.`);
      writeFileSync(signature, Buffer.from(await asc.arrayBuffer()));
      execFileSync("gpg", ["--homedir", root, "--batch", "--verify", signature, artifact], { stdio: "ignore" });
      const record = {
        module: module.name,
        version,
        group: maven.group,
        subject,
        classifier,
        extension,
        sha256: expected,
        checksumVerified: true,
        signatureVerified: true,
        pomMitLicense: true,
        licenseContentVerified: null,
        licenseSha256: null,
      };
      if (extension === "pom") {
        const pom = readFileSync(artifact, "utf8");
        const tag = name => new RegExp(`<${name}>\\s*([^<]+?)\\s*<\\/${name}>`, "u").exec(pom)?.[1]?.trim();
        record.pomCoordinateVerified =
          tag("groupId") === maven.group && tag("artifactId") === module.name && tag("version") === version;
        record.pomMitLicense = tag("name") === "MIT License" && /<url>\s*https?:\/\/[^<]*mit[^<]*<\/url>/iu.test(pom);
      }
      if (extension === "jar") {
        const listing = execFileSync("jar", ["tf", artifact], { encoding: "utf8" });
        if (!listing.split(/\r?\n/u).includes("META-INF/LICENSE"))
          throw new Error(`${subject} JAR does not contain META-INF/LICENSE.`);
        Object.assign(
          record,
          verifyCanonicalMitLicense(
            execFileSync("unzip", ["-p", artifact, "META-INF/LICENSE"]),
            `${subject} META-INF/LICENSE`,
          ),
        );
      }
      const problems = validatePublicMavenRecord({ record, group: maven.group, version });
      if (problems.length > 0) throw new Error(`${subject}: ${problems.join(", ")}`);
      verified.push(record);
    }
  if (verified.length !== maven.expectedSubjectCount)
    throw new Error(`Expected ${maven.expectedSubjectCount} Maven subjects, verified ${verified.length}.`);
  writeFileSync(
    output,
    `${JSON.stringify({ version, fingerprint, policy: policyPath, contract: contractPath, verified }, null, 2)}\n`,
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}
