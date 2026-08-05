export async function runOfflineUpdate<TInput, TResult>(args: {
  input: TInput;
  persistLocal: (input: TInput) => Promise<void>;
  enqueue: (input: TInput) => Promise<void>;
  buildResult: (input: TInput) => TResult;
}): Promise<TResult> {
  const { input, persistLocal, enqueue, buildResult } = args;

  await persistLocal(input);
  await enqueue(input);
  return buildResult(input);
}

export async function runOfflineDelete<TId>(args: {
  id: TId;
  deleteLocal: (id: TId) => Promise<void>;
  enqueue: (id: TId) => Promise<void>;
}): Promise<void> {
  const { id, deleteLocal, enqueue } = args;

  await deleteLocal(id);
  await enqueue(id);
}

export async function runOfflineCreateWithTempId<TCreate, TTempId, TEntity extends { id: TTempId }>(args: {
  input: TCreate;
  allocateTempId: () => TTempId;
  buildLocalEntity: (input: TCreate, tempId: TTempId) => TEntity;
  persistLocal: (entity: TEntity) => Promise<void>;
  enqueue: (input: TCreate, tempId: TTempId) => Promise<void>;
}): Promise<TEntity> {
  const { input, allocateTempId, buildLocalEntity, persistLocal, enqueue } = args;

  const tempId = allocateTempId();
  const localEntity = buildLocalEntity(input, tempId);

  await persistLocal(localEntity);
  await enqueue(input, tempId);
  return localEntity;
}
