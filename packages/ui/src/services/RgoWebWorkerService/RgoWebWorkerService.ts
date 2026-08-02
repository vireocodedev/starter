import { type RgoEventSchema, type RgoEventSchemaKey } from "@/features/tseep/models/RgoEventSchema";
import { type RgoEventSchemaValue } from "@/features/tseep/services/RgoEventService";
import { type OmitNever, type TODO } from "@/utils/typeutils";

export type RgoEventHandler<TData = TODO> = (data: TData) => Promise<void> | void;

export type RgoEventMultiHandlerSchema<TSchema extends Record<string, RgoEventHandler>> = {
  [K in keyof TSchema]: RgoEventHandler<TSchema[K]>[];
};

export type RgoEventMultiHandlerPartialSchema<TSchema extends Record<string, RgoEventHandler>> = Partial<
  RgoEventMultiHandlerSchema<TSchema>
>;

export type RgoEventHandlerSchema<TSchema extends Record<string, RgoEventHandler> = Record<string, RgoEventHandler>> = {
  [K in keyof TSchema]: RgoEventHandler<TSchema[K]>;
};

export type RgoEventHandlerPartialSchema<TSchema extends Record<string, RgoEventHandler>> = Partial<
  RgoEventHandlerSchema<TSchema>
>;

export type RgoEventWithPayloadPresent<TSchema extends Record<string, RgoEventHandler>> = keyof OmitNever<{
  [K in keyof TSchema]: TSchema[K] extends undefined ? never : K;
}>;

export type RgoEventWithPayloadAbsent<TSchema extends Record<string, RgoEventHandler>> = keyof OmitNever<{
  [K in keyof TSchema]: TSchema[K] extends undefined ? K : never;
}>;

export type RgoWebWorkerServiceConfig<TWorkerSchema extends Record<string, RgoEventSchemaValue<TODO>>> = {
  url: string | URL;
  onInit?: (this: RgoWebWorkerService<TWorkerSchema>) => void;
  onBeforeMessage?: (
    this: RgoWebWorkerService<TWorkerSchema>,
    event: RgoEventSchemaKey,
    data: TODO,
  ) => Promise<void> | void;
  onAfterMessage?: (
    this: RgoWebWorkerService<TWorkerSchema>,
    event: RgoEventSchemaKey,
    data: TODO,
  ) => Promise<void> | void;
};

export class RgoWebWorkerService<TWorkerSchema extends Record<string, TODO>> {
  private worker!: Worker;
  private appEventHandlerSchema: RgoEventMultiHandlerPartialSchema<RgoEventHandlerSchema>;

  private readonly url: RgoWebWorkerServiceConfig<TWorkerSchema>["url"];
  private onInit?: RgoWebWorkerServiceConfig<TWorkerSchema>["onInit"];
  private onBeforeMessage?: RgoWebWorkerServiceConfig<TWorkerSchema>["onBeforeMessage"];
  private onAfterMessage?: RgoWebWorkerServiceConfig<TWorkerSchema>["onAfterMessage"];

  public constructor({ url, onInit, onBeforeMessage, onAfterMessage }: RgoWebWorkerServiceConfig<TWorkerSchema>) {
    this.appEventHandlerSchema = {};
    this.url = url;
    this.onInit = onInit;
    this.onBeforeMessage = onBeforeMessage;
    this.onAfterMessage = onAfterMessage;
  }

  private createWorker(): Worker {
    return new Worker(this.url, {
      type: "module",
    });
  }

  public init(): void {
    this.worker?.terminate();
    this.worker = this.createWorker();
    this.configureWorkerMessageHandler();
    this.onInit?.call(this);
  }

  public on<TEvent extends RgoEventSchemaKey>(event: TEvent, handler: RgoEventHandler<RgoEventSchema[TEvent]>): void {
    const prevHandlers: TODO[] = this.appEventHandlerSchema[event] || [];

    const nextHandler = async (data: Parameters<typeof handler>[0]) => {
      await this.onBeforeMessage?.call(this, event, data);
      await handler(data);
      await this.onAfterMessage?.call(this, event, data);
    };

    this.appEventHandlerSchema[event] = [...prevHandlers, nextHandler];
  }

  // prettier-ignore
  public emit<TEvent extends RgoEventWithPayloadPresent<TWorkerSchema>>(event: TEvent,data: TWorkerSchema[TEvent]): void;
  public emit<TEvent extends RgoEventWithPayloadAbsent<TWorkerSchema>>(event: TEvent): void;
  public emit<TEvent extends keyof TWorkerSchema>(event: TEvent, data?: TWorkerSchema[TEvent]): void {
    this.worker.postMessage({ type: event, data });
  }

  private configureWorkerMessageHandler(): void {
    this.worker.onmessage = async event => {
      if (!event.data || !event.data.type) return;
      const type = event.data.type as RgoEventSchemaKey;
      const typeName = String(type);

      const appEventHandler = this.appEventHandlerSchema[type] as TODO[];
      if (!appEventHandler) {
        console.warn(`No handler found for app event: ${typeName}`);
        return;
      }

      const data = event.data.data as TODO;
      try {
        await Promise.all(appEventHandler.map(handler => handler(data)));
      } catch (error) {
        console.error(`Error handling app event "${typeName}":`, error);
      }
    };
  }
}
