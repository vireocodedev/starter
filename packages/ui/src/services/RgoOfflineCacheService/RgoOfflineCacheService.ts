import { getConsoleTextWithLabels, type ConsoleTextLabelParam } from "@/utils/consoleutils";
import type { EntityMap, IndexedDBEntity, ObjectStore, OmitNever, TODO } from "@/utils/typeutils";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type ExtractIndexedDBEntityType<T extends DBSchema> = OmitNever<{
  [K in keyof T]: T[K] extends IndexedDBEntity<infer U, TODO, TODO> ? U : never;
}>;

export type RgoOfflineCacheServiceConfig = {
  skipCacheReloadFor?: string[];
  version: number;
  debug?: boolean;
};

export class RgoOfflineCacheService<const TSchema extends DBSchema> {
  private readonly config: Required<RgoOfflineCacheServiceConfig>;
  private IDBP_DATABASE: IDBPDatabase<TSchema> | null = null;
  private storeNames: string[];
  private storeCollection: Record<keyof EntityMap<TSchema>, ObjectStore>;

  public constructor(
    storeCollection: Record<keyof EntityMap<TSchema>, ObjectStore>,
    config: RgoOfflineCacheServiceConfig,
  ) {
    this.storeCollection = storeCollection;
    this.storeNames = Object.keys(storeCollection);
    this.config = {
      version: config.version,
      debug: config.debug ?? false,
      skipCacheReloadFor: config.skipCacheReloadFor ?? [],
    };
  }

  public get db(): IDBPDatabase<TSchema> {
    if (!this.IDBP_DATABASE) {
      throw new Error(
        "Accessing IndexedDB before it has been initialized. To fix this, make sure you call `init()` method before accessing the `db` property.",
      );
    }

    return this.IDBP_DATABASE;
  }

  public async init(): Promise<void> {
    try {
      console.debug(...this.getPrintText("⏳ Initializing IndexedDB."));
      const db = await openDB<TSchema>("app", this.config.version, {
        upgrade: async db => {
          for (const storeName of this.storeNames) {
            if (db.objectStoreNames.contains(storeName as TODO)) continue;

            const storeConfig: ObjectStore = this.storeCollection[storeName as keyof EntityMap<TSchema>];
            const store: TODO = db.createObjectStore(storeName as TODO, storeConfig.options);

            Object.entries(storeConfig.indexes).forEach(([name, { keyPath, options }]) => {
              const indexName = name as TODO;
              store.createIndex(indexName, keyPath, options);
            });
          }
        },
        blocked: () => {
          console.warn(...this.getPrintText("⚠️ Database upgrade blocked - close other tabs."));
        },
        blocking: () => {
          console.warn(...this.getPrintText("⚠️ Database is blocking a newer version - consider refreshing."));
        },
      });
      this.IDBP_DATABASE = db;
      console.debug(...this.getPrintText("✅ IndexedDB initialized successfully!"));
    } catch (error) {
      console.error(...this.getPrintText("❌ IndexedDB failed to initialize!"), error);
      throw error;
    }
  }

  public async loadCache(cache: {
    [K in keyof ExtractIndexedDBEntityType<TSchema>]: ExtractIndexedDBEntityType<TSchema>[K][];
  }): Promise<void> {
    try {
      console.debug(...this.getPrintText("⏳ Starting cache load."));
      await this.clearCache();
      await Promise.all(this.storeNames.map(entity => this.bulkSave(entity as TODO, (cache as TODO)[entity])));
      console.debug(...this.getPrintText("✅ Cache loaded successfully!"));
    } catch (error) {
      console.error(...this.getPrintText("Failed to load IndexedDB cache"), error);
    }
  }

  private async clearCacheItem<TEntity extends keyof EntityMap<TSchema>>(entity: TEntity): Promise<void> {
    const transaction = this.db.transaction(entity as TODO, "readwrite");
    const store = transaction.objectStore(entity);
    await store.clear();
    await transaction.done;
    console.debug(...this.getPrintText(`🗑️ Cache cleared successfully!`, entity));
  }

  private async clearCache(): Promise<void> {
    await Promise.all(
      this.storeNames
        .filter(entity => !this.config.skipCacheReloadFor.includes(entity as string))
        .map(entity => this.clearCacheItem(entity as keyof EntityMap<TSchema>)),
    );
  }

  private async bulkSave<TEntity extends keyof EntityMap<TSchema>>(
    entity: TEntity,
    items: EntityMap<TSchema>[TEntity][],
    batchSize: number = 1_000,
  ): Promise<void> {
    const totalItems = items.length;
    if (totalItems === 0) return;

    console.debug(
      ...this.getPrintText(`⏳ Starting bulk save (${totalItems} items in batches of ${batchSize}).`, entity),
    );

    for (let i = 0; i < totalItems; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(totalItems / batchSize);

      try {
        const tx = this.db.transaction(entity as TODO, "readwrite");
        const store = tx.objectStore(entity);
        const promises = batch.map(item => store.put(item as TODO));
        await Promise.all(promises);
        await tx.done;

        console.debug(...this.getPrintText(`💾 [${batchNumber}/${totalBatches}] Batch saved successfully!`, entity));
      } catch (error) {
        console.error(...this.getPrintText(`❌ [${batchNumber}/${totalBatches}] Failed to save batch:`, entity), error);
        throw error;
      }
    }
  }

  private getPrintText(text: string, entity?: string | number | symbol): string[] {
    const params: ConsoleTextLabelParam[] = [];
    params.push({ text: "RgoOfflineCacheService", color: "white", backgroundColor: "#185ead" });
    if (entity) {
      params.push({ text: String(entity), color: "white", backgroundColor: "#b94ab2" });
    }
    params.push(text);
    return getConsoleTextWithLabels(params);
  }
}
