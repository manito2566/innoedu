import type { NextRequest } from "next/server";

/**
 * Builds an absolute URL for a redirect, honoring the reverse proxy's
 * forwarded headers. Firebase App Hosting (Cloud Run behind a global load
 * balancer) presents request.url as the container-internal address
 * (0.0.0.0:8080), so redirects built from request.url directly point
 * browsers at an unreachable host instead of the public one.
 */
export function absoluteUrl(path: string, request: NextRequest): URL {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    return new URL(path, `${forwardedProto ?? "https"}://${forwardedHost}`);
  }

  return new URL(path, request.url);
}
