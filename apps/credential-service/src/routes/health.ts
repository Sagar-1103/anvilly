export function handleHealth(): Response {
  return Response.json({
    status: "ok",
    service: "credential-service",
    runtime: "bun",
    timestamp: new Date().toISOString(),
  });
}
