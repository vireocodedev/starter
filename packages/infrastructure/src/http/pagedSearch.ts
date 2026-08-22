import { type AxiosInstance, type AxiosRequestConfig } from "axios";
import z from "zod";
import { parseHttpResponse, resolveHttpEndpoint, type HttpEndpointResolver } from "./AxiosHttpClient";

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

export function createPageableResponseSchema<TSchema extends z.ZodTypeAny>(contentSchema: TSchema) {
  const metadata = z.number().int().nonnegative();

  return z.object({
    content: z.array(contentSchema),
    number: metadata,
    size: metadata,
    totalElements: metadata,
    totalPages: metadata,
  });
}

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
  const toNonnegativeInteger = (value: number, fallback: number) =>
    Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
  const fallbackPage = toNonnegativeInteger(fallbackPageable.page, 0);
  const fallbackSize = toNonnegativeInteger(fallbackPageable.rowsPerPage, content.length);
  const number = toNonnegativeInteger(response?.number, fallbackPage);
  const size = toNonnegativeInteger(response?.size, fallbackSize);
  const totalElements = toNonnegativeInteger(response?.totalElements, content.length);
  const totalPages =
    Number.isFinite(response?.totalPages) && response.totalPages >= 0
      ? Math.floor(response.totalPages)
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

  const parsed = z
    .object({ rows: z.array(z.unknown()) })
    .passthrough()
    .parse(JSON.parse(filtersJson));

  return parsed.rows.length === 0 ? undefined : parsed;
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

  return parseHttpResponse(createPageableResponseSchema(schema), response.data);
}
