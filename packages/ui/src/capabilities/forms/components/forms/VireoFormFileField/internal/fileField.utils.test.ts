import { describe, expect, it } from "vitest";
import { acceptsVireoDragType, acceptsVireoFile, formatVireoFileSize, truncateVireoFileName } from "./fileField.utils";

const measure = (value: string) => Array.from(value).length;

describe("VireoFormFileField utilities", () => {
  it("matches exact MIME types, wildcards, and extensions case-insensitively", () => {
    expect(acceptsVireoFile({ name: "portrait.PNG", type: "image/png" }, "image/*")).toBe(true);
    expect(acceptsVireoFile({ name: "report.PDF", type: "" }, ".pdf")).toBe(true);
    expect(acceptsVireoFile({ name: "notes.txt", type: "text/plain" }, "application/pdf,text/plain")).toBe(true);
    expect(acceptsVireoFile({ name: "notes.txt", type: "text/plain" }, "image/*,.pdf")).toBe(false);
  });

  it("ignores invalid accept tokens and uses available MIME information while dragging", () => {
    expect(acceptsVireoFile({ name: "anything.bin", type: "application/octet-stream" }, "not-a-token")).toBe(true);
    expect(acceptsVireoDragType("image/jpeg", ".jpg,image/*")).toBe(true);
    expect(acceptsVireoDragType("text/plain", ".jpg,image/*")).toBe(false);
    expect(acceptsVireoDragType("", "image/*")).toBe(true);
  });

  it("formats decimal file sizes", () => {
    expect(formatVireoFileSize(999)).toBe("999 B");
    expect(formatVireoFileSize(1500)).toBe("1.5 kB");
    expect(formatVireoFileSize(12_500_000)).toBe("13 MB");
  });

  it("middle-truncates equal stem portions while preserving the final extension", () => {
    expect(truncateVireoFileName("abcdefghij.pdf", "middle", 11, measure)).toBe("abc…hij.pdf");
    expect(truncateVireoFileName("archive.tar.gz", "middle", 10, measure)).toBe("arc…tar.gz");
  });

  it("treats dotfiles and trailing dots as extensionless and supports end or no truncation", () => {
    expect(truncateVireoFileName(".environment", "middle", 8, measure)).toBe(".en…ent");
    expect(truncateVireoFileName("release.", "middle", 6, measure)).toBe("re…e.");
    expect(truncateVireoFileName("abcdefgh", "end", 5, measure)).toBe("abcd…");
    expect(truncateVireoFileName("abcdefgh", "none", 5, measure)).toBe("abcdefgh");
  });
});
