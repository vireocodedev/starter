import { type AxiosError } from "axios";

export type SanitizedAxiosError = {
  code?: string;
  message: string;
  method?: string;
  name: string;
  path?: string;
  status?: number;
};

export function getAxiosRequestPath(error: AxiosError): string | undefined {
  const requestUrl = error.config?.url;

  if (!requestUrl) {
    return undefined;
  }

  try {
    return new URL(requestUrl, window.location.origin).pathname;
  } catch {
    return undefined;
  }
}

export function sanitizeAxiosError(error: AxiosError): SanitizedAxiosError {
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.response?.status,
    method: error.config?.method?.toUpperCase(),
    path: getAxiosRequestPath(error),
  };
}
