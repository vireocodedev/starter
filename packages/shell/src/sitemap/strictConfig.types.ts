export type StrictConfig<TConfig, TShape> = TConfig & Record<Exclude<keyof TConfig, keyof TShape>, never>;

export type StrictConfigRecord<TRecord, TShape> = {
  readonly [K in keyof TRecord]: StrictConfig<TRecord[K], TShape>;
};
