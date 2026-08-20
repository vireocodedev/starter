import type { VireoFormFileNameTruncation } from "@/capabilities/forms/components/forms/VireoFormFileField/VireoFormFileField.types";

export function formatVireoFileSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  const units = ["kB", "MB", "GB", "TB"] as const;
  let value = bytes / 1000;
  let unitIndex = 0;
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex += 1;
  }
  return `${value >= 10 ? Math.round(value) : Math.round(value * 10) / 10} ${units[unitIndex]}`;
}

function validAcceptTokens(accept: string): string[] {
  return accept
    .split(",")
    .map(token => token.trim().toLowerCase())
    .filter(token => /^\.[^\s,]+$/.test(token) || /^[^/\s]+\/(?:\*|[^/\s]+)$/.test(token));
}

export function acceptsVireoFile(file: Pick<File, "name" | "type">, accept?: string): boolean {
  if (!accept?.trim()) return true;
  const tokens = validAcceptTokens(accept);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some(token => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return Boolean(type) && type.startsWith(token.slice(0, -1));
    return Boolean(type) && type === token;
  });
}

export function acceptsVireoDragType(type: string, accept?: string): boolean {
  if (!type || !accept?.trim()) return true;
  const tokens = validAcceptTokens(accept).filter(token => !token.startsWith("."));
  if (tokens.length === 0) return true;
  const normalized = type.toLowerCase();
  return tokens.some(token =>
    token.endsWith("/*") ? normalized.startsWith(token.slice(0, -1)) : normalized === token,
  );
}

function graphemes(value: string): string[] {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value), item => item.segment);
  }
  return Array.from(value);
}

function splitFileName(value: string): { stem: string; extension: string } {
  const dot = value.lastIndexOf(".");
  if (dot <= 0 || dot === value.length - 1) return { stem: value, extension: "" };
  return { stem: value.slice(0, dot), extension: value.slice(dot) };
}

export function truncateVireoFileName(
  value: string,
  mode: VireoFormFileNameTruncation,
  availableWidth: number,
  measure: (candidate: string) => number,
): string {
  if (mode === "none" || availableWidth <= 0 || measure(value) <= availableWidth) return value;
  const all = graphemes(value);
  if (mode === "end") {
    let low = 0;
    let high = all.length;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (measure(`${all.slice(0, middle).join("")}…`) <= availableWidth) low = middle;
      else high = middle - 1;
    }
    return `${all.slice(0, low).join("")}…`;
  }
  const { stem, extension } = splitFileName(value);
  if (extension && measure(extension) > availableWidth)
    return truncateVireoFileName(extension, "end", availableWidth, measure);
  const stemParts = graphemes(stem);
  let low = 0;
  let high = Math.floor(stemParts.length / 2);
  while (low < high) {
    const count = Math.ceil((low + high) / 2);
    const candidate = `${stemParts.slice(0, count).join("")}…${stemParts.slice(-count).join("")}${extension}`;
    if (measure(candidate) <= availableWidth) low = count;
    else high = count - 1;
  }
  if (low === 0) return `…${extension}`;
  return `${stemParts.slice(0, low).join("")}…${stemParts.slice(-low).join("")}${extension}`;
}
