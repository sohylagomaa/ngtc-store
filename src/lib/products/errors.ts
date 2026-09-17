import { ZodError } from "zod";

export function formatValidationErrors(error: ZodError) {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === "string" && !errors[field]) {
      errors[field] = issue.message;
    }
  }

  return errors;
}