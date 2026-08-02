import { type TODO } from "@/utils/typeutils";
import JSONCrush from "jsoncrush";

export function sortKeysDeep<T extends Record<string, TODO>>(obj: T): T {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return obj;
  }

  const sortedKeys = Object.keys(obj).sort();
  const result: Record<string, TODO> = {};

  for (const key of sortedKeys) {
    const value = obj[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      result[key] = sortKeysDeep(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

const crushEncodeCache = new Map<string, string>();

export function jsonCrushEncode<T extends Record<string, unknown>>(id: T): string {
  const sortedId = sortKeysDeep(id);
  const key = JSON.stringify(sortedId);
  const cached = crushEncodeCache.get(key);
  if (cached) return cached;
  const result = JSONCrush.crush(key);
  crushEncodeCache.set(key, result);
  return result;
}

const crushDecodeCache = new Map<string, unknown>();

export function jsonCrushDecode<T extends Record<string, unknown>>(encoded: string): T {
  const cached = crushDecodeCache.get(encoded);
  if (cached) return cached as T;
  const jsonString = JSONCrush.uncrush(encoded);
  const parsed = JSON.parse(jsonString);
  crushDecodeCache.set(encoded, parsed);
  return parsed;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(_: never): never {
  throw new Error();
}
