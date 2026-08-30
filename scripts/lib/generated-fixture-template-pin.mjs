import { readFile } from "node:fs/promises";
import { join } from "node:path";

const commitPattern = /^[0-9a-f]{40}$/u;

export function assertGeneratedFixtureTemplatePin({ contract, templateCommit }) {
  const contractTemplateCommit = contract?.current?.template?.commit;
  if (typeof contractTemplateCommit !== "string" || !commitPattern.test(contractTemplateCommit))
    throw new Error("Ecosystem release contract must declare current.template.commit as a full Git commit.");
  if (typeof templateCommit !== "string" || !commitPattern.test(templateCommit))
    throw new Error("create-vireo must expose TEMPLATE_COMMIT as a full Git commit.");
  if (templateCommit !== contractTemplateCommit)
    throw new Error(
      `Generated fixture template pin mismatch: create-vireo uses ${templateCommit}, but the ecosystem release contract requires ${contractTemplateCommit}.`,
    );
  return contractTemplateCommit;
}

export async function assertGeneratedFixtureTemplatePinFromRepository({
  repositoryRoot,
  templateCommit,
  readContract = readFile,
}) {
  const contractPath = join(repositoryRoot, "contracts/ecosystem-release-contract.json");
  let contract;
  try {
    contract = JSON.parse(await readContract(contractPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ecosystem release contract at ${contractPath}.`, { cause: error });
  }
  return assertGeneratedFixtureTemplatePin({ contract, templateCommit });
}
