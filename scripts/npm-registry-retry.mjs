function npmOutput(error) {
  const output = `${error?.stdout ?? ""}\n${error?.stderr ?? ""}`;
  return output;
}

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

export function isExactNpmNotargetDiagnostic(error, coordinate) {
  if (typeof coordinate !== "string" || coordinate.length === 0) return false;
  const output = npmOutput(error);
  return (
    /(?:^|\r?\n)npm (?:error|ERR!) code ETARGET(?:\r?\n|$)/mu.test(output) &&
    new RegExp(
      `^npm (?:error|ERR!) notarget No matching version found for ${escapeRegularExpression(coordinate)}\\.$`,
      "mu",
    ).test(output)
  );
}

export function isTransientNpmRegistryError(error, { allowlistedNotargetCoordinates = [] } = {}) {
  const output = npmOutput(error);
  if (/(?:\bE404\b|\b404 Not Found\b)/u.test(output)) return true;
  return allowlistedNotargetCoordinates.some(coordinate => isExactNpmNotargetDiagnostic(error, coordinate));
}

export async function retryTransientNpmRegistryOperation(
  operation,
  {
    attempts,
    intervalMs,
    allowlistedNotargetCoordinates = [],
    onRetry = () => {},
    sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
  },
) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      if (!isTransientNpmRegistryError(error, { allowlistedNotargetCoordinates }) || attempt === attempts) throw error;
      await onRetry(error, attempt);
      await sleep(intervalMs);
    }
  }
  throw new Error("Registry retry loop exhausted unexpectedly.");
}
