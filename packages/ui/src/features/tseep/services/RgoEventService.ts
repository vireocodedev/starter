import { type RgoEventSchema, type RgoEventSchemaKey } from "@/features/tseep/models/RgoEventSchema";
import { EventEmitter } from "tseep";

export type RgoEventSchemaValue<T> = (data: T) => Promise<void> | void;

export class RgoEventService {
  // @ts-ignore
  private readonly emitter = new EventEmitter<RgoEventSchema>();

  public constructor() {
    // NOOP
  }

  on<TKey extends RgoEventSchemaKey>(key: TKey, listener: RgoEventSchemaValue<RgoEventSchema[TKey]>): void {
    // @ts-ignore
    this.emitter.on(key, listener);
  }

  off<TKey extends RgoEventSchemaKey>(key: TKey, listener: RgoEventSchemaValue<RgoEventSchema[TKey]>): void {
    // @ts-ignore
    this.emitter.off(key, listener);
  }

  emit<TKey extends RgoEventSchemaKey>(key: TKey, arg: RgoEventSchema[TKey]): void {
    // @ts-ignore
    this.emitter.emit(key, arg);
  }
}

export const rgoEventService = new RgoEventService();
