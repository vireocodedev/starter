import type {
  VireoFormErrorDisplay,
  VireoFormErrorFormatter,
} from "@/capabilities/forms/components/forms/VireoForm/VireoForm.types";

export function shouldDisplayVireoFormError(
  display: VireoFormErrorDisplay,
  context: { submissionAttempts: number; touched: boolean },
): boolean {
  if (typeof display === "function") return display(context);
  if (display === "always") return true;
  if (display === "never") return false;
  return context.touched || context.submissionAttempts > 0;
}

function findRecognizableError(error: unknown, visited: Set<unknown>): string | undefined {
  if (typeof error === "string") return error || undefined;
  if (error === null || error === undefined || visited.has(error)) return undefined;

  if (typeof error === "object") visited.add(error);

  if (Array.isArray(error)) {
    for (const nestedError of error) {
      const message = findRecognizableError(nestedError, visited);
      if (message !== undefined) return message;
    }
    return undefined;
  }

  if (error instanceof Error) return error.message || undefined;

  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" && message ? message : undefined;
  }

  return undefined;
}

/** Vireo's safe default formatter for TanStack and Standard Schema validation errors. */
export const defaultVireoFormErrorFormatter: VireoFormErrorFormatter = error => findRecognizableError(error, new Set());

/** Formats the first recognizable field error while preserving validator order. */
export function formatFirstVireoFormError(
  errors: readonly unknown[],
  formatter: VireoFormErrorFormatter = defaultVireoFormErrorFormatter,
): string | undefined {
  for (const error of errors) {
    const message = formatter(error);
    if (message !== undefined) return message;
  }
  return undefined;
}
