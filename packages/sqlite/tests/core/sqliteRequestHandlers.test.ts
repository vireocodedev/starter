import {
  createSqliteRequestHandlers,
  mergeSqliteRequestHandlers,
} from "@/core/sqliteRequestHandlers";
import { describe, expect, it } from "vitest";

describe("mergeSqliteRequestHandlers", () => {
  it("merges distinct operation handlers", () => {
    const first = () => null;
    const second = () => null;

    expect(
      mergeSqliteRequestHandlers(
        createSqliteRequestHandlers({ first }),
        createSqliteRequestHandlers({ second }),
      ),
    ).toEqual({ first, second });
  });

  it("rejects duplicate operation names instead of silently replacing a handler", () => {
    expect(() =>
      mergeSqliteRequestHandlers(
        createSqliteRequestHandlers({ listCustomers: () => null }),
        createSqliteRequestHandlers({ listCustomers: () => [] }),
      ),
    ).toThrow('SQLite request handler operation "listCustomers" is registered more than once.');
  });
});
