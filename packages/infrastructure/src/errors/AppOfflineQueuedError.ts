export class AppOfflineQueuedError extends Error {
  constructor() {
    super("The action was queued for synchronization.");
    this.name = "AppOfflineQueuedError";
  }
}
