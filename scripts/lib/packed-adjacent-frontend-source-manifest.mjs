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
 * packed artifacts. Managed root scripts are source provenance and must be
 * represented exactly; the canonical Vireo script cannot be replaced.
 */
export function packedAdjacentFrontendSourceManifest({ packedSource, dependencies }) {
  const source = record(packedSource, "packedSource");
  if (typeof source.rootVireoScript !== "string" || source.rootVireoScript.trim() === "") {
    fail("packedSource.rootVireoScript must be a non-empty string");
  }
  const managedScripts =
    source.managedRootScripts === undefined ? [] : stringEntries(source.managedRootScripts, "managedRootScripts");
  const sourceDependencies = stringEntries(dependencies, "dependencies");
  const scriptEntries = [["vireo", source.rootVireoScript]];
  for (const [name, command] of managedScripts) {
    if (name === "vireo") {
      if (command !== source.rootVireoScript)
        fail("managedRootScripts.vireo conflicts with packedSource.rootVireoScript");
      continue;
    }
    scriptEntries.push([name, command]);
  }
  return {
    name: "packed-adjacent-upgrade-fixture",
    scripts: Object.fromEntries(scriptEntries),
    dependencies: Object.fromEntries(sourceDependencies),
  };
}
