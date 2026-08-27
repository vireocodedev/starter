import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { createVireo, type VireoDatabase } from "./index.js";

type Arguments = {
  directory?: string;
  name?: string;
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
  --java-package <package>     Java base package
  --database <postgresql|h2>   Development database (default: postgresql)
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
    else if (value === "--java-package") parsed.javaPackage = valueAt(values, index++, value);
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
    args.javaPackage ||=
      (await prompt.question(`Java package (${defaultJavaPackage(args.name!)}): `)).trim() ||
      defaultJavaPackage(args.name!);
    const database = (await prompt.question("Database (postgresql/h2) [postgresql]: ")).trim() || "postgresql";
    if (database !== "postgresql" && database !== "h2") throw new Error("Database must be `postgresql` or `h2`.");
    args.database = database;
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
    projectName: args.name,
    javaPackage: args.javaPackage,
    database: args.database,
    packageManager: "npm",
    git: args.git,
    dryRun: args.dryRun,
  });
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else if (result.dryRun)
    console.log(`Dry run valid: ${result.projectName} · ${result.javaPackage} · ${result.database}`);
  else {
    console.log(`Created ${result.projectName} from Vireo Template ${result.templateCommit.slice(0, 12)}.`);
    console.log(
      `\n  cd ${args.directory}\n  corepack npm run setup\n  corepack npm run doctor\n  corepack npm run dev\n`,
    );
  }
}

main().catch(error => {
  console.error(`create-vireo: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
