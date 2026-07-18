import { signal, type Signal } from "@preact/signals-react";

type Storage<TData extends Record<string, unknown>> = {
  get<TKey extends keyof TData>(key: TKey): TData[TKey];
  set<TKey extends keyof TData>(key: TKey, value: TData[TKey]): void;
};

export type PersistentSignal<TData extends Record<string, unknown>, TKey extends keyof TData> = {
  signal: Signal<TData[TKey]>;
  setLocal: (value: TData[TKey]) => void;
};

export function createPersistentSignal<TData extends Record<string, unknown>, TKey extends keyof TData>(
  storage: Storage<TData>,
  key: TKey,
): PersistentSignal<TData, TKey> {
  const state = signal<TData[TKey]>(storage.get(key));

  const setLocal = (value: TData[TKey]): void => {
    state.value = value;
    storage.set(key, value);
  };

  return {
    signal: state,
    setLocal,
  };
}
