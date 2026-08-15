export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type DatabaseOwnerStore = {
  read: () => string | null;
  persist: (owner: string) => void;
  clear: () => void;
};

export type CreateDatabaseOwnerStoreConfig = {
  key: string;
  getStorage: () => KeyValueStorage;
};

export function createDatabaseOwnerStore({ key, getStorage }: CreateDatabaseOwnerStoreConfig): DatabaseOwnerStore {
  return {
    read() {
      const owner = getStorage().getItem(key);
      return owner != null && owner.length > 0 ? owner : null;
    },
    persist(owner) {
      getStorage().setItem(key, owner);
    },
    clear() {
      getStorage().removeItem(key);
    },
  };
}
