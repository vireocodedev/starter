import { type AxiosInstance, type AxiosRequestConfig } from "axios";
import z from "zod";
import { parseHttpResponse, resolveHttpEndpoint, type HttpEndpointResolver } from "@/http/AxiosHttpClient";

export type PageableParams = {
  page: number;
  rowsPerPage: number;
  sortBy: string;
  sortDirection: "asc" | "desc";
};

export type PageableResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type SearchableFilters = {
  searchText: string;
  queryFiltersJson?: string | null;
};

export type PagedSearchRequest<TEntity, TFilters extends SearchableFilters> = {
  client: Pick<AxiosInstance, "post">;
  endpointName: string;
  schema: z.ZodType<TEntity>;
  pageable: PageableParams;
  filters: TFilters;
  config?: AxiosRequestConfig;
  resolveEndpoint?: HttpEndpointResolver;
};

export function normalizePageableResponse<T>(
  response: PageableResponse<T>,
  fallbackPageable: PageableParams,
): PageableResponse<T> {
  const content = Array.isArray(response?.content) ? response.content : [];
  const fallbackPage = Number.isFinite(fallbackPageable.page) ? fallbackPageable.page : 0;
  const fallbackSize = Number.isFinite(fallbackPageable.rowsPerPage) ? fallbackPageable.rowsPerPage : content.length;
  const number = Number.isFinite(response?.number) ? response.number : fallbackPage;
  const size = Number.isFinite(response?.size) ? response.size : fallbackSize;
  const totalElements = Number.isFinite(response?.totalElements) ? response.totalElements : content.length;
  const totalPages =
    Number.isFinite(response?.totalPages) && response.totalPages >= 0
      ? response.totalPages
      : size > 0
        ? Math.ceil(totalElements / size)
        : 0;

  return { ...response, content, number, size, totalElements, totalPages };
}

export function emptyPageableResponse<T>(pageable: PageableParams): PageableResponse<T> {
  return normalizePageableResponse({ content: [], number: 0, size: 0, totalElements: 0, totalPages: 0 }, pageable);
}

export function sortLocalResultsByAccessor<T>(
  items: T[],
  sortDirection: string | undefined,
  getValue: (item: T) => number | string,
): T[] {
  const direction = sortDirection === "desc" ? -1 : 1;

  return [...items].sort((left, right) => {
    const leftValue = getValue(left);
    const rightValue = getValue(right);

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * direction;
    }

    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
}

export function parseQueryFilterRequest(filtersJson: string | null): unknown | undefined {
  if (!filtersJson || !filtersJson.trim()) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(filtersJson) as { rows?: unknown[] } | null;

    if (parsed == null || typeof parsed !== "object") {
      return undefined;
    }

    const rows = Array.isArray(parsed.rows) ? parsed.rows : [];
    return rows.length === 0 ? undefined : parsed;
  } catch {
    return undefined;
  }
}

export async function postPagedSearch<TEntity, TFilters extends SearchableFilters>({
  client,
  endpointName,
  schema,
  pageable,
  filters,
  config,
  resolveEndpoint = resolveHttpEndpoint,
}: PagedSearchRequest<TEntity, TFilters>): Promise<PageableResponse<TEntity>> {
  const response = await client.post<PageableResponse<TEntity>>(
    resolveEndpoint(endpointName, "search"),
    parseQueryFilterRequest(filters.queryFiltersJson ?? null) ?? null,
    {
      ...config,
      params: { ...pageable, ...config?.params, searchText: filters.searchText },
      headers: { ...config?.headers, "Content-Type": "application/json" },
    },
  );

  return normalizePageableResponse(
    { ...response.data, content: parseHttpResponse(z.array(schema), response.data.content) },
    pageable,
  );
}
