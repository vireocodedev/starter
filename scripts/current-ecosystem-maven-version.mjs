import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contract = JSON.parse(readFileSync(join(repositoryRoot, "contracts", "ecosystem-release-contract.json"), "utf8"));
const expectedModules = ["vireo-auth", "vireo-bom", "vireo-core", "vireo-history", "vireo-offline", "vireo-query"];
const maven = contract.current?.maven;

if (
  maven?.group !== "com.vireocode" ||
  !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/u.test(maven.version ?? "") ||
  JSON.stringify([...(maven.modules ?? [])].sort()) !== JSON.stringify(expectedModules)
) {
  throw new Error("Ecosystem contract must declare the exact public Vireo Maven group, version, and six modules.");
}

process.stdout.write(`${maven.version}\n`);
