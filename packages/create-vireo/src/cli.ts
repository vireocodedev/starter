import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { createVireo, type VireoDatabase, type VireoProfile } from "./index.js";

type Arguments = {
  directory?: string;
  profile?: VireoProfile;
  name?: string;
  displayName?: string;
  ownerName?: string;
  repositoryUrl?: string;
  supportUrl?: string;
  securityContact?: string;
  javaPackage?: string;
  database?: VireoDatabase;
  git?: boolean;
  yes: boolean;
  dryRun: boolean;
  json: boolean;
};

const HELP = `Create a Vireo application.

Usage:
  npm create vireo@latest [directory] [options]

Options:
  --name <kebab-name>          Project name (defaults to directory name)
  --display-name <name>        Display name (defaults to a title from --name)
  --owner-name <name>          Application owner (stored for release validation)
  --repository-url <https-url> Application repository URL (stored for release validation)
  --support-url <url>          Application support URL or mailto route
  --security-contact <url>     Private security URL or mailto route
  --profile <profile>          full-stack (default) or frontend
  --java-package <package>     Java base package (full-stack only)
  --database <postgresql|h2>   Development database (full-stack only)
  --package-manager <npm>      Canonical package manager (default: npm)
  --git / --no-git             Initialize Git (default: yes)
  -y, --yes                    Accept all defaults; requires directory
  --dry-run                    Validate and print the plan without writing
  --json                       Print the result as JSON
  -h, --help                   Show this help
`;

function valueAt(values: string[], index: number, flag: string) {
  const value = values[index + 1];
  if (!value || value.startsWith("-")) throw new Error(`${flag} requires a value.`);
  return value;
}

function parse(values: string[]): Arguments {
  const parsed: Arguments = { yes: false, dryRun: false, json: false };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === "-h" || value === "--help") {
      console.log(HELP);
      process.exit(0);
    } else if (value === "-y" || value === "--yes") parsed.yes = true;
    else if (value === "--dry-run") parsed.dryRun = true;
    else if (value === "--json") parsed.json = true;
    else if (value === "--git") parsed.git = true;
    else if (value === "--no-git") parsed.git = false;
    else if (value === "--name") parsed.name = valueAt(values, index++, value);
    else if (value === "--display-name") parsed.displayName = valueAt(values, index++, value);
    else if (value === "--owner-name") parsed.ownerName = valueAt(values, index++, value);
    else if (value === "--repository-url") parsed.repositoryUrl = valueAt(values, index++, value);
    else if (value === "--support-url") parsed.supportUrl = valueAt(values, index++, value);
    else if (value === "--security-contact") parsed.securityContact = valueAt(values, index++, value);
    else if (value === "--profile") {
      const profile = valueAt(values, index++, value);
      if (profile !== "full-stack" && profile !== "frontend")
        throw new Error("--profile must be `full-stack` or `frontend`.");
      parsed.profile = profile;
    } else if (value === "--java-package") parsed.javaPackage = valueAt(values, index++, value);
    else if (value === "--database") {
      const database = valueAt(values, index++, value);
      if (database !== "postgresql" && database !== "h2") throw new Error("--database must be `postgresql` or `h2`.");
      parsed.database = database;
    } else if (value === "--package-manager") {
      if (valueAt(values, index++, value) !== "npm") throw new Error("Phase 2 supports only npm.");
    } else if (value.startsWith("-")) throw new Error(`Unknown option: ${value}`);
    else if (parsed.directory) throw new Error(`Unexpected argument: ${value}`);
    else parsed.directory = value;
  }
  return parsed;
}

function defaultJavaPackage(name: string) {
  return `com.example.${name.replaceAll("-", "")}`;
}

async function promptForMissing(args: Arguments) {
  if (args.yes) {
    if (!args.directory) throw new Error("A target directory is required with --yes.");
    return args;
  }
  if (!stdin.isTTY || !stdout.isTTY) throw new Error("Interactive input is unavailable. Pass a directory and --yes.");
  const prompt = createInterface({ input: stdin, output: stdout });
  try {
    args.directory ||= (await prompt.question("Project directory (my-vireo-app): ")).trim() || "my-vireo-app";
    const directoryName = args.directory.split(/[\\/]/u).slice(-1)[0];
    args.name ||= (await prompt.question(`Project name (${directoryName}): `)).trim() || directoryName;
    const profile =
      args.profile ??
      (((await prompt.question("Profile (full-stack/frontend) [full-stack]: ")).trim() ||
        "full-stack") as VireoProfile);
    if (profile !== "full-stack" && profile !== "frontend")
      throw new Error("Profile must be `full-stack` or `frontend`.");
    args.profile = profile;
    if (profile === "full-stack") {
      args.javaPackage ||=
        (await prompt.question(`Java package (${defaultJavaPackage(args.name!)}): `)).trim() ||
        defaultJavaPackage(args.name!);
      const database = (await prompt.question("Database (postgresql/h2) [postgresql]: ")).trim() || "postgresql";
      if (database !== "postgresql" && database !== "h2") throw new Error("Database must be `postgresql` or `h2`.");
      args.database = database;
    }
    if (args.git === undefined)
      args.git = !/^n(?:o)?$/iu.test((await prompt.question("Initialize Git? [Y/n]: ")).trim());
    return args;
  } finally {
    prompt.close();
  }
}

async function main() {
  const args = await promptForMissing(parse(process.argv.slice(2)));
  const result = await createVireo({
    directory: args.directory!,
    profile: args.profile,
    projectName: args.name,
    displayName: args.displayName,
    ownerName: args.ownerName,
    repositoryUrl: args.repositoryUrl,
    supportUrl: args.supportUrl,
    securityContact: args.securityContact,
    javaPackage: args.javaPackage,
    database: args.database,
    packageManager: "npm",
    git: args.git,
    dryRun: args.dryRun,
  });
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else if (result.dryRun)
    console.log(
      `Dry run valid: ${result.projectName} · ${result.profile}${result.profile === "full-stack" ? ` · ${result.javaPackage} · ${result.database}` : ""}`,
    );
  else {
    console.log(
      `Created ${result.projectName} (${result.profile}) from Vireo Template ${result.templateCommit.slice(0, 12)}.`,
    );
    console.log(
      `\n  cd ${args.directory}\n  corepack npm run setup\n  corepack npm run doctor\n  corepack npm run dev\n`,
    );
  }
}

main().catch(error => {
  console.error(`create-vireo: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
