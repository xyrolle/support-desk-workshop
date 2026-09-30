import { z } from "zod";

export const errorCodes = [
  "validation_error",
  "not_found",
  "forbidden",
  "conflict",
  "internal_error",
] as const;

export const errorCodeSchema = z.enum(errorCodes);

export type ErrorCode = z.infer<typeof errorCodeSchema>;

export const errorResponseSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
