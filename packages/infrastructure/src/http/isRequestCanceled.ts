import axios, { CanceledError } from "axios";

export function isRequestCanceled(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    error instanceof CanceledError ||
    (axios.isAxiosError(error) && error.code === "ERR_CANCELED") ||
    (typeof DOMException !== "undefined" && error instanceof DOMException && error.name === "AbortError")
  );
}
