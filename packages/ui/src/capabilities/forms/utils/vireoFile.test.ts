import { describe, expect, it } from "vitest";
import { acceptsVireoDragType, acceptsVireoFile, formatVireoFileSize, truncateVireoFileName } from "./vireoFile";

describe("vireoFile", () => {
  it("formats decimal byte sizes", () => {
    expect(formatVireoFileSize(999)).toBe("999 B");
    expect(formatVireoFileSize(1500)).toBe("1.5 kB");
    expect(formatVireoFileSize(12_400_000)).toBe("12 MB");
  });

  it("matches extension, exact MIME, and wildcard accept tokens", () => {
    expect(acceptsVireoFile({ name: "report.PDF", type: "application/pdf" }, ".pdf")).toBe(true);
    expect(acceptsVireoFile({ name: "cover.png", type: "image/png" }, "image/*")).toBe(true);
    expect(acceptsVireoFile({ name: "notes.txt", type: "text/plain" }, "application/pdf")).toBe(false);
  });

  it("uses MIME-only accept information for drag previews", () => {
    expect(acceptsVireoDragType("image/png", ".png,image/*")).toBe(true);
    expect(acceptsVireoDragType("text/plain", ".txt")).toBe(true);
    expect(acceptsVireoDragType("text/plain", "image/*")).toBe(false);
  });

  it("balances middle truncation while preserving the complete extension", () => {
    const measure = (candidate: string) => Array.from(candidate).length;
    expect(truncateVireoFileName("abcdefghij.pdf", "middle", 11, measure)).toBe("abc…hij.pdf");
    expect(truncateVireoFileName("archive.tar.gz", "middle", 10, measure)).toBe("arc…tar.gz");
  });

  it("supports extensionless, trailing-dot, end, and disabled truncation", () => {
    const measure = (candidate: string) => Array.from(candidate).length;
    expect(truncateVireoFileName(".environment", "middle", 8, measure)).toBe(".en…ent");
    expect(truncateVireoFileName("release.", "middle", 6, measure)).toBe("re…e.");
    expect(truncateVireoFileName("abcdefgh", "end", 5, measure)).toBe("abcd…");
    expect(truncateVireoFileName("abcdefgh", "none", 5, measure)).toBe("abcdefgh");
  });
});
