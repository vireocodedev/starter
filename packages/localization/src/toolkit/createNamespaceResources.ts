import { deepMerge } from "./deepMerge";
import { validateResourceConfiguration } from "./validateResourceConfiguration";

/**
 * A recursively partial version of `T`. Consumers use it to supply per-locale
 * value overrides without having to restate the full resource shape.
 */
export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/**
 * Widens leaf string/number/boolean literals to their base primitive while
 * preserving object structure. Used to type base resource maps whose non-seed
 * locales share the shape but not the literal values of the canonical locale.
 */
export type WidenLeaves<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends (infer U)[]
        ? WidenLeaves<U>[]
        : T extends object
          ? { [K in keyof T]: WidenLeaves<T[K]> }
          : T;

export type CreateNamespaceResourcesConfig<TShape extends object, B extends string, L extends string> = {
  /** The i18next namespace the resulting resources are keyed under. */
  namespace: string;
  /** Locales the library ships out of the box, keyed by locale code. */
  baseResources: Record<B, TShape>;
  /** Base locale used to seed locales that the library does not ship. */
  seedFrom: B;
  /** The full set of locales the consumer app wants to support. */
  locales: readonly L[];
  /** Optional per-locale value overrides, deep-merged over the seeded base. */
  overrides?: Partial<Record<L, DeepPartial<TShape>>>;
};

/**
 * Builds a fully-populated i18next resource map for every requested locale.
 *
 * For each locale the merge chain is:
 *   1. Start from the `seedFrom` base resource (guarantees every key exists).
 *   2. If the locale is a shipped base locale, layer its shipped resource.
 *   3. Layer the consumer's partial override, if any.
 *
 * The result is `Record<Locale, { [namespace]: TShape }>`, so no key is ever
 * missing for any requested locale — including brand-new languages the library
 * does not ship, which fall back to the seed until translated.
 */
export function createNamespaceResources<TShape extends object, B extends string, L extends string, N extends string>(
  config: CreateNamespaceResourcesConfig<TShape, B, L> & { namespace: N },
): Record<L, Record<N, TShape>> {
  const { namespace, baseResources, seedFrom, locales, overrides } = config;

  if (namespace.trim().length === 0) {
    throw new Error("createNamespaceResources requires a non-empty namespace.");
  }
  if (!Object.prototype.hasOwnProperty.call(baseResources, seedFrom)) {
    throw new Error(`createNamespaceResources could not find seed locale "${seedFrom}".`);
  }
  validateResourceConfiguration("createNamespaceResources", locales, overrides);

  const seed = baseResources[seedFrom];
  const result = {} as Record<L, Record<N, TShape>>;

  for (const locale of locales) {
    const shipped = (baseResources as Record<string, TShape | undefined>)[locale];
    const override = overrides?.[locale];

    let merged = deepMerge(seed, undefined);
    if (shipped) {
      merged = deepMerge(merged, shipped);
    }
    if (override) {
      merged = deepMerge(merged, override);
    }

    result[locale] = { [namespace]: merged } as Record<N, TShape>;
  }

  return result;
}
