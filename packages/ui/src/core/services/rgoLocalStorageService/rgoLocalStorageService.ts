import { type AnyZodObject, type z } from "zod";

export class RgoLocalStorageService<TSchema extends AnyZodObject> {
  private readonly schema: TSchema;
  private readonly defaultValues: z.infer<TSchema>;

  public constructor(schema: TSchema, defaultValues: z.infer<TSchema>) {
    this.schema = schema;
    this.defaultValues = defaultValues;
  }

  public get<Key extends keyof z.infer<TSchema>>(key: Key): z.infer<TSchema>[Key] {
    const defaultValue = this.defaultValues[key];
    const value = localStorage.getItem(key as string);
    if (value === null) {
      this.set(key, defaultValue);
      return defaultValue;
    }
    try {
      const parsed = JSON.parse(value) as unknown;
      const keySchema = this.schema.shape[key];
      const result = keySchema.safeParse(parsed);
      if (result.success) {
        return result.data as z.infer<TSchema>[Key];
      }
      this.set(key, defaultValue);
      return defaultValue;
    } catch {
      this.set(key, defaultValue);
      return defaultValue;
    }
  }

  public set<Key extends keyof z.infer<TSchema>>(key: Key, value: z.infer<TSchema>[Key]): void {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key as string, serializedValue);
  }
}
