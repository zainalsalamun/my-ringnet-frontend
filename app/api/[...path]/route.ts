const TARGET_BACKEND = (process.env.BACKEND_API_URL || "https://dev-srv.dekadata.net").replace(/\/+$/, "");

type JsonRecord = Record<string, unknown>;

function getBearerToken(req: Request): Record<string, string> {
  const authorization = req.headers.get("authorization");
  return authorization ? { Authorization: authorization } : {};
}

function getPagination(url: URL) {
  const pageSize = Number(url.searchParams.get("limit") || url.searchParams.get("pageSize") || 100);
  const page = Number(url.searchParams.get("page") || 1);
  const pageIndex = Math.max(0, Number(url.searchParams.get("pageIndex") || page - 1));
  return {
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 100,
    pageIndex: Number.isFinite(pageIndex) && pageIndex >= 0 ? pageIndex : 0,
  };
}

function mapDekadataRecord(row: Record<string, unknown>) {
  const rawId = row.admin_id || row.customer_id || row.partner_id || row.maps_id || row._id || row.id || "";
  const rawStatus = row.status;
  return {
    ...row,
    id: String(rawId),
    adminId: row.admin_id,
    customerCode: row.customer_id,
    partnerCode: row.partner_id,
    companyCode: row.partner_id || row.customer_id,
    popCode: row.maps_id || row.code,
    name: row.name || row.user || row.username || "-",
    email: row.email || "",
    phone: row.phone || "",
    city: row.city || "",
    area: row.area || row.group || "",
    address: row.address || "",
    coordinate: row.coordinate || "",
    role: row.role || row.position || (row.super ? "super_admin" : "admin"),
    customerType: row.type,
    partnerType: row.type,
    status: typeof rawStatus === "boolean" ? (rawStatus ? "active" : "nonactive") : rawStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLogin: row.last_login,
    lastActivity: row.last_act || row.updated_at || row.created_at,
  };
}

function normalizeListPayload(payload: JsonRecord, pageSize: number, pageIndex: number, ok: boolean) {
  const rawRows = Array.isArray(payload.list)
    ? payload.list
    : Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.rows)
        ? payload.rows
        : [];
  const rows = rawRows.map((item) => mapDekadataRecord(item as JsonRecord));
  return {
    success: ok,
    message: ok ? "Data berhasil dimuat" : String(payload.message || "Gagal memuat data"),
    data: rows,
    meta: {
      total: Number(payload.totalDocs || payload.total || rows.length),
      page: pageIndex + 1,
      limit: pageSize,
      totalPage: payload.totalPage,
    },
  };
}

async function fetchDekadataList(req: Request, endpoint: string, url: URL) {
  const { pageSize, pageIndex } = getPagination(url);
  const search = url.searchParams.get("search") || url.searchParams.get("globalFilter") || "";
  const backendRes = await fetch(`${TARGET_BACKEND}/api/v1/${endpoint}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...getBearerToken(req),
    },
    body: JSON.stringify({
      sorting: [],
      globalFilter: search,
      columnVisibility: {},
      pageSize,
      pageIndex,
      columnFilters: [],
      withDeleted: false,
    }),
  });
  const payload = await backendRes.json();
  return Response.json(normalizeListPayload(payload, pageSize, pageIndex, backendRes.ok), { status: backendRes.status });
}

async function forwardJson(req: Request, endpoint: string, init?: { method?: string; body?: unknown }) {
  const hasBody = init?.body !== undefined;
  const backendRes = await fetch(`${TARGET_BACKEND}/api/v1/${endpoint.replace(/^\/+/, "")}`, {
    method: init?.method || req.method,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...getBearerToken(req),
    },
    body: hasBody ? JSON.stringify(init.body) : ["GET", "HEAD"].includes(init?.method || req.method) ? undefined : await req.text(),
  });
  const text = await backendRes.text();
  return new Response(text, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: { "Content-Type": backendRes.headers.get("content-type") || "application/json" },
  });
}

async function readJson(req: Request) {
  const text = await req.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as JsonRecord;
  } catch {
    return {};
  }
}

function withSelectedId(body: JsonRecord, key: string, id?: string) {
  return id ? { ...body, [key]: id } : body;
}

async function handleCompatibility(req: Request, pathParts: string[]) {
  const url = new URL(req.url);
  const path = pathParts.join("/");
  const method = req.method.toUpperCase();

  const listEndpoints: Record<string, string> = {
    "api/v1/admin/list": "admin/list",
    "api/v1/customer/list": "customer/list",
    "api/v1/customer-partner/list": "customer-partner/list",
    "api/v1/partner/list": "partner/list",
    "api/v1/location-point/list": "location-point/list",
  };

  if (method === "POST" && listEndpoints[path]) {
    const body = await readJson(req);
    const pageSize = Number(body.pageSize || 100);
    const pageIndex = Number(body.pageIndex || 0);
    const backendRes = await fetch(`${TARGET_BACKEND}/api/v1/${listEndpoints[path]}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        ...getBearerToken(req),
      },
      body: JSON.stringify({
        sorting: [],
        globalFilter: "",
        columnVisibility: {},
        columnFilters: [],
        withDeleted: false,
        ...body,
        pageSize,
        pageIndex,
      }),
    });
    const payload = await backendRes.json();
    return Response.json(normalizeListPayload(payload, pageSize, pageIndex, backendRes.ok), { status: backendRes.status });
  }

  if (method === "GET" && path === "api/v1/dashboard/notifications") {
    return Response.json({
      success: true,
      message: "Notifikasi belum tersedia dari API Dekadata.",
      data: [],
      meta: { total: 0, unread: 0 },
    });
  }

  if (method === "POST" && path.startsWith("api/v1/dashboard/notifications")) {
    return Response.json({ success: true, message: "Status notifikasi disimpan lokal." });
  }

  if (method === "GET" && path === "api/v1/dashboard/summary") {
    const customerRes = await fetchDekadataList(req, "customer/list", url);
    const customerPayload = await customerRes.json();
    return Response.json({
      success: true,
      message: "Ringkasan dashboard Dekadata berhasil dimuat.",
      data: {
        totalPelanggan: customerPayload.meta?.total || 0,
        totalInvoice: 0,
        pendapatan: 0,
        tunggakan: 0,
        revenue: [],
        invoiceStatus: [
          { name: "Lunas", value: 0, color: "#22c55e" },
          { name: "Belum Lunas", value: 0, color: "#f59e0b" },
          { name: "Terlambat", value: 0, color: "#ef4444" },
        ],
        popularPackages: [],
        recentActivities: [],
        dailyUsage: [],
      },
    });
  }

  if (method === "GET" && path === "api/v1/customers") return fetchDekadataList(req, "customer/list", url);
  if (method === "GET" && path === "api/v1/companies") return fetchDekadataList(req, "partner/list", url);
  if (method === "GET" && path === "api/v1/partners") return fetchDekadataList(req, "partner/list", url);

  if (method === "GET" && path === "api/v1/users") {
    const role = url.searchParams.get("role") || "";
    if (role === "pelanggan") return fetchDekadataList(req, "customer/list", url);
    if (role === "bisnis" || role === "mitra") return fetchDekadataList(req, "partner/list", url);
    return fetchDekadataList(req, "admin/list", url);
  }

  const customerDetail = path.match(/^api\/v1\/customers\/([^/]+)$/);
  if (method === "GET" && customerDetail) return forwardJson(req, `customer/read/${customerDetail[1]}`, { method: "GET" });
  if (method === "DELETE" && customerDetail) return forwardJson(req, `customer/delete/${customerDetail[1]}`, { method: "DELETE" });
  if ((method === "PUT" || method === "PATCH") && customerDetail) return forwardJson(req, "customer/update", { method: "PATCH", body: withSelectedId(await readJson(req), "selectedCustomerId", customerDetail[1]) });
  if (method === "POST" && path === "api/v1/customers") return forwardJson(req, "customer/create", { method: "POST", body: await readJson(req) });

  const companyDetail = path.match(/^api\/v1\/companies\/([^/]+)$/);
  if (method === "GET" && companyDetail) return forwardJson(req, `partner/read/${companyDetail[1]}`, { method: "GET" });
  if (method === "DELETE" && companyDetail) return forwardJson(req, `partner/delete/${companyDetail[1]}`, { method: "DELETE" });
  if ((method === "PUT" || method === "PATCH") && companyDetail) return forwardJson(req, "partner/update", { method: "PATCH", body: withSelectedId(await readJson(req), "selectedCustomerId", companyDetail[1]) });
  if (method === "POST" && path === "api/v1/companies") return forwardJson(req, "partner/create", { method: "POST", body: await readJson(req) });

  const partnerDetail = path.match(/^api\/v1\/partners\/([^/]+)$/);
  if (method === "GET" && partnerDetail) return forwardJson(req, `partner/read/${partnerDetail[1]}`, { method: "GET" });
  if (method === "DELETE" && partnerDetail) return forwardJson(req, `partner/delete/${partnerDetail[1]}`, { method: "DELETE" });
  if ((method === "PUT" || method === "PATCH") && partnerDetail) return forwardJson(req, "partner/update", { method: "PATCH", body: withSelectedId(await readJson(req), "selectedCustomerId", partnerDetail[1]) });
  if (method === "POST" && path === "api/v1/partners") return forwardJson(req, "partner/create", { method: "POST", body: await readJson(req) });

  const userDetail = path.match(/^api\/v1\/users\/([^/]+)$/);
  if (method === "GET" && userDetail) return forwardJson(req, `admin/read/${userDetail[1]}`, { method: "GET" });
  if (method === "DELETE" && userDetail) return forwardJson(req, `admin/delete/${userDetail[1]}`, { method: "DELETE" });
  if ((method === "PUT" || method === "PATCH") && userDetail) return forwardJson(req, "admin/update", { method: "PATCH", body: withSelectedId(await readJson(req), "selectedAdminId", userDetail[1]) });
  if (method === "POST" && path === "api/v1/users") return forwardJson(req, "admin/create", { method: "POST", body: await readJson(req) });

  const popDetail = path.match(/^api\/v1\/pops\/([^/]+)$/);
  if (method === "GET" && popDetail) return forwardJson(req, `location-point/report/${popDetail[1]}`, { method: "GET" });
  if (method === "DELETE" && popDetail) return forwardJson(req, `location-point/delete/${popDetail[1]}`, { method: "DELETE" });
  if (method === "GET" && path === "api/v1/pops") return fetchDekadataList(req, "location-point/list", url);
  if (method === "POST" && path === "api/v1/pops") return forwardJson(req, "location-point/create", { method: "POST", body: await readJson(req) });

  return null;
}

async function handleProxy(req: Request, pathParts: string[]) {
  const url = new URL(req.url);
  const compatibilityResponse = await handleCompatibility(req, pathParts);
  if (compatibilityResponse) return compatibilityResponse;

  const targetPath = "/" + pathParts.join("/");
  const targetUrl = `${TARGET_BACKEND}${targetPath}${url.search}`;

  // Bersihkan header origin dan referer agar backend tidak menolak request
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "Origin": TARGET_BACKEND,
    "Referer": `${TARGET_BACKEND}/`,
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  req.headers.forEach((val, key) => {
    const lowerKey = key.toLowerCase();
    if (!["host", "connection", "content-length", "origin", "referer", "user-agent"].includes(lowerKey)) {
      headers[key] = val;
    }
  });

  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers["content-type"] = contentType;
  }

  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.text();

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const resContentType = backendRes.headers.get("content-type") || "application/json";
    const resData = await backendRes.text();

    return new Response(resData, {
      status: backendRes.status,
      statusText: backendRes.statusText,
      headers: {
        "Content-Type": resContentType,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({
        success: false,
        message: `Gagal menghubungi backend ${targetUrl}: ${message}`,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, ["api", ...path]);
}

export async function POST(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, ["api", ...path]);
}

export async function PUT(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, ["api", ...path]);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, ["api", ...path]);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, ["api", ...path]);
}
