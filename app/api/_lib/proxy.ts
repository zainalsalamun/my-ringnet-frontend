import { API_PREFIX, TARGET_BACKEND } from "./constants";
import { handleCompatibility } from "./compatibility";
import { proxyHeaders } from "./http";

export async function handleProxy(req: Request, pathParts: string[]) {
  const compatibilityResponse = await handleCompatibility(req, pathParts);
  if (compatibilityResponse) return compatibilityResponse;

  const url = new URL(req.url);
  const targetPath = "/" + pathParts.join("/");
  const targetUrl = `${TARGET_BACKEND}${targetPath}${url.search}`;
  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.text();

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers: proxyHeaders(req),
      body,
    });
    const responseBody = await res.text();

    return new Response(responseBody, {
      status: res.status,
      statusText: res.statusText,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({
      success: false,
      message: `Gagal menghubungi backend ${targetUrl}: ${message}`,
    }, { status: 502 });
  }
}

export function normalizeProxyPath(path: string[]) {
  // If the path contains p-api (Partner / POP API)
  const pApiIdx = path.findIndex((p) => p === "p-api");
  if (pApiIdx !== -1) {
    return path.slice(pApiIdx);
  }

  // If the path already has api/v1 or api
  if (path[0] === "api") {
    return path;
  }

  return [API_PREFIX.split("/")[0], ...path];
}

