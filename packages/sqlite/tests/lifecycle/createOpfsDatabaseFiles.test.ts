import { createOpfsDatabaseFiles, type KeyValueStorage } from "@/index";
import { describe, expect, it, vi } from "vitest";

type FakeDirectory = {
  keys: () => AsyncIterableIterator<string>;
  removeEntry: ReturnType<typeof vi.fn>;
};

function createStorage(): KeyValueStorage {
  const values = new Map<string, string>();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
}

function createDirectory(entryNames: string[], removeEntry = vi.fn().mockResolvedValue(undefined)): FakeDirectory {
  return {
    keys: async function* () {
      yield* entryNames;
    },
    removeEntry,
  };
}

function createFiles(directory: FakeDirectory | null, storage = createStorage()) {
  return createOpfsDatabaseFiles({
    legacyFileName: "offline.sqlite3",
    mappingKeyPrefix: "starter:sqlite:",
    getStorage: () => storage,
    getDirectory: () => Promise.resolve(directory as unknown as FileSystemDirectoryHandle),
    createScopedFileName: encodedOwner => `offline-${encodedOwner}.sqlite3`,
    wait: vi.fn().mockResolvedValue(undefined),
  });
}

describe("createOpfsDatabaseFiles", () => {
  it("assigns stable distinct owner files while preserving the legacy owner", () => {
    const storage = createStorage();
    const files = createFiles(null, storage);

    expect(files.getFileName("bruno", "bruno")).toBe("offline.sqlite3");
    const scoped = files.getFileName("marta", "bruno");
    expect(scoped).not.toBe("offline.sqlite3");
    expect(files.getFileName("marta", null)).toBe(scoped);
  });

  it("removes only the selected database and its sidecars", async () => {
    const directory = createDirectory(["offline.sqlite3", "offline.sqlite3-wal", "other.sqlite3"]);

    await createFiles(directory).deleteFiles();

    expect(directory.removeEntry.mock.calls.map(call => call[0])).toEqual(["offline.sqlite3", "offline.sqlite3-wal"]);
  });

  it("retries a locked entry once and ignores an already deleted entry", async () => {
    const locked = new Error("locked");
    locked.name = "NoModificationAllowedError";
    const missing = new Error("missing");
    missing.name = "NotFoundError";
    const removeEntry = vi.fn().mockRejectedValueOnce(locked).mockRejectedValueOnce(missing);

    await expect(createFiles(createDirectory(["offline.sqlite3"], removeEntry)).deleteFiles()).resolves.toBeUndefined();
    expect(removeEntry).toHaveBeenCalledTimes(2);
  });
});
