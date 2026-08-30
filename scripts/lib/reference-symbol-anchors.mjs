export function referenceSymbolBaseAnchor(symbol) {
  if (typeof symbol !== "string" || !symbol)
    throw new Error("A reference symbol anchor requires a non-empty symbol name.");
  return `symbol-${symbol.toLowerCase().replace(/[^a-z0-9_-]+/gu, "-")}`;
}

/**
 * Allocates stable fragment IDs for one ordered public entry point. The first
 * occurrence retains its legacy base. Collision suffixes never consume a base
 * reserved for a later export in the same entry point.
 */
export function allocateReferenceSymbolAnchors(symbols) {
  if (!Array.isArray(symbols)) throw new Error("Reference symbol anchors require an ordered symbol array.");
  const bases = symbols.map(referenceSymbolBaseAnchor);
  const reservedBases = new Set(bases);
  const used = new Set();
  return bases.map(base => {
    if (!used.has(base)) {
      used.add(base);
      return base;
    }
    let suffix = 2;
    let anchor = `${base}-${suffix++}`;
    while (used.has(anchor) || reservedBases.has(anchor)) anchor = `${base}-${suffix++}`;
    used.add(anchor);
    return anchor;
  });
}

/** Counts actual HTML id attributes without matching data-id or text content. */
export function countHtmlIdAttributes(html) {
  if (typeof html !== "string") throw new Error("HTML id attributes require source text.");
  const counts = new Map();
  for (const match of html.matchAll(/\sid\s*=\s*(?:"([^"]*)"|'([^']*)')/gu)) {
    const id = match[1] ?? match[2];
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}
