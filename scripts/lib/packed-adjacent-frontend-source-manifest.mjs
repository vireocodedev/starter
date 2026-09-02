function fail(message) {
  throw new Error(`Packed adjacent frontend source manifest: ${message}`);
}

function record(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  return value;
}

function stringEntries(value, label) {
  return Object.entries(record(value, label)).map(([name, command]) => {
    if (typeof name !== "string" || name.trim() === "" || typeof command !== "string" || command.trim() === "") {
      fail(`${label} must contain only non-empty string entries`);
    }
    return [name, command];
  });
}

/**
 * Builds the minimal frontend manifest used to exercise an adjacent upgrade from
 * packed artifacts. Managed root and frontend scripts are source provenance and
 * must be represented exactly; the canonical Vireo script cannot be replaced.
 */
export function packedAdjacentFrontendSourceManifest({ packedSource, packedTarget, dependencies }) {
  const source = record(packedSource, "packedSource");
  const target = record(packedTarget, "packedTarget");
  if (typeof source.rootVireoScript !== "string" || source.rootVireoScript.trim() === "") {
    fail("packedSource.rootVireoScript must be a non-empty string");
  }
  const managedScripts =
    source.managedRootScripts === undefined ? [] : stringEntries(source.managedRootScripts, "managedRootScripts");
  const frontendSourceScripts =
    source.managedFrontendScripts === undefined
      ? undefined
      : record(source.managedFrontendScripts, "managedFrontendScripts").frontend;
  const managedFrontendScripts =
    frontendSourceScripts === undefined ? [] : stringEntries(frontendSourceScripts, "managedFrontendScripts.frontend");
  const projectionSourceScripts =
    target.projectionSourceFrontendScripts === undefined
      ? undefined
      : record(target.projectionSourceFrontendScripts, "projectionSourceFrontendScripts").frontend;
  const targetProjectionScripts =
    projectionSourceScripts === undefined
      ? []
      : stringEntries(projectionSourceScripts, "projectionSourceFrontendScripts.frontend");
  const sourceDependencies = stringEntries(dependencies, "dependencies");
  const scripts = new Map([["vireo", source.rootVireoScript]]);
  for (const [name, command] of [...managedScripts, ...managedFrontendScripts, ...targetProjectionScripts]) {
    if (name === "vireo") {
      if (command !== source.rootVireoScript)
        fail(`managed source script ${name} conflicts with packedSource.rootVireoScript`);
      continue;
    }
    const existing = scripts.get(name);
    if (existing !== undefined && existing !== command)
      fail(`managed source script ${name} has conflicting provenance`);
    scripts.set(name, command);
  }
  return {
    name: "packed-adjacent-upgrade-fixture",
    scripts: Object.fromEntries(scripts),
    dependencies: Object.fromEntries(sourceDependencies),
  };
}
