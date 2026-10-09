import type { ZodError } from "zod";

export function sendValidationError(error: ZodError): Response {
  return Response.json(
    {
      success: false,
      error: "validation_error",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    },
    { status: 400 }
  );
}