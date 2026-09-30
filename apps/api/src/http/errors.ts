import type { ErrorCode, ErrorResponse } from "@support-desk/shared";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class HttpError extends Error {
  readonly status: ContentfulStatusCode;
  readonly code: ErrorCode;

  constructor(status: ContentfulStatusCode, code: ErrorCode, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends HttpError {
  constructor(message: string) {
    super(400, "validation_error", message);
    this.name = "ValidationError";
  }
}

/** The user may see the resource but not do this to it. */
export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(403, "forbidden", message);
    this.name = "ForbiddenError";
  }
}

/** Missing, or hidden from the user: both look the same from outside. */
export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, "not_found", message);
    this.name = "NotFoundError";
  }
}

/** The request is valid but clashes with the current state, like removing the last admin. */
export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, "conflict", message);
    this.name = "ConflictError";
  }
}

function errorResponse(code: ErrorCode, message: string): ErrorResponse {
  return { error: { code, message } };
}

export function handleError(error: Error, c: Context): Response {
  if (error instanceof HttpError) {
    return c.json(errorResponse(error.code, error.message), error.status);
  }

  console.error(error);
  return c.json(errorResponse("internal_error", "Something went wrong on our side."), 500);
}

export function handleNotFound(c: Context): Response {
  return c.json(errorResponse("not_found", `No route for ${c.req.method} ${c.req.path}.`), 404);
}
