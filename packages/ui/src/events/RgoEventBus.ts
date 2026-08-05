/**
 * Augmentable registry that maps event names to their payload shapes.
 *
 * Consumer apps extend this interface via **declaration merging**, exactly like
 * `RgoDroppableIdRegistry`, so that every `on`/`emit` call is checked against
 * the app's own event vocabulary.
 *
 * ### How to augment in a consumer app
 *
 * ```ts
 * // src/@types/rgo.d.ts
 * declare module "@vireocodedev/starter-ui" {
 *   interface RgoEventRegistry {
 *     "geometry:change": { featureId: string };
 *     "shift:ended": void;
 *   }
 * }
 * ```
 *
 * A `void` payload means the event carries no data:
 *
 * ```ts
 * bus.emit("shift:ended");
 * bus.emit("geometry:change", { featureId: "abc" });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RgoEventRegistry {}

export type RgoEventName = keyof RgoEventRegistry & string;

export type RgoEventPayload<TName extends RgoEventName> = RgoEventRegistry[TName];

export type RgoEventListener<TName extends RgoEventName> =
  RgoEventPayload<TName> extends void ? () => void : (payload: RgoEventPayload<TName>) => void;

/** Removes the listener it was returned from. Safe to call more than once. */
export type RgoEventUnsubscribe = () => void;

type EmitArgs<TName extends RgoEventName> =
  RgoEventPayload<TName> extends void ? [name: TName] : [name: TName, payload: RgoEventPayload<TName>];

/**
 * A minimal typed publish/subscribe bus.
 *
 * Deliberately not a dependency: the surface is four methods, and a published
 * package should not pull a transitive runtime dependency to provide them.
 *
 * Listeners are isolated from each other — one that throws is reported through
 * `console.error` and does not prevent the rest from running, because a bus
 * whose delivery can be cancelled halfway is worse than no bus.
 */
export class RgoEventBus {
  // The registry is augmented by consumers, so internally the map is untyped;
  // the public methods are what enforce the contract.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly listeners = new Map<string, Set<(payload?: any) => void>>();

  on<TName extends RgoEventName>(name: TName, listener: RgoEventListener<TName>): RgoEventUnsubscribe {
    const existing = this.listeners.get(name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const set = existing ?? new Set<(payload?: any) => void>();

    if (!existing) this.listeners.set(name, set);
    set.add(listener as (payload?: unknown) => void);

    return () => this.off(name, listener);
  }

  once<TName extends RgoEventName>(name: TName, listener: RgoEventListener<TName>): RgoEventUnsubscribe {
    const unsubscribe = this.on(name, ((payload: RgoEventPayload<TName>) => {
      unsubscribe();
      (listener as (payload: RgoEventPayload<TName>) => void)(payload);
    }) as RgoEventListener<TName>);

    return unsubscribe;
  }

  off<TName extends RgoEventName>(name: TName, listener: RgoEventListener<TName>): void {
    const set = this.listeners.get(name);
    if (!set) return;

    set.delete(listener as (payload?: unknown) => void);
    if (set.size === 0) this.listeners.delete(name);
  }

  emit<TName extends RgoEventName>(...[name, payload]: EmitArgs<TName>): void {
    const set = this.listeners.get(name);
    if (!set) return;

    // Copy first: a listener may unsubscribe itself or others during delivery.
    [...set].forEach(listener => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`Listener for "${name}" threw.`, error);
      }
    });
  }

  listenerCount(name: RgoEventName): number {
    return this.listeners.get(name)?.size ?? 0;
  }

  /** Removes every listener for one event, or for all events when called bare. */
  clear(name?: RgoEventName): void {
    if (name === undefined) {
      this.listeners.clear();
      return;
    }

    this.listeners.delete(name);
  }
}

/**
 * Shared bus instance.
 *
 * Cross-cutting coordination that has no natural parent component — the case
 * both second-domain apps hit independently — belongs here. Anything that does
 * have a natural parent should still use props or context.
 */
export const rgoEventBus = new RgoEventBus();
