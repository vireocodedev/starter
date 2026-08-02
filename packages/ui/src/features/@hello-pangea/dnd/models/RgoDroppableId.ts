import { type ExtractObjectToTypedUnion } from "@/utils/typeutils";

/**
 * Augmentable registry that maps droppable type names to their ID payload shapes.
 *
 * Consumer apps extend this interface via **declaration merging** so that
 * `RgoDroppableId` becomes a discriminated union of every registered entry.
 *
 * ### How to augment in a consumer app
 *
 * Create (or extend) a `.d.ts` file (e.g. `src/@types/rgo.d.ts`) and merge
 * new members into the interface:
 *
 * ```ts
 * // src/@types/rgo.d.ts
 * declare module "@vireocodedev/starter-ui" {
 *   interface RgoDroppableIdRegistry {
 *     chamber: {
 *       chamberSide: ChamberSide;
 *       chamberDirection: Direction;
 *     };
 *     stream: {
 *       streamType: StreamType;
 *       streamDirection: Direction;
 *     };
 *   }
 * }
 * ```
 *
 * Each key becomes the `type` discriminator and each value becomes the
 * associated payload, producing a union like:
 *
 * ```ts
 * type RgoDroppableId =
 *   | { type: "chamber"; chamberSide: ChamberSide; chamberDirection: Direction }
 *   | { type: "stream"; streamType: StreamType; streamDirection: Direction };
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RgoDroppableIdRegistry {}

export type RgoDroppableId = ExtractObjectToTypedUnion<RgoDroppableIdRegistry>;
