const registry = new Map([
  ["react-component", new URL("../../packages/ui/templates/react-component/template.config.mjs", import.meta.url)],
]);

export function listRegisteredTemplates() {
  return [...registry.keys()].sort();
}

export async function loadRegisteredTemplate(templateId) {
  const configUrl = registry.get(templateId);
  if (!configUrl) {
    throw new Error(`Unknown template "${templateId}". Available templates: ${listRegisteredTemplates().join(", ")}.`);
  }

  const module = await import(configUrl.href);
  return {
    config: module.default,
    templateDirectory: new URL(".", configUrl),
  };
}
