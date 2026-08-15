type AsyncMethod<TThis, TArgs extends unknown[], TResult> = (this: TThis, ...args: TArgs) => Promise<TResult>;

const TRANSACTIONAL_METHOD_METADATA = Symbol("transactional-method-metadata");

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type TransactionalMethod = Function & {
  [TRANSACTIONAL_METHOD_METADATA]?: boolean;
};

export function getTransactionalMetadata(value: unknown): boolean {
  if (typeof value !== "function") {
    return false;
  }

  return (value as TransactionalMethod)[TRANSACTIONAL_METHOD_METADATA] === true;
}

export function transactional<TThis, TArgs extends unknown[], TResult>() {
  return function (
    originalMethod: AsyncMethod<TThis, TArgs, TResult>,
    context: ClassMethodDecoratorContext<TThis, AsyncMethod<TThis, TArgs, TResult>>,
  ) {
    if (context.private) {
      throw new Error("@transactional cannot decorate private methods.");
    }

    Object.defineProperty(originalMethod, TRANSACTIONAL_METHOD_METADATA, {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false,
    });

    return originalMethod;
  };
}
