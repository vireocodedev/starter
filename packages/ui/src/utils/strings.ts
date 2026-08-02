export const trimText = (text: string, length: number) => {
  if (text.length <= length) {
    return text;
  }
  return text.substring(0, length).concat("...");
};

export function svg(strings: TemplateStringsArray, ...values: string[]): string {
  const input = strings.reduce((acc, str, i) => acc + str + (values[i] ?? ""), "").trim();
  const base64 = btoa(input);
  return `data:image/svg+xml;base64,${base64}`;
}

export function formatPrimitive(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }
  if (typeof value === "boolean") {
    return value ? "✓" : "✗";
  }

  const stringValue = String(value);

  return stringValue || "-";
}
