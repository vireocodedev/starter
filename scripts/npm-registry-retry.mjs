export function isTransientNpmRegistryError(error) {
  const output = `${error?.stdout ?? ""}\n${error?.stderr ?? ""}`;
  return /(?:\bE404\b|\b404 Not Found\b)/u.test(output);
}

export async function retryTransientNpmRegistryOperation(
  operation,
  {
    attempts,
    intervalMs,
    onRetry = () => {},
    sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
  },
) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      if (!isTransientNpmRegistryError(error) || attempt === attempts) throw error;
      await onRetry(error, attempt);
      await sleep(intervalMs);
    }
  }
  throw new Error("Registry retry loop exhausted unexpectedly.");
}
