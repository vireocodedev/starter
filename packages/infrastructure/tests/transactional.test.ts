import { getTransactionalMetadata, transactional } from "@/index";
import { describe, expect, it } from "vitest";

describe("transactional", () => {
  it("marks decorated async methods without changing their behavior", async () => {
    class ExampleApi {
      @transactional()
      async save(value: string) {
        return `saved:${value}`;
      }

      async read() {
        return "read";
      }
    }

    const api = new ExampleApi();
    expect(getTransactionalMetadata(ExampleApi.prototype.save)).toBe(true);
    expect(getTransactionalMetadata(ExampleApi.prototype.read)).toBe(false);
    await expect(api.save("value")).resolves.toBe("saved:value");
  });

  it("rejects private methods and non-function metadata targets", () => {
    const decorate = transactional<object, [], void>();
    const method = async () => undefined;

    expect(() =>
      decorate(method, {
        private: true,
      } as ClassMethodDecoratorContext<object, (this: object) => Promise<void>>),
    ).toThrow("@transactional cannot decorate private methods.");
    expect(getTransactionalMetadata(null)).toBe(false);
  });
});
