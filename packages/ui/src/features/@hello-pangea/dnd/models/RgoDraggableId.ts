import { type ExtractObjectToTypedUnion } from "@/utils/typeutils";

/**
 * Augmentable registry that maps draggable type names to their ID payload shapes.
 *
 * Consumer apps extend this interface via **declaration merging** so that
 * `RgoDraggableId` becomes a discriminated union of every registered entry.
 *
 * ### How to augment in a consumer app
 *
 * Create (or extend) a `.d.ts` file (e.g. `src/@types/rgo.d.ts`) and merge
 * new members into the interface:
 *
 * ```ts
 * // src/@types/rgo.d.ts
 * declare module "@vireocodedev/starter-ui" {
 *   interface RgoDraggableIdRegistry {
 *     convoy: {
 *       convoyId: number;
 *     };
 *     task: {
 *       taskId: string;
 *       groupIndex: number;
 *     };
 *   }
 * }
 * ```
 *
 * Each key becomes the `type` discriminator and each value becomes the
 * associated payload, producing a union like:
 *
 * ```ts
 * type RgoDraggableId =
 *   | { type: "convoy"; convoyId: number }
 *   | { type: "task"; taskId: string; groupIndex: number };
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RgoDraggableIdRegistry {}

export type RgoDraggableId = ExtractObjectToTypedUnion<RgoDraggableIdRegistry>;
