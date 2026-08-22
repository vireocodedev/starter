export type VireoEventSourceStatus = "connecting" | "open" | "reconnecting" | "closed";

export type VireoEventSourceListener = (event: MessageEvent<string>) => Promise<void> | void;

export type VireoEventSourceListeners<TEventName extends string = string> = Partial<
  Record<TEventName, VireoEventSourceListener>
>;

export type VireoEventSourceListenerError<TEventName extends string = string> = Readonly<{
  error: unknown;
  eventName: TEventName | null;
  event: MessageEvent<string>;
}>;

export type UseVireoEventSourceOptions<TEventName extends string = string> = {
  url: string | URL;
  enabled?: boolean;
  withCredentials?: boolean;
  listeners?: VireoEventSourceListeners<TEventName>;
  onOpen?: (event: Event) => void;
  onError?: (event: Event) => void;
  onMessage?: VireoEventSourceListener;
  onListenerError?: (failure: VireoEventSourceListenerError<TEventName>) => void;
};

export type UseVireoEventSourceResult = Readonly<{
  status: VireoEventSourceStatus;
  reconnect: () => void;
}>;
