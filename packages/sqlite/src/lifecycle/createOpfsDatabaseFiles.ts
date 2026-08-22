import { type KeyValueStorage } from "./createDatabaseOwnerStore";

export type OpfsDatabaseFiles = {
  getFileName: (owner: string, legacyOwner: string | null) => string;
  deleteFiles: (fileName?: string) => Promise<void>;
};

export type CreateOpfsDatabaseFilesConfig = {
  legacyFileName: string;
  mappingKeyPrefix: string;
  getStorage: () => KeyValueStorage;
  getDirectory: () => Promise<FileSystemDirectoryHandle> | null;
  createScopedFileName: (encodedOwner: string) => string;
  lockRetryDelayMs?: number;
  wait?: (delayMs: number) => Promise<void>;
};

const LOCKED_ERROR_NAMES: ReadonlySet<string> = new Set([
  "NoModificationAllowedError",
  "InvalidStateError",
  "InvalidModificationError",
]);

function encodeOwner(owner: string): string {
  return Array.from(new TextEncoder().encode(owner), byte => byte.toString(16).padStart(2, "0")).join("");
}

function isErrorNamed(error: unknown, name: string): boolean {
  return error instanceof Error && error.name === name;
}

async function listDatabaseEntryNames(root: FileSystemDirectoryHandle, fileName: string): Promise<string[]> {
  const iterableRoot = root as FileSystemDirectoryHandle & { keys?: () => AsyncIterableIterator<string> };
  if (typeof iterableRoot.keys !== "function") return [fileName];

  const names: string[] = [];
  for await (const name of iterableRoot.keys()) {
    if (name === fileName || name.startsWith(`${fileName}-`)) names.push(name);
  }
  return names;
}

async function removeEntryIfPresent(root: FileSystemDirectoryHandle, name: string): Promise<void> {
  try {
    await root.removeEntry(name, { recursive: true });
  } catch (error) {
    if (!isErrorNamed(error, "NotFoundError")) throw error;
  }
}

export function createOpfsDatabaseFiles(config: CreateOpfsDatabaseFilesConfig): OpfsDatabaseFiles {
  const retryDelayMs = config.lockRetryDelayMs ?? 50;
  const wait = config.wait ?? (delayMs => new Promise(resolve => setTimeout(resolve, delayMs)));

  return {
    getFileName(owner, legacyOwner) {
      const encodedOwner = encodeOwner(owner);
      const mappingKey = `${config.mappingKeyPrefix}${encodedOwner}`;
      const storage = config.getStorage();
      const existing = storage.getItem(mappingKey);
      if (existing != null) return existing;

      const fileName = legacyOwner === owner ? config.legacyFileName : config.createScopedFileName(encodedOwner);
      storage.setItem(mappingKey, fileName);
      return fileName;
    },
    async deleteFiles(fileName = config.legacyFileName) {
      const directory = config.getDirectory();
      if (!directory) return;

      const root = await directory;
      for (const entryName of await listDatabaseEntryNames(root, fileName)) {
        try {
          await removeEntryIfPresent(root, entryName);
        } catch (error) {
          if (!(error instanceof Error) || !LOCKED_ERROR_NAMES.has(error.name)) throw error;
          await wait(retryDelayMs);
          await removeEntryIfPresent(root, entryName);
        }
      }
    },
  };
}
