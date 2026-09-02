import { relative } from "node:path";

export const outputRelativePathsOption = "--output-relative-paths";

export function parsePublicEvidenceCollectorArguments(arguments_) {
  const [outputArgument, option] = arguments_;
  if (!outputArgument || (option !== undefined && option !== outputRelativePathsOption) || arguments_.length > 2) {
    throw new Error(
      `Usage: node scripts/collect-public-release-evidence.mjs <new-output-directory> [${outputRelativePathsOption}]`,
    );
  }
  return { outputArgument, outputRelativePaths: option === outputRelativePathsOption };
}

export function manifestEvidencePath({ repositoryRoot, outputRoot, path, outputRelativePaths }) {
  return relative(outputRelativePaths ? outputRoot : repositoryRoot, path).replaceAll("\\", "/");
}

export function manifestEvidenceRoot({ repositoryRoot, outputRoot, outputRelativePaths }) {
  return outputRelativePaths ? outputRoot : repositoryRoot;
}
