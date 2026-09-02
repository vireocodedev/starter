export function templatePathForBaseline(profile, path) {
  if (profile === "frontend" && path.startsWith("scripts/")) return `frontend/${path}`;
  return path;
}

export function applyExactBaselineTransforms(source, file) {
  let output = source;
  for (const transform of file.transforms ?? []) {
    if (!transform?.from || typeof transform.to !== "string" || output.split(transform.from).length !== 2)
      throw new Error(`Baseline transform is not exact: ${file.path}`);
    output = output.replace(transform.from, transform.to);
  }
  return output;
}

export function projectedBaselineBytes(profile, templateBytes, file) {
  const output = applyExactBaselineTransforms(templateBytes, { ...file, transforms: file.projectionTransforms });
  if (
    profile === "frontend" &&
    file.path === "scripts/lighthouse-budget.mjs" &&
    !file.projectionTransforms?.some(
      transform =>
        transform.from === 'path.resolve(frontendRoot, "../.performance-evidence")' &&
        transform.to === 'path.resolve(frontendRoot, ".performance-evidence")',
    )
  ) {
    throw new Error("Frontend Lighthouse baseline must render project-local performance evidence.");
  }
  return output;
}
