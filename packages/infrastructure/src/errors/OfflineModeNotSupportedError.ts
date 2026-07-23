export class OfflineModeNotSupportedError extends Error {
  constructor(operation: string) {
    super(`Offline mode does not support this operation yet: ${operation}`);
    this.name = "OfflineModeNotSupportedError";
  }
}
