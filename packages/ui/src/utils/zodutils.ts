import z from "zod";

export function zodParse<TSchema extends z.ZodTypeAny>(Schema: TSchema, data: unknown): z.infer<TSchema> {
  try {
    return Schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // @ts-ignore
      error["~description"] = Schema.description ?? null;
      // @ts-ignore
      error["~target"] = data;
      // TODO: Consider even showing a toast with info button that opens JSON viewer with the error details, to make it easier for users to report issues with API responses.
      console.error(
        `[zodParse] Validation failed${Schema.description ? ` for "${Schema.description}"` : ""}:`,
        error.issues,
        "\nReceived:",
        data,
      );
    }
    throw error;
  }
}
