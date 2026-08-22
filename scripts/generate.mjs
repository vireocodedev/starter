#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createGenerationPlan, validateTemplateDefinition, writeGenerationPlan } from "./generator/template-engine.mjs";
import { listRegisteredTemplates, loadRegisteredTemplate } from "./generator/template-registry.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function printGeneralHelp() {
  console.log(`Usage:
  npm run generate -- react-component <name> --owner <owner> --category <category> [--set key=value] [--dry-run]
  npm run generate -- <template-id> <primary-input> --output <directory> [--set key=value] [--dry-run]
  npm run generate -- --list

Examples:
  npm run generate -- react-component Badge --owner core --category data-display
  npm run generate -- react-component TableHeader --owner capabilities/table --category data-display
  npm run generate -- react-component MobileToolbar --owner capabilities/table/management-table --category controls
  npm run generate -- react-component Toaster --owner integrations/sonner --category feedback
  npm run generate -- react-component Badge --owner core --category data-display --dry-run`);
}

function parseArguments(args) {
  const result = { dryRun: false, list: false, help: false, values: {} };
  const positionals = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--dry-run") {
      result.dryRun = true;
    } else if (argument === "--list") {
      result.list = true;
    } else if (argument === "--help" || argument === "-h") {
      result.help = true;
    } else if (argument === "--output") {
      result.output = args[++index];
      if (result.output === undefined) throw new Error("--output requires a value.");
    } else if (argument.startsWith("--output=")) {
      result.output = argument.slice("--output=".length);
    } else if (argument === "--owner") {
      const owner = args[++index];
      if (owner === undefined) throw new Error("--owner requires a value.");
      addNamedValue(result.values, "owner", owner);
    } else if (argument.startsWith("--owner=")) {
      addNamedValue(result.values, "owner", argument.slice("--owner=".length));
    } else if (argument === "--category") {
      const category = args[++index];
      if (category === undefined) throw new Error("--category requires a value.");
      addNamedValue(result.values, "category", category);
    } else if (argument.startsWith("--category=")) {
      addNamedValue(result.values, "category", argument.slice("--category=".length));
    } else if (argument === "--set") {
      const assignment = args[++index];
      if (assignment === undefined) throw new Error("--set requires key=value.");
      addAssignment(result.values, assignment);
    } else if (argument.startsWith("--set=")) {
      addAssignment(result.values, argument.slice("--set=".length));
    } else if (argument.startsWith("-")) {
      throw new Error(`Unknown option "${argument}".`);
    } else {
      positionals.push(argument);
    }
  }

  [result.templateId, result.primaryValue] = positionals;
  if (positionals.length > 2) {
    throw new Error(`Unexpected positional arguments: ${positionals.slice(2).join(", ")}.`);
  }

  return result;
}

function addNamedValue(values, key, value) {
  if (key in values) throw new Error(`Input "${key}" was provided more than once.`);
  values[key] = value;
}

function addAssignment(values, assignment) {
  const separatorIndex = assignment.indexOf("=");
  if (separatorIndex <= 0) throw new Error(`Invalid --set value "${assignment}"; expected key=value.`);

  const key = assignment.slice(0, separatorIndex);
  const value = assignment.slice(separatorIndex + 1);
  if (key in values) throw new Error(`Input "${key}" was provided more than once.`);
  values[key] = value;
}

function printPlan(plan, dryRun) {
  console.log(`${dryRun ? "Would generate" : "Generated"} ${plan.config.id} at ${plan.relativeOutputDirectory}:`);
  for (const file of plan.files) {
    console.log(`- ${file.relativeDestination}`);
  }
}

async function main() {
  const args = parseArguments(process.argv.slice(2));

  if (args.list) {
    for (const templateId of listRegisteredTemplates()) console.log(templateId);
    return;
  }

  if (args.help || args.templateId === undefined) {
    printGeneralHelp();
    return;
  }

  const { config, templateDirectory } = await loadRegisteredTemplate(args.templateId);
  validateTemplateDefinition(config);

  if (args.primaryValue === undefined) {
    throw new Error(`Template "${config.id}" requires <${config.primaryInput}>.`);
  }
  if (args.output === undefined && typeof config.resolveOutput !== "function") {
    throw new Error(`Template "${config.id}" requires --output <directory>.`);
  }
  if (config.primaryInput in args.values) {
    throw new Error(`Input "${config.primaryInput}" was provided both positionally and through --set.`);
  }

  const rawInputs = { ...args.values, [config.primaryInput]: args.primaryValue };
  const plan = await createGenerationPlan({
    config,
    output: args.output,
    rawInputs,
    repoRoot,
    templateDirectory: fileURLToPath(templateDirectory),
  });

  if (!args.dryRun) await writeGenerationPlan(plan);
  printPlan(plan, args.dryRun);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
