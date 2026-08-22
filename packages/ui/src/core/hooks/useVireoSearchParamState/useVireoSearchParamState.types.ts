export interface VireoSearchParamCodec<T> {
  /** Parses one decoded URLSearchParams value. Throw when the external value is invalid. */
  parse(rawValue: string): T;
  /** Serializes one value without applying URL percent encoding. */
  serialize(value: T): string;
}

export type VireoSearchParamHistory = "replace" | "push";

type VireoSearchParamCommonOptions = {
  /** @default 'replace' */
  history?: VireoSearchParamHistory;
  /** @default false */
  keepDefaultInUrl?: boolean;
};

export interface VireoStringSearchParamStateOptions extends VireoSearchParamCommonOptions {
  defaultValue: string;
  codec?: VireoSearchParamCodec<string>;
}

export interface VireoSearchParamStateOptions<T extends NonNullable<unknown>> extends VireoSearchParamCommonOptions {
  defaultValue: T;
  codec: VireoSearchParamCodec<T>;
}

export interface VireoNullableSearchParamStateOptions<T> extends Omit<
  VireoSearchParamCommonOptions,
  "keepDefaultInUrl"
> {
  defaultValue: null;
  codec: VireoSearchParamCodec<T>;
  keepDefaultInUrl?: false;
}

export type VireoSearchParamStateSetter<T> = (value: T | ((currentValue: T) => T)) => void;

export type VireoSearchParamStateResult<T> = readonly [value: T, setValue: VireoSearchParamStateSetter<T>];
