export const APPLICATION_PROJECTION_CATEGORIES: readonly string[];
export type ApplicationProjectionClassification = {
  ruleId: string;
  category: string;
  disposition: string | undefined;
};
export function classifyProjectionPath(
  contract: unknown,
  path: string,
  profile: string,
): ApplicationProjectionClassification | undefined;
export function validateApplicationProjectionContract(contract: unknown): string[];
export function validateApplicationIdentity(
  contract: unknown,
  values: Record<string, unknown>,
  phase?: "creation" | "release",
): string[];
export function readApplicationProjectionContract(path: string): unknown;
