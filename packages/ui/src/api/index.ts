/**
 * Framework-free API surface.
 *
 * The root barrel pulls in React, MUI and DOM-dependent providers, so it cannot
 * be imported from a Web Worker - the worker has no `document`, and module-level
 * work in the UI layer fails on load. The SQLite worker nevertheless needs the
 * request/response helpers that the online and offline API modules share.
 *
 * This entry point exists to serve that case deliberately, instead of leaving
 * `exports: "./*"` open and letting consumers reach for whichever internal file
 * happens to work. Everything re-exported here must stay free of React, MUI and
 * DOM globals at runtime; `tests/entryPoints.test.ts` fails the build if that
 * stops being true.
 *
 * Every symbol here is also available from the root barrel. Import from `.`
 * unless the importing module can end up in a worker bundle.
 */

export {
  EMPTY_PAGEABLE_PARAMS,
  EMPTY_PAGEABLE_RESPONSE,
  endpoint,
  handleBadRequestError,
  pageableFetch,
  serializeError,
  type AxiosBadRequestError,
  type PageableFetchProps,
  type PageableParams,
  type PageableResponse,
  type RgoMutationData,
  type RgoMutationVariables,
  type ValidationResult,
} from "@/utils/apiutils";

export { zodParse } from "@/utils/zodutils";
