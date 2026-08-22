import { getAxiosRequestPath, sanitizeAxiosError } from "@/index";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";

describe("Axios error reporting", () => {
  it("derives a sanitized path without requiring window", () => {
    const error = new AxiosError("Failed", "ERR_BAD_RESPONSE", {
      baseURL: "https://api.example.test/v1/",
      method: "post",
      url: "customers/42?include=private",
    } as InternalAxiosRequestConfig);

    expect(getAxiosRequestPath(error)).toBe("/v1/customers/42");
    expect(sanitizeAxiosError(error)).toMatchObject({
      code: "ERR_BAD_RESPONSE",
      message: "Failed",
      method: "POST",
      path: "/v1/customers/42",
    });
  });

  it("returns no path when the request URL is absent", () => {
    expect(getAxiosRequestPath(new AxiosError("Failed"))).toBeUndefined();
  });
});
