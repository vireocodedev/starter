export type RgoApiMessageGroup = "CREATE" | "UPDATE" | "DELETE";

export type RgoApiMessageResolverProps<TEntity extends string> = {
  group: RgoApiMessageGroup;
  success: boolean;
  entity: TEntity;
};

export type RgoApiMessageBuildKeyProps<TEntity extends string> = {
  entity: TEntity;
  group: RgoApiMessageGroup;
  success: boolean;
  offline: boolean;
};

export type CreateApiMessageResolverOptions<TEntity extends string, TKey extends string> = {
  /** Translation function. Receives the key produced by `buildKey`. */
  t: (key: TKey) => string;
  /** Predicate evaluated on every call to determine whether to use offline message variants. */
  isOffline: () => boolean;
  /** Maps the resolved props to a translation key. */
  buildKey: (props: RgoApiMessageBuildKeyProps<TEntity>) => TKey;
};

/**
 * Builds a resolver that maps `{ group, success, entity }` to a translated API message string.
 *
 * The resolver delegates key construction to `buildKey` (so callers control the namespace),
 * detects offline state via `isOffline`, and translates the resulting key with `t`.
 */
export function createApiMessageResolver<TEntity extends string, TKey extends string>(
  options: CreateApiMessageResolverOptions<TEntity, TKey>,
): (props: RgoApiMessageResolverProps<TEntity>) => string {
  const { t, isOffline, buildKey } = options;
  return ({ group, success, entity }) => t(buildKey({ entity, group, success, offline: isOffline() }));
}
