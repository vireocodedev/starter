import {
  emptyPageableResponse,
  normalizePageableResponse,
  parseQueryFilterRequest,
  postPagedSearch,
  sortLocalResultsByAccessor,
  type PageableParams,
  type PageableResponse,
} from "@/index";
import { type AxiosInstance } from "axios";
import { describe, expect, it, vi } from "vitest";
import z from "zod";

const PAGEABLE: PageableParams = { page: 2, rowsPerPage: 10, sortBy: "name", sortDirection: "asc" };

describe("paged response helpers", () => {
  it("normalizes missing metadata and creates empty pages", () => {
    const response = normalizePageableResponse(
      {
        content: [{ id: 1 }],
        number: Number.NaN,
        size: Number.NaN,
        totalElements: Number.NaN,
        totalPages: Number.NaN,
      },
      PAGEABLE,
    );

    expect(response).toEqual({ content: [{ id: 1 }], number: 2, size: 10, totalElements: 1, totalPages: 1 });
    expect(
      normalizePageableResponse({ content: [], number: -2, size: 3.8, totalElements: -1, totalPages: 2.9 }, PAGEABLE),
    ).toEqual({ content: [], number: 2, size: 3, totalElements: 0, totalPages: 2 });
    expect(emptyPageableResponse(PAGEABLE)).toEqual({
      content: [],
      number: 0,
      size: 0,
      totalElements: 0,
      totalPages: 0,
    });
  });

  it("parses only non-empty query filters and sorts without mutating input", () => {
    expect(parseQueryFilterRequest('{"rows":[{"field":"name"}]}')).toEqual({ rows: [{ field: "name" }] });
    expect(parseQueryFilterRequest('{"rows":[]}')).toBeUndefined();
    expect(() => parseQueryFilterRequest("not-json")).toThrow(SyntaxError);
    expect(() => parseQueryFilterRequest('{"unexpected":true}')).toThrow(z.ZodError);

    const items = [
      { name: "Beta", rank: 2 },
      { name: "Alpha", rank: 1 },
    ];
    expect(sortLocalResultsByAccessor(items, "asc", item => item.name).map(item => item.name)).toEqual([
      "Alpha",
      "Beta",
    ]);
    expect(sortLocalResultsByAccessor(items, "desc", item => item.rank).map(item => item.rank)).toEqual([2, 1]);
    expect(items[0].name).toBe("Beta");
  });
});

describe("postPagedSearch", () => {
  it("uses injected transport/endpoint policy and validates content", async () => {
    const post = vi.fn().mockResolvedValue({
      data: { content: [{ id: 7 }], number: 2, size: 10, totalElements: 21, totalPages: 3 },
    });
    const resolveEndpoint = vi.fn(() => "/custom/search");

    const response = await postPagedSearch({
      client: { post } as unknown as Pick<AxiosInstance, "post">,
      endpointName: "widgets",
      schema: z.object({ id: z.number() }),
      pageable: PAGEABLE,
      filters: { searchText: "needle", queryFiltersJson: '{"rows":[{"field":"id"}]}' },
      config: { headers: { "X-Test": "yes" }, params: { locale: "hr" } },
      resolveEndpoint,
    });

    expect(post).toHaveBeenCalledWith(
      "/custom/search",
      { rows: [{ field: "id" }] },
      {
        headers: { "Content-Type": "application/json", "X-Test": "yes" },
        params: { ...PAGEABLE, locale: "hr", searchText: "needle" },
      },
    );
    expect(response.content).toEqual([{ id: 7 }]);
  });

  it("rejects content that does not satisfy the supplied schema", async () => {
    const post = vi.fn().mockResolvedValue({
      data: { content: [{ id: "invalid" }], number: 0, size: 1, totalElements: 1, totalPages: 1 },
    } satisfies { data: PageableResponse<unknown> });

    await expect(
      postPagedSearch({
        client: { post } as unknown as Pick<AxiosInstance, "post">,
        endpointName: "widgets",
        schema: z.object({ id: z.number() }),
        pageable: PAGEABLE,
        filters: { searchText: "" },
      }),
    ).rejects.toBeInstanceOf(z.ZodError);
  });

  it("rejects invalid pageable metadata instead of silently repairing an API response", async () => {
    const post = vi.fn().mockResolvedValue({
      data: { content: [{ id: 1 }], number: -1, size: 1.5, totalElements: 1, totalPages: 1 },
    });

    await expect(
      postPagedSearch({
        client: { post } as unknown as Pick<AxiosInstance, "post">,
        endpointName: "widgets",
        schema: z.object({ id: z.number() }),
        pageable: PAGEABLE,
        filters: { searchText: "" },
      }),
    ).rejects.toBeInstanceOf(z.ZodError);
  });
});
