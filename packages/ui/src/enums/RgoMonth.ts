import { z } from "zod";

export const RgoMonth = z.enum([
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
]);

export type RgoMonth = z.infer<typeof RgoMonth>;
