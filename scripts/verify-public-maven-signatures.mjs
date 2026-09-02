import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [version, output] = process.argv.slice(2);
const fingerprint = "C8C362C561046CD11C0F0DE01174796DD298F009";
const modules = ["vireo-bom", "vireo-core", "vireo-auth", "vireo-query", "vireo-offline", "vireo-history"];
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u.test(version ?? "")) throw new Error("Expected exact Maven version.");
const root = mkdtempSync(join(tmpdir(), "vireo-public-signatures-"));
try {
  execFileSync("gpg", ["--homedir", root, "--keyserver", "hkps://keyserver.ubuntu.com", "--recv-keys", fingerprint], { stdio: "ignore" });
  const listed = execFileSync("gpg", ["--homedir", root, "--with-colons", "--fingerprint", fingerprint], { encoding: "utf8" });
  if (!listed.includes(`fpr:::::::::${fingerprint}:`)) throw new Error("Public keyserver returned an unexpected Vireo signer.");
  const verified = [];
  for (const module of modules) for (const suffix of module === "vireo-bom" ? [".pom"] : [".pom", ".jar", "-sources.jar", "-javadoc.jar", ".module"]) {
    const subject = `${module}-${version}${suffix}`;
    const url = `https://repo.maven.apache.org/maven2/com/vireocode/${module}/${version}/${subject}`;
    const artifact = join(root, subject);
    const signature = `${artifact}.asc`;
    const response = await fetch(url); if (!response.ok) throw new Error(`Missing public Maven subject ${subject}.`);
    writeFileSync(artifact, Buffer.from(await response.arrayBuffer()));
    const asc = await fetch(`${url}.asc`); if (!asc.ok) throw new Error(`Missing detached signature ${subject}.asc.`);
    writeFileSync(signature, Buffer.from(await asc.arrayBuffer()));
    execFileSync("gpg", ["--homedir", root, "--batch", "--verify", signature, artifact], { stdio: "ignore" });
    verified.push(subject);
  }
  writeFileSync(output, `${JSON.stringify({ version, fingerprint, keyserver: "hkps://keyserver.ubuntu.com", verified }, null, 2)}\n`);
} finally { rmSync(root, { recursive: true, force: true }); }
