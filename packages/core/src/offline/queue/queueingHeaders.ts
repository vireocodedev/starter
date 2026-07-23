export const OFFLINE_TEMP_ID_HEADER = "X-Offline-Temp-Id";
export const OFFLINE_TEMP_PRODUCT_ID_LEGACY_HEADER = "X-Offline-Temp-Product-Id";

export function normalizeHeaders(input: Record<string, unknown> | undefined): Record<string, string> {
  const normalized: Record<string, string> = {};

  if (!input) {
    return normalized;
  }

  for (const [key, value] of Object.entries(input)) {
    if (value == null) {
      continue;
    }

    normalized[key.toLowerCase()] = String(value);
  }

  return normalized;
}

export function extractReplayHeaders(headers: Record<string, unknown> | undefined): Record<string, string> {
  const record = normalizeHeaders(headers);
  const replay: Record<string, string> = {};

  const idempotencyKey = record["idempotency-key"];
  if (idempotencyKey) {
    replay["Idempotency-Key"] = idempotencyKey;
  }

  const contentType = record["content-type"];
  if (contentType) {
    replay["Content-Type"] = contentType;
  }

  const offlineTempId =
    record[OFFLINE_TEMP_ID_HEADER.toLowerCase()] ?? record[OFFLINE_TEMP_PRODUCT_ID_LEGACY_HEADER.toLowerCase()];
  if (offlineTempId) {
    replay[OFFLINE_TEMP_ID_HEADER] = offlineTempId;
  }

  return replay;
}