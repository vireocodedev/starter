import { SaxesParser } from "saxes";

const mavenPomNamespace = "http://maven.apache.org/POM/4.0.0";
const mitPomLicenseUrl = "https://github.com/vireocodedev/vireo/blob/main/LICENSE";
const maximumPomBytes = 1024 * 1024;

/**
 * Validates the small, fixed Maven POM surface used for Vireo public releases.
 * It deliberately does not generalize XML or Maven inheritance semantics.
 */
export function inspectPublicMavenPom({ pom, group, module, version }) {
  if (typeof pom !== "string" || Buffer.byteLength(pom, "utf8") > maximumPomBytes) return false;
  if (
    /<!DOCTYPE\b/iu.test(pom) ||
    /<!ENTITY\b/iu.test(pom) ||
    /<!\[CDATA\[/u.test(pom) ||
    /&(?:#[0-9]+|#x[0-9a-f]+|[A-Za-z_:][A-Za-z0-9._:-]*);/iu.test(pom)
  )
    return false;

  let failed = false;
  let ended = false;
  let root;
  const direct = { groupId: [], artifactId: [], version: [], licenses: [] };
  const stack = [];
  const parser = new SaxesParser({ xmlns: true });
  parser.on("error", () => {
    failed = true;
  });
  parser.on("doctype", () => {
    failed = true;
  });
  parser.on("cdata", () => {
    failed = true;
  });
  parser.on("opentag", tag => {
    const parent = stack.at(-1);
    const node = {
      attributesValid: Object.keys(tag.attributes).length === 0,
      kind: null,
      licenseEntries: [],
      nameEntries: [],
      text: "",
      textOnly: false,
      urlEntries: [],
      uri: tag.uri,
      local: tag.local,
    };
    if (parent?.textOnly) failed = true;
    if (parent?.kind === "licenses" && !(tag.uri === mavenPomNamespace && tag.local === "license")) failed = true;
    if (parent?.kind === "license" && !(tag.uri === mavenPomNamespace && ["name", "url"].includes(tag.local)))
      failed = true;

    if (stack.length === 0) root = node;
    else if (stack.length === 1 && root?.uri === mavenPomNamespace && tag.uri === mavenPomNamespace) {
      if (["groupId", "artifactId", "version"].includes(tag.local)) {
        node.textOnly = true;
        direct[tag.local].push(node);
      } else if (tag.local === "licenses") {
        node.kind = "licenses";
        direct.licenses.push(node);
      }
    } else if (parent?.kind === "licenses" && tag.uri === mavenPomNamespace && tag.local === "license") {
      node.kind = "license";
      parent.licenseEntries.push(node);
    } else if (parent?.kind === "license" && tag.uri === mavenPomNamespace && tag.local === "name") {
      node.textOnly = true;
      parent.nameEntries.push(node);
    } else if (parent?.kind === "license" && tag.uri === mavenPomNamespace && tag.local === "url") {
      node.textOnly = true;
      parent.urlEntries.push(node);
    }
    if ((node.textOnly || node.kind === "licenses" || node.kind === "license") && !node.attributesValid) failed = true;
    stack.push(node);
  });
  parser.on("text", text => {
    const parent = stack.at(-1);
    if (parent?.textOnly) parent.text += text;
    else if ((parent?.kind === "licenses" || parent?.kind === "license") && text.trim().length > 0) failed = true;
  });
  parser.on("closetag", () => {
    stack.pop();
  });
  parser.on("end", () => {
    ended = true;
  });
  try {
    parser.write(pom).close();
  } catch {
    return false;
  }
  if (
    failed ||
    !ended ||
    stack.length !== 0 ||
    root?.local !== "project" ||
    root.uri !== mavenPomNamespace ||
    direct.groupId.length !== 1 ||
    direct.artifactId.length !== 1 ||
    direct.version.length !== 1 ||
    direct.licenses.length !== 1
  )
    return false;
  const [licenses] = direct.licenses;
  if (licenses.licenseEntries.length !== 1) return false;
  const [license] = licenses.licenseEntries;
  return (
    direct.groupId[0].attributesValid &&
    direct.groupId[0].text.trim() === group &&
    direct.artifactId[0].attributesValid &&
    direct.artifactId[0].text.trim() === module &&
    direct.version[0].attributesValid &&
    direct.version[0].text.trim() === version &&
    license.attributesValid &&
    license.nameEntries.length === 1 &&
    license.nameEntries[0].attributesValid &&
    license.nameEntries[0].text.trim() === "MIT" &&
    license.urlEntries.length === 1 &&
    license.urlEntries[0].attributesValid &&
    license.urlEntries[0].text.trim() === mitPomLicenseUrl
  );
}
