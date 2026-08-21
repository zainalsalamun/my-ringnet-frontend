import { API_PREFIX, TARGET_BACKEND } from "./constants";
import type { HttpMethod, JsonRecord } from "./types";

export function backendUrl(endpoint: string) {
  return `${TARGET_BACKEND}/${API_PREFIX}/${endpoint.replace(/^\/+/, "")}`;
}

export function jsonHeaders(req: Request): Record<string, string> {
  const authorization = req.headers.get("authorization");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(authorization ? { Authorization: authorization } : {}),
  };
}

export function proxyHeaders(req: Request) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Origin: TARGET_BACKEND,
    Referer: `${TARGET_BACKEND}/`,
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (!["host", "connection", "content-length", "origin", "referer", "user-agent"].includes(lowerKey)) {
      headers[key] = value;
    }
  });

  const contentType = req.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;

  return headers;
}

export function getPagination(url: URL) {
  const pageSize = Number(url.searchParams.get("limit") || url.searchParams.get("pageSize") || 100);
  const page = Number(url.searchParams.get("page") || 1);
  const pageIndex = Math.max(0, Number(url.searchParams.get("pageIndex") || page - 1));

  return {
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 100,
    pageIndex: Number.isFinite(pageIndex) && pageIndex >= 0 ? pageIndex : 0,
  };
}

export function listBody(input: Partial<JsonRecord> = {}) {
  return {
    sorting: [],
    globalFilter: "",
    columnVisibility: {},
    columnFilters: [],
    withDeleted: false,
    ...input,
  };
}

export async function readJson(req: Request): Promise<JsonRecord> {
  const text = await req.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as JsonRecord;
  } catch {
    return {};
  }
}

export async function readJsonResponse(res: Response): Promise<JsonRecord> {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as JsonRecord;
  } catch {
    return { data: text };
  }
}

export async function forwardJson(req: Request, endpoint: string, init?: { method?: HttpMethod; body?: unknown }) {
  const method = init?.method || req.method;
  const hasBody = init?.body !== undefined;
  try {
    const res = await fetch(backendUrl(endpoint), {
      method,
      headers: jsonHeaders(req),
      body: hasBody ? JSON.stringify(init.body) : ["GET", "HEAD"].includes(method) ? undefined : await req.text(),
    });
    const text = await res.text();

    if (!res.ok && res.status >= 500) {
      return Response.json({
        success: false,
        message: "Data tidak ditemukan di server backend.",
        data: null,
      }, { status: 404 });
    }

    return new Response(text, {
      status: res.status,
      statusText: res.statusText,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch {
    return Response.json({
      success: false,
      message: "Gagal menghubungi server backend.",
      data: null,
    }, { status: 404 });
  }
}

export function successJson(message: string, data: unknown = [], meta: JsonRecord = {}) {
  return Response.json({ success: true, message, data, meta });
}

