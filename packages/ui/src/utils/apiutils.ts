import { type TODO } from "@/utils/typeutils";
import axios, { type AxiosError } from "axios";

export function endpoint(base: string, ...chunks: (string | number)[]) {
  let chunksCopy = [...chunks];
  if (base.startsWith("/")) {
    base = base.slice(1);
  }
  chunksCopy = chunksCopy.map(c => {
    const chunk = String(c);
    if (chunk.startsWith("/")) {
      return chunk.slice(1);
    }
    return chunk;
  });
  if (chunksCopy.length === 0 || (chunksCopy.length === 1 && chunksCopy[0] === "")) {
    return `/${base}`;
  }
  return `/${base}/${chunksCopy.join("/")}`;
}

export const EMPTY_PAGEABLE_PARAMS: PageableParams = {
  page: 0,
  rowsPerPage: -1,
  sortBy: "id",
  sortDirection: "asc",
};

export type PageableSortDirection = "asc" | "desc";

export type PageableParams = {
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDirection: PageableSortDirection;
};

export type PageableResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export const EMPTY_PAGEABLE_RESPONSE: PageableResponse<TODO> = {
  content: [],
  number: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
};

export type PageableFetchProps = {
  endpoint: string;
  pageable: PageableParams;
  params?: Record<string, TODO>;
};

export async function pageableFetch<T>({
  endpoint,
  pageable,
  params = {},
}: PageableFetchProps): Promise<PageableResponse<T>> {
  const { data: pageResult } = await axios.get<PageableResponse<T>>(endpoint, {
    params: {
      ...params,
      ...pageable,
    },
  });
  return pageResult;
}

export type ValidationResult = {
  status: number;
  fieldErrors: { propertyPath: string; code: string }[];
  globalErrors: string[];
};

export type AxiosBadRequestError = AxiosError<ValidationResult>;

export function handleBadRequestError(error: TODO, handler: (validationResult: ValidationResult) => void) {
  if (error.status !== 400) return;
  const responseData: TODO = error?.response?.data;
  if (
    !responseData ||
    !("status" in responseData) ||
    !("fieldErrors" in responseData) ||
    !("globalErrors" in responseData)
  )
    return;
  const typedError = error as AxiosBadRequestError;
  const errorData = typedError.response!.data;
  handler(errorData);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RgoMutationVariables<TMutationFn extends (...args: any) => any> = Parameters<TMutationFn>[0];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RgoMutationData<TMutationFn extends (...args: any) => any> = Awaited<ReturnType<TMutationFn>>;

/**
 * Best-effort serialization of an unknown error into a plain object
 * suitable for structured error-detail presentation. Native `Error` instances lose
 * their `name`/`message`/`stack` under `JSON.stringify`, so they are
 * unwrapped explicitly. Axios-style errors expose their HTTP context via
 * `response`, which is forwarded when present.
 */
export function serializeError(error: unknown): unknown {
  if (error instanceof Error) {
    const out: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
    const maybeAxios = error as Error & { response?: { status?: number; statusText?: string; data?: unknown } };
    if (maybeAxios.response) {
      out.response = {
        status: maybeAxios.response.status,
        statusText: maybeAxios.response.statusText,
        data: maybeAxios.response.data,
      };
    }
    const maybeCause = (error as { cause?: unknown }).cause;
    if (maybeCause !== undefined) out.cause = serializeError(maybeCause);
    return out;
  }
  return error;
}
