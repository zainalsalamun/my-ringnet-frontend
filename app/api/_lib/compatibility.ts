import { API_PREFIX } from "./constants";
import { backendUrl, forwardJson, getPagination, jsonHeaders, listBody, readJson, readJsonResponse, successJson } from "./http";
import { mapDekadataBroadbandInvoice, mapDekadataBroadbandPayment, mapDekadataRecord, normalizeListPayload } from "./normalizers";
import type { HttpMethod, JsonRecord, RowMapper } from "./types";

const LIST_ENDPOINTS: Record<string, string> = {
  [`${API_PREFIX}/admin/list`]: "admin/list",
  [`${API_PREFIX}/customer/list`]: "customer/list",
  [`${API_PREFIX}/customer-partner/list`]: "customer-partner/list",
  [`${API_PREFIX}/partner/list`]: "partner/list",
  [`${API_PREFIX}/location-point/list`]: "location-point/list",
};

const SIMPLE_LIST_ROUTES: Record<string, { endpoint: string; mapper?: RowMapper }> = {
  [`${API_PREFIX}/customers`]: { endpoint: "customer/list" },
  [`${API_PREFIX}/companies`]: { endpoint: "partner/list" },
  [`${API_PREFIX}/partners`]: { endpoint: "partner/list" },
  [`${API_PREFIX}/pops`]: { endpoint: "location-point/list" },
  [`${API_PREFIX}/internet-services`]: { endpoint: "broadband/list", mapper: mapDekadataBroadbandInvoice },
  [`${API_PREFIX}/finance`]: { endpoint: "broadband/list", mapper: mapDekadataBroadbandPayment },
};

async function postBackendList(req: Request, endpoint: string, body: JsonRecord, mapper: RowMapper = mapDekadataRecord) {
  const pageSize = Number(body.pageSize || 100);
  const pageIndex = Number(body.pageIndex || 0);
  const res = await fetch(backendUrl(endpoint), {
    method: "POST",
    headers: jsonHeaders(req),
    body: JSON.stringify(listBody({ ...body, pageSize, pageIndex })),
  });
  const payload = await readJsonResponse(res);

  return Response.json(normalizeListPayload(payload, pageSize, pageIndex, res.ok, mapper), { status: res.status });
}

async function getListViaPost(req: Request, endpoint: string, url: URL, mapper: RowMapper = mapDekadataRecord) {
  const { pageSize, pageIndex } = getPagination(url);
  const search = url.searchParams.get("search") || url.searchParams.get("globalFilter") || "";

  return postBackendList(req, endpoint, listBody({ pageSize, pageIndex, globalFilter: search }), mapper);
}

async function findListItem(req: Request, endpoint: string, id: string, mapper: RowMapper) {
  const res = await fetch(backendUrl(endpoint), {
    method: "POST",
    headers: jsonHeaders(req),
    body: JSON.stringify(listBody({ pageSize: 5000, pageIndex: 0 })),
  });
  const payload = await readJsonResponse(res);
  const rows = normalizeListPayload(payload, 5000, 0, res.ok, mapper).data;
  const found = rows.find((row) =>
    String(row.id) === id ||
    String(row.noInvoice || "") === id ||
    String(row.noFaktur || "") === id ||
    String(row.referenceNo || "") === id
  );

  return Response.json({
    success: Boolean(found),
    message: found ? "Data berhasil dimuat" : "Data tidak ditemukan",
    data: found || null,
  }, { status: found ? 200 : 404 });
}

function withSelectedId(body: JsonRecord, key: string, id?: string) {
  return id ? { ...body, [key]: id } : body;
}

async function handleListCompatibility(req: Request, path: string, method: HttpMethod, url: URL) {
  if (method === "POST" && LIST_ENDPOINTS[path]) {
    return postBackendList(req, LIST_ENDPOINTS[path], await readJson(req));
  }

  const simple = SIMPLE_LIST_ROUTES[path];
  if (method === "GET" && simple) {
    return getListViaPost(req, simple.endpoint, url, simple.mapper);
  }

  if (method === "GET" && path === `${API_PREFIX}/users`) {
    const role = url.searchParams.get("role") || "";
    if (role === "pelanggan") return getListViaPost(req, "customer/list", url);
    if (role === "bisnis" || role === "mitra") return getListViaPost(req, "partner/list", url);
    return getListViaPost(req, "admin/list", url);
  }

  return null;
}

async function handleDashboardCompatibility(req: Request, path: string, method: HttpMethod, url: URL) {
  if (method === "GET" && path === `${API_PREFIX}/dashboard/notifications`) {
    return successJson("Notifikasi belum tersedia dari API Dekadata.", [], { total: 0, unread: 0 });
  }

  if (method === "POST" && path.startsWith(`${API_PREFIX}/dashboard/notifications`)) {
    return successJson("Status notifikasi disimpan lokal.");
  }

  if (method === "GET" && path === `${API_PREFIX}/dashboard/summary`) {
    const customerRes = await getListViaPost(req, "customer/list", url);
    const customerPayload = await customerRes.json();

    return successJson("Ringkasan dashboard Dekadata berhasil dimuat.", {
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
    });
  }

  return null;
}

async function handleDetailCompatibility(req: Request, path: string, method: HttpMethod) {
  const customer = path.match(new RegExp(`^${API_PREFIX}/customers/([^/]+)$`));
  if (customer) {
    if (method === "GET") return forwardJson(req, `customer/read/${customer[1]}`, { method: "GET" });
    if (method === "DELETE") return forwardJson(req, `customer/delete/${customer[1]}`, { method: "DELETE" });
    if (method === "PUT" || method === "PATCH") return forwardJson(req, "customer/update", { method: "PATCH", body: withSelectedId(await readJson(req), "selectedCustomerId", customer[1]) });
  }

  const company = path.match(new RegExp(`^${API_PREFIX}/companies/([^/]+)$`));
  if (company) {
    if (method === "GET") return forwardJson(req, `partner/read/${company[1]}`, { method: "GET" });
    if (method === "DELETE") return forwardJson(req, `partner/delete/${company[1]}`, { method: "DELETE" });
    if (method === "PUT" || method === "PATCH") return forwardJson(req, "partner/update", { method: "PATCH", body: withSelectedId(await readJson(req), "selectedCustomerId", company[1]) });
  }

  const partner = path.match(new RegExp(`^${API_PREFIX}/partners/([^/]+)$`));
  if (partner) {
    if (method === "GET") return forwardJson(req, `partner/read/${partner[1]}`, { method: "GET" });
    if (method === "DELETE") return forwardJson(req, `partner/delete/${partner[1]}`, { method: "DELETE" });
    if (method === "PUT" || method === "PATCH") return forwardJson(req, "partner/update", { method: "PATCH", body: withSelectedId(await readJson(req), "selectedCustomerId", partner[1]) });
  }

  const user = path.match(new RegExp(`^${API_PREFIX}/users/([^/]+)$`));
  if (user) {
    if (method === "GET") return forwardJson(req, `admin/read/${user[1]}`, { method: "GET" });
    if (method === "DELETE") return forwardJson(req, `admin/delete/${user[1]}`, { method: "DELETE" });
    if (method === "PUT" || method === "PATCH") return forwardJson(req, "admin/update", { method: "PATCH", body: withSelectedId(await readJson(req), "selectedAdminId", user[1]) });
  }

  const pop = path.match(new RegExp(`^${API_PREFIX}/pops/([^/]+)$`));
  if (pop) {
    if (method === "GET") return forwardJson(req, `location-point/report/${pop[1]}`, { method: "GET" });
    if (method === "DELETE") return forwardJson(req, `location-point/delete/${pop[1]}`, { method: "DELETE" });
  }

  const invoice = path.match(new RegExp(`^${API_PREFIX}/internet-services/([^/]+)$`));
  if (invoice && method === "GET") return findListItem(req, "broadband/list", invoice[1], mapDekadataBroadbandInvoice);

  const payment = path.match(new RegExp(`^${API_PREFIX}/finance/([^/]+)$`));
  if (payment && method === "GET") return findListItem(req, "broadband/list", payment[1], mapDekadataBroadbandPayment);

  return null;
}

async function handleMutationCompatibility(req: Request, path: string, method: HttpMethod) {
  if (method === "POST" && path === `${API_PREFIX}/customers`) return forwardJson(req, "customer/create", { method: "POST", body: await readJson(req) });
  if (method === "POST" && path === `${API_PREFIX}/companies`) return forwardJson(req, "partner/create", { method: "POST", body: await readJson(req) });
  if (method === "POST" && path === `${API_PREFIX}/partners`) return forwardJson(req, "partner/create", { method: "POST", body: await readJson(req) });
  if (method === "POST" && path === `${API_PREFIX}/users`) return forwardJson(req, "admin/create", { method: "POST", body: await readJson(req) });
  if (method === "POST" && path === `${API_PREFIX}/pops`) return forwardJson(req, "location-point/create", { method: "POST", body: await readJson(req) });

  return null;
}

export async function handleCompatibility(req: Request, pathParts: string[]) {
  const url = new URL(req.url);
  const path = pathParts.join("/");
  const method = req.method.toUpperCase() as HttpMethod;

  return (
    await handleListCompatibility(req, path, method, url) ||
    await handleDashboardCompatibility(req, path, method, url) ||
    await handleDetailCompatibility(req, path, method) ||
    await handleMutationCompatibility(req, path, method)
  );
}

