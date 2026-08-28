import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { format, resolveConfig } from "prettier";

export async function synchronizeDocumentationRelease(repositoryRoot) {
  const policyPath = join(repositoryRoot, "contracts", "documentation-release-policy.json");
  const policy = JSON.parse(readFileSync(policyPath, "utf8"));
  const current = policy.releases?.find(release => release.id === policy.currentRelease);
  if (!current) {
    throw new Error(`Current documentation release ${policy.currentRelease} is not declared`);
  }

  const packageVersions = new Map(
    readdirSync(join(repositoryRoot, "packages"), { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => join(repositoryRoot, "packages", entry.name, "package.json"))
      .filter(existsSync)
      .map(manifestPath => {
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
        return [manifest.name, manifest.version];
      }),
  );

  for (const entry of current.npm ?? []) {
    const version = packageVersions.get(entry.package);
    if (!version) {
      throw new Error(`Documentation release package ${entry.package} has no public workspace manifest`);
    }
    entry.version = version;
  }

  const prettierOptions = (await resolveConfig(policyPath)) ?? {};
  writeFileSync(
    policyPath,
    await format(JSON.stringify(policy), {
      ...prettierOptions,
      filepath: policyPath,
    }),
  );
}
