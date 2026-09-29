import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { z } from "zod";
import { ValidationError } from "./errors.ts";

type ValidationIssue = {
  path: PropertyKey[];
  message: string;
};

/**
 * Validates one part of the request (query, param, json, ...) with a zod schema.
 * Invalid input becomes a 400 with the standard error body.
 */
export function validate<Target extends keyof ValidationTargets, Schema extends z.ZodType>(
  target: Target,
  schema: Schema,
) {
  return zValidator(target, schema, (result) => {
    if (!result.success) {
      throw new ValidationError(describeIssues(result.error.issues));
    }
  });
}

function describeIssues(issues: ValidationIssue[]): string {
  return issues.map(describeIssue).join("; ");
}

function describeIssue(issue: ValidationIssue): string {
  if (issue.path.length === 0) {
    return issue.message;
  }
  return `${issue.path.join(".")}: ${issue.message}`;
}
