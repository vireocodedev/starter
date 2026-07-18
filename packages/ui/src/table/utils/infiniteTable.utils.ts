import { type PageableResponse } from "@rgo/front-ui";

export function mergePageableResponses<TElement>(
  pages: readonly PageableResponse<TElement>[],
): PageableResponse<TElement> {
  const latestPage = pages.at(-1);

  if (!latestPage) {
    throw new Error("At least one page is required to build an infinite table response.");
  }

  return {
    ...latestPage,
    content: pages.flatMap(page => page.content),
  };
}
