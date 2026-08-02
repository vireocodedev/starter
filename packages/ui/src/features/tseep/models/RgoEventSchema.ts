/**
 * Augmentable registry that maps event names to their payload types.
 *
 * Consumer apps extend this interface via **declaration merging** so that
 * event services (`RgoEventService`, `RgoWebWorkerService`, `useSseEmitter`)
 * gain type-safe event names and payloads.
 *
 * ### How to augment in a consumer app
 *
 * Create (or extend) a `.d.ts` file (e.g. `src/@types/rgo.d.ts`) and merge
 * new members into the interface:
 *
 * ```ts
 * // src/@types/rgo.d.ts
 * import { type IDBCache } from "@/infrastructure/browser";
 *
 * declare module "@vireocodedev/starter-ui" {
 *   interface RgoEventSchema {
 *     "app:ready": undefined;
 *     "app:cache-update": IDBCache;
 *     "app:connection-timeout": undefined;
 *   }
 * }
 * ```
 *
 * Each key becomes a valid event name and each value becomes the expected
 * payload type. Use `undefined` for events that carry no data.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RgoEventSchema {}

export type RgoEventSchemaKey = keyof RgoEventSchema;
