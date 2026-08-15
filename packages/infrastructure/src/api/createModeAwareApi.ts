import { getTransactionalMetadata } from "@/api/transactional";

type AsyncMethod = (...args: unknown[]) => Promise<unknown>;

export type ModeAwareApiMode = "offline" | "online";

export type ModeAwareApiInvocationContext = {
  moduleKey: string;
  methodName: string;
  methodLabel: string;
  online: boolean;
};

export type ModeAwareApiInvocationEvent = ModeAwareApiInvocationContext & {
  mode: ModeAwareApiMode;
  durationMs: number;
};

export type CreateModeAwareApiOptions<
  TOnlineApi extends Record<string, unknown>,
  TOfflineApi extends Partial<{ [TModuleKey in keyof TOnlineApi]: unknown }>,
> = {
  onlineApi: TOnlineApi;
  offlineApi: TOfflineApi;
  readOnline: () => boolean;
  assertCanInvoke?: (context: ModeAwareApiInvocationContext) => void;
  isOfflineTransactional?: (offlineMethod: unknown, context: ModeAwareApiInvocationContext) => boolean;
  isOfflineFallbackError?: (error: unknown, context: ModeAwareApiInvocationContext) => boolean;
  createNoFallbackError?: (context: ModeAwareApiInvocationContext) => Error;
  now?: () => number;
  onInvokeSuccess?: (event: ModeAwareApiInvocationEvent) => void;
  onInvokeError?: (event: ModeAwareApiInvocationEvent, error: unknown) => void;
};

function getFunctionMemberNames(moduleObject: unknown): string[] {
  if (moduleObject == null || (typeof moduleObject !== "object" && typeof moduleObject !== "function")) {
    return [];
  }

  const members = new Set<string>();
  let current = moduleObject as object | null;

  while (current && current !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(current)) {
      if (name === "constructor") {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(current, name);
      if (descriptor && typeof descriptor.value === "function") {
        members.add(name);
      }
    }

    current = Object.getPrototypeOf(current) as object | null;
  }

  return [...members];
}

function getModuleMethod(moduleObject: unknown, methodName: PropertyKey): AsyncMethod | undefined {
  if (moduleObject == null || (typeof moduleObject !== "object" && typeof moduleObject !== "function")) {
    return undefined;
  }

  const candidate = Reflect.get(moduleObject, methodName);
  return typeof candidate === "function" ? (candidate as AsyncMethod) : undefined;
}

async function invokeModuleMethod(moduleObject: unknown, method: AsyncMethod, args: unknown[]): Promise<unknown> {
  return await method.apply(moduleObject, args);
}

export function createModeAwareApi<
  TOnlineApi extends Record<string, unknown>,
  TOfflineApi extends Partial<{ [TModuleKey in keyof TOnlineApi]: unknown }>,
>({
  onlineApi,
  offlineApi,
  readOnline,
  assertCanInvoke,
  isOfflineTransactional = getTransactionalMetadata,
  isOfflineFallbackError = () => false,
  createNoFallbackError = context =>
    new Error(`[api] Offline mode is not supported and no online fallback exists for ${context.methodLabel}.`),
  now = Date.now,
  onInvokeSuccess,
  onInvokeError,
}: CreateModeAwareApiOptions<TOnlineApi, TOfflineApi>): TOnlineApi {
  const resolved = {} as TOnlineApi;
  const moduleKeys = Object.keys(onlineApi) as Array<keyof TOnlineApi>;

  async function invoke(
    moduleObject: unknown,
    method: AsyncMethod,
    args: unknown[],
    context: ModeAwareApiInvocationContext,
    mode: ModeAwareApiMode,
    suppressError?: (error: unknown) => boolean,
  ): Promise<unknown> {
    const startedAt = now();

    try {
      const result = await invokeModuleMethod(moduleObject, method, args);
      onInvokeSuccess?.({ ...context, mode, durationMs: Math.round(now() - startedAt) });
      return result;
    } catch (error) {
      if (!suppressError?.(error)) {
        onInvokeError?.({ ...context, mode, durationMs: Math.round(now() - startedAt) }, error);
      }
      throw error;
    }
  }

  for (const moduleKey of moduleKeys) {
    const onlineModule = onlineApi[moduleKey];
    const offlineModule = offlineApi[moduleKey];
    const methodNames = new Set<string>([
      ...getFunctionMemberNames(onlineModule),
      ...getFunctionMemberNames(offlineModule),
    ]);

    if (methodNames.size === 0) {
      throw new Error(
        `[api] Module ${String(moduleKey)} has no callable handlers. Define at least one API method in offline or online implementation.`,
      );
    }

    const resolvedModule: Record<string, unknown> = {};

    for (const methodName of methodNames) {
      const offlineMethod = getModuleMethod(offlineModule, methodName);
      const onlineMethod = getModuleMethod(onlineModule, methodName);
      const methodLabel = `${String(moduleKey)}.${methodName}`;

      if (!offlineMethod && !onlineMethod) {
        throw new Error(
          `[api] Missing handlers for ${methodLabel}. Define at least one offline or online implementation.`,
        );
      }

      resolvedModule[methodName] = async (...args: unknown[]) => {
        const online = readOnline();
        const context: ModeAwareApiInvocationContext = {
          moduleKey: String(moduleKey),
          methodName,
          methodLabel,
          online,
        };

        assertCanInvoke?.(context);

        if (offlineMethod && isOfflineTransactional(offlineMethod, context)) {
          const useOnline = online && !!onlineMethod;
          return await invoke(
            useOnline ? onlineModule : offlineModule,
            useOnline ? onlineMethod : offlineMethod,
            args,
            context,
            useOnline ? "online" : "offline",
          );
        }

        if (onlineMethod && online) {
          return await invoke(onlineModule, onlineMethod, args, context, "online");
        }

        if (offlineMethod) {
          let shouldFallback = false;

          try {
            return await invoke(offlineModule, offlineMethod, args, context, "offline", error => {
              shouldFallback = isOfflineFallbackError(error, context);
              return shouldFallback;
            });
          } catch (error) {
            if (!shouldFallback) {
              throw error;
            }
          }
        }

        if (onlineMethod && !online) {
          return await invoke(onlineModule, onlineMethod, args, context, "online");
        }

        const fallbackError = createNoFallbackError(context);
        onInvokeError?.({ ...context, mode: "online", durationMs: 0 }, fallbackError);
        throw fallbackError;
      };
    }

    (resolved as Record<string, unknown>)[moduleKey as string] = resolvedModule;
  }

  return resolved;
}
