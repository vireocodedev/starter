import { parseFragment } from "parse5";

const NETWORK_URL_PATTERN = /(?:https?:)?[\\/]{2}[^\s"'<>(),]+/giu;

function normalizeHostname(hostname) {
  return hostname.toLowerCase().replace(/\.$/u, "");
}

export function markupReferencesHostname(markup, hostname, baseUrl) {
  const normalizedHostname = normalizeHostname(hostname);
  for (const { name, value } of parsedMarkupValues(parseFragment(markup))) {
    const preprocessedValue = value.replace(/[\t\n\r]/gu, "");
    const candidates = [preprocessedValue];
    if (name === "srcset" || name === "imagesrcset")
      candidates.push(...parseSrcsetCandidates(value).map(candidate => candidate.replace(/[\t\n\r]/gu, "")));
    for (const candidate of candidates) {
      if (candidateReferencesHostname(candidate, normalizedHostname, baseUrl)) return true;
    }
    for (const match of preprocessedValue.matchAll(NETWORK_URL_PATTERN)) {
      if (candidateReferencesHostname(match[0], normalizedHostname, baseUrl)) return true;
    }
  }
  return false;
}

function* parsedMarkupValues(node) {
  for (const attribute of node.attrs ?? []) yield { name: attribute.name, value: attribute.value };
  if (node.nodeName === "#text") yield { name: "#text", value: node.value };
  for (const child of node.childNodes ?? []) yield* parsedMarkupValues(child);
  if (node.content) yield* parsedMarkupValues(node.content);
}

function candidateReferencesHostname(candidate, hostname, baseUrl) {
  try {
    return normalizeHostname(new URL(candidate, baseUrl).hostname) === hostname;
  } catch {
    return false;
  }
}

function parseSrcsetCandidates(srcset) {
  const candidates = [];
  let position = 0;
  while (position < srcset.length) {
    while (position < srcset.length && (isAsciiWhitespace(srcset[position]) || srcset[position] === ",")) position += 1;
    if (position >= srcset.length) break;

    const urlStart = position;
    while (position < srcset.length && !isAsciiWhitespace(srcset[position])) position += 1;
    const url = srcset.slice(urlStart, position).replace(/,+$/u, "");
    if (url.length > 0) candidates.push(url);

    let parentheses = 0;
    while (position < srcset.length) {
      const character = srcset[position++];
      if (character === "(") parentheses += 1;
      else if (character === ")" && parentheses > 0) parentheses -= 1;
      else if (character === "," && parentheses === 0) break;
    }
  }
  return candidates;
}

function isAsciiWhitespace(character) {
  return character === " " || character === "\t" || character === "\n" || character === "\f" || character === "\r";
}
