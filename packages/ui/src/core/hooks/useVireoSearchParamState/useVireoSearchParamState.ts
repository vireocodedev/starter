import React from "react";
import type {
  VireoNullableSearchParamStateOptions,
  VireoSearchParamCodec,
  VireoSearchParamHistory,
  VireoSearchParamStateOptions,
  VireoSearchParamStateResult,
  VireoSearchParamStateSetter,
  VireoStringSearchParamStateOptions,
} from "./useVireoSearchParamState.types";

export type {
  VireoNullableSearchParamStateOptions,
  VireoSearchParamCodec,
  VireoSearchParamHistory,
  VireoSearchParamStateOptions,
  VireoSearchParamStateResult,
  VireoSearchParamStateSetter,
  VireoStringSearchParamStateOptions,
} from "./useVireoSearchParamState.types";

const DECIMAL_NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;

const stringCodec: VireoSearchParamCodec<string> = Object.freeze({
  parse: (rawValue: string) => rawValue,
  serialize: (value: string) => {
    if (typeof value !== "string") throw new TypeError("The Vireo string search-parameter codec requires a string.");
    return value;
  },
});

const numberCodec: VireoSearchParamCodec<number> = Object.freeze({
  parse: (rawValue: string) => {
    if (!DECIMAL_NUMBER_PATTERN.test(rawValue)) throw new TypeError("Invalid decimal search-parameter value.");
    const value = Number(rawValue);
    if (!Number.isFinite(value)) throw new TypeError("Invalid finite search-parameter number.");
    return value;
  },
  serialize: (value: number) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new TypeError("The Vireo number search-parameter codec requires a finite number.");
    }
    return Object.is(value, -0) ? "0" : String(value);
  },
});

const booleanCodec: VireoSearchParamCodec<boolean> = Object.freeze({
  parse: (rawValue: string) => {
    if (rawValue === "true") return true;
    if (rawValue === "false") return false;
    throw new TypeError("Invalid boolean search-parameter value.");
  },
  serialize: (value: boolean) => {
    if (typeof value !== "boolean") throw new TypeError("The Vireo boolean search-parameter codec requires a boolean.");
    return value ? "true" : "false";
  },
});

export const vireoSearchParamCodecs = Object.freeze({
  string: stringCodec,
  number: numberCodec,
  boolean: booleanCodec,
});

type RuntimeOptions<T> = {
  defaultValue: T | null;
  codec?: VireoSearchParamCodec<T>;
  history?: VireoSearchParamHistory;
  keepDefaultInUrl?: boolean;
};

type ResolvedConfiguration<T> = {
  key: string;
  defaultValue: T | null;
  defaultSerialized: string | null;
  codec: VireoSearchParamCodec<T>;
  history: VireoSearchParamHistory;
  keepDefaultInUrl: boolean;
  nullable: boolean;
};

type ReadResult<T> = {
  value: T | null;
  canonicalValueRaw: string | null;
  desiredUrlRaw: string | null;
  urlIsCanonical: boolean;
};

class CodecContractError extends TypeError {}

const listeners = new Set<() => void>();
let subscribedWindow: Window | null = null;

function emitStoreChange() {
  for (const listener of [...listeners]) listener();
}

function handlePopState() {
  emitStoreChange();
}

function subscribe(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;

  if (subscribedWindow !== window) {
    subscribedWindow?.removeEventListener("popstate", handlePopState);
    subscribedWindow = window;
    subscribedWindow.addEventListener("popstate", handlePopState);
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && subscribedWindow !== null) {
      subscribedWindow.removeEventListener("popstate", handlePopState);
      subscribedWindow = null;
    }
  };
}

function getBrowserSnapshot() {
  return window.location.search;
}

function getServerSnapshot() {
  return "";
}

function validateKey(key: string) {
  if (typeof key !== "string" || key.length === 0 || key.trim() !== key) {
    throw new TypeError("useVireoSearchParamState key must be a non-empty string without surrounding whitespace.");
  }
}

function serializeCodecValue<T>(codec: VireoSearchParamCodec<T>, value: T) {
  const serialized = codec.serialize(value);
  if (typeof serialized !== "string") {
    throw new TypeError("useVireoSearchParamState codec.serialize must return a string.");
  }
  return serialized;
}

function resolveConfiguration<T>(key: string, options: RuntimeOptions<T>): ResolvedConfiguration<T> {
  validateKey(key);
  if (options.defaultValue === undefined) {
    throw new TypeError("useVireoSearchParamState defaultValue must not be undefined.");
  }

  const nullable = options.defaultValue === null;
  const codec =
    options.codec ?? (typeof options.defaultValue === "string" ? (stringCodec as VireoSearchParamCodec<T>) : undefined);
  if (codec === undefined) {
    throw new TypeError("useVireoSearchParamState requires a codec for non-string and nullable state.");
  }
  if (typeof codec.parse !== "function" || typeof codec.serialize !== "function") {
    throw new TypeError("useVireoSearchParamState codec must provide parse and serialize functions.");
  }

  const history = options.history ?? "replace";
  if (history !== "replace" && history !== "push") {
    throw new TypeError('useVireoSearchParamState history must be either "replace" or "push".');
  }
  const keepDefaultInUrl = options.keepDefaultInUrl ?? false;
  if (typeof keepDefaultInUrl !== "boolean") {
    throw new TypeError("useVireoSearchParamState keepDefaultInUrl must be a boolean.");
  }
  if (nullable && keepDefaultInUrl) {
    throw new TypeError("useVireoSearchParamState cannot keep a null default value in the URL.");
  }

  return {
    key,
    defaultValue: options.defaultValue,
    defaultSerialized: nullable ? null : serializeCodecValue(codec, options.defaultValue as T),
    codec,
    history,
    keepDefaultInUrl,
    nullable,
  };
}

function fallbackReadResult<T>(configuration: ResolvedConfiguration<T>, rawValues: string[]): ReadResult<T> {
  const desiredUrlRaw = configuration.keepDefaultInUrl ? configuration.defaultSerialized : null;
  return {
    value: configuration.defaultValue,
    canonicalValueRaw: configuration.defaultSerialized,
    desiredUrlRaw,
    urlIsCanonical:
      desiredUrlRaw === null ? rawValues.length === 0 : rawValues.length === 1 && rawValues[0] === desiredUrlRaw,
  };
}

function readSearchParam<T>(configuration: ResolvedConfiguration<T>, search: string): ReadResult<T> {
  const rawValues = new URLSearchParams(search).getAll(configuration.key);
  if (rawValues.length === 0) return fallbackReadResult(configuration, rawValues);

  let value: T;
  try {
    value = configuration.codec.parse(rawValues[0]);
  } catch (error) {
    if (error instanceof CodecContractError) throw error;
    return fallbackReadResult(configuration, rawValues);
  }
  if (value === null || value === undefined) {
    throw new CodecContractError("useVireoSearchParamState codec.parse must not return null or undefined.");
  }

  let canonicalValueRaw: string;
  try {
    canonicalValueRaw = serializeCodecValue(configuration.codec, value);
  } catch {
    return fallbackReadResult(configuration, rawValues);
  }
  const isDefault = !configuration.nullable && canonicalValueRaw === configuration.defaultSerialized;
  const desiredUrlRaw = isDefault && !configuration.keepDefaultInUrl ? null : canonicalValueRaw;

  return {
    value,
    canonicalValueRaw,
    desiredUrlRaw,
    urlIsCanonical:
      desiredUrlRaw === null ? rawValues.length === 0 : rawValues.length === 1 && rawValues[0] === desiredUrlRaw,
  };
}

function writeSearchParam<T>(
  configuration: ResolvedConfiguration<T>,
  rawValue: string | null,
  history: VireoSearchParamHistory,
) {
  const url = new URL(window.location.href);
  if (rawValue === null) url.searchParams.delete(configuration.key);
  else url.searchParams.set(configuration.key, rawValue);

  const method = history === "push" ? "pushState" : "replaceState";
  window.history[method](window.history.state, "", url);
  emitStoreChange();
}

function serializeNextValue<T>(configuration: ResolvedConfiguration<T>, value: T | null) {
  if (value === undefined) {
    throw new TypeError("useVireoSearchParamState state must not be undefined.");
  }
  if (value === null) {
    if (!configuration.nullable) {
      throw new TypeError("useVireoSearchParamState non-null state must not be null.");
    }
    return { canonicalValueRaw: null, desiredUrlRaw: null };
  }

  const canonicalValueRaw = serializeCodecValue(configuration.codec, value);
  const isDefault = !configuration.nullable && canonicalValueRaw === configuration.defaultSerialized;
  return {
    canonicalValueRaw,
    desiredUrlRaw: isDefault && !configuration.keepDefaultInUrl ? null : canonicalValueRaw,
  };
}

export function useVireoSearchParamState(
  key: string,
  options: VireoStringSearchParamStateOptions,
): VireoSearchParamStateResult<string>;
export function useVireoSearchParamState<T>(
  key: string,
  options: VireoNullableSearchParamStateOptions<T>,
): VireoSearchParamStateResult<T | null>;
export function useVireoSearchParamState<T extends NonNullable<unknown>>(
  key: string,
  options: VireoSearchParamStateOptions<T>,
): VireoSearchParamStateResult<T>;
/**
 * Synchronizes one scalar React state value with one URL search parameter.
 *
 * Hook instances sharing a key must use compatible codecs, defaults, and default-retention policy.
 */
export function useVireoSearchParamState<T>(
  key: string,
  options: RuntimeOptions<T>,
): VireoSearchParamStateResult<T | null> {
  const configuration = resolveConfiguration(key, options);
  const configurationRef = React.useRef(configuration);
  configurationRef.current = configuration;
  const search = React.useSyncExternalStore(subscribe, getBrowserSnapshot, getServerSnapshot);
  const readResult = readSearchParam(configuration, search);

  React.useEffect(() => {
    if (typeof window === "undefined" || window.location.search !== search || readResult.urlIsCanonical) return;
    try {
      writeSearchParam(configurationRef.current, readResult.desiredUrlRaw, "replace");
    } catch {
      // URL cleanup is best-effort: state still safely falls back to the configured default.
    }
  }, [
    configuration.codec,
    configuration.defaultSerialized,
    configuration.keepDefaultInUrl,
    configuration.key,
    readResult.desiredUrlRaw,
    readResult.urlIsCanonical,
    search,
  ]);

  const setValue = React.useCallback<VireoSearchParamStateSetter<T | null>>(valueOrUpdater => {
    if (typeof window === "undefined") {
      throw new Error("useVireoSearchParamState cannot update search parameters outside a browser environment.");
    }

    const currentConfiguration = configurationRef.current;
    const current = readSearchParam(currentConfiguration, window.location.search);
    const nextValue =
      typeof valueOrUpdater === "function"
        ? (valueOrUpdater as (currentValue: T | null) => T | null)(current.value)
        : valueOrUpdater;
    const next = serializeNextValue(currentConfiguration, nextValue);

    if (current.urlIsCanonical && current.desiredUrlRaw === next.desiredUrlRaw) return;
    const history = current.canonicalValueRaw === next.canonicalValueRaw ? "replace" : currentConfiguration.history;
    writeSearchParam(currentConfiguration, next.desiredUrlRaw, history);
  }, []);

  return [readResult.value, setValue] as const;
}
