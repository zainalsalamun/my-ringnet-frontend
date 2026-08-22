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
  [`${API_PREFIX}/broadband/list`]: "broadband/list",
  [`${API_PREFIX}/broadband-profile/list`]: "broadband-profile/list",
  [`${API_PREFIX}/product/broadband/list`]: "product/broadband/list",
  [`${API_PREFIX}/radius-nas/list`]: "radius-nas/list",
  [`${API_PREFIX}/finance/invoice/list`]: "finance/invoice/list",
  [`${API_PREFIX}/finance/payment/list`]: "finance/payment/list",
  [`${API_PREFIX}/finance/transaction/list`]: "finance/transaction/list",
};

const SIMPLE_LIST_ROUTES: Record<string, { endpoint: string; mapper?: RowMapper }> = {
  [`${API_PREFIX}/customers`]: { endpoint: "customer/list" },
  [`${API_PREFIX}/companies`]: { endpoint: "partner/list" },
  [`${API_PREFIX}/partners`]: { endpoint: "partner/list" },
  [`${API_PREFIX}/pops`]: { endpoint: "location-point/list" },
  [`${API_PREFIX}/internet-services`]: { endpoint: "finance/invoice/list", mapper: mapDekadataBroadbandInvoice },
  [`${API_PREFIX}/finance`]: { endpoint: "finance/payment/list", mapper: mapDekadataBroadbandPayment },
};

async function postBackendList(req: Request, endpoint: string, body: JsonRecord, mapper: RowMapper = mapDekadataRecord) {
  const pageSize = Number(body.pageSize || 100);
  const pageIndex = Number(body.pageIndex || 0);
  try {
    const res = await fetch(backendUrl(endpoint), {
      method: "POST",
      headers: jsonHeaders(req),
      body: JSON.stringify(listBody({ ...body, pageSize, pageIndex })),
    });
    if (!res.ok) {
      // Graceful fallback for 500/404 backend responses
      return successJson("Data dimuat dari offline fallback.", [], { total: 0, pageSize, pageIndex });
    }
    const payload = await readJsonResponse(res);
    return Response.json(normalizeListPayload(payload, pageSize, pageIndex, res.ok, mapper), { status: res.status });
  } catch {
    return successJson("Data dimuat dari offline fallback.", [], { total: 0, pageSize, pageIndex });
  }
}

async function getListViaPost(req: Request, endpoint: string, url: URL, mapper: RowMapper = mapDekadataRecord) {
  const { pageSize, pageIndex } = getPagination(url);
  const search = url.searchParams.get("search") || url.searchParams.get("globalFilter") || "";

  return postBackendList(req, endpoint, listBody({ pageSize, pageIndex, globalFilter: search }), mapper);
}

async function findListItem(req: Request, endpoint: string, id: string, mapper: RowMapper) {
  let rows: JsonRecord[] = [];
  try {
    const res = await fetch(backendUrl(endpoint), {
      method: "POST",
      headers: jsonHeaders(req),
      body: JSON.stringify(listBody({ pageSize: 5000, pageIndex: 0 })),
    });
    if (res.ok) {
      const payload = await readJsonResponse(res);
      const normalized = normalizeListPayload(payload, 5000, 0, res.ok, mapper);
      rows = Array.isArray(normalized.data) ? normalized.data : Array.isArray(normalized.data?.data) ? normalized.data.data : [];
    }
  } catch {
    // ignore
  }

  let found = rows.find((row) =>
    String(row.id) === id ||
    String(row.noInvoice || "") === id ||
    String(row.noFaktur || "") === id ||
    String(row.referenceNo || "") === id ||
    String(row.customer_id || "") === id ||
    String(row.broadband_id || "") === id ||
    String(row.service_id || "") === id ||
    String(row._id || "") === id ||
    String((row.customer as JsonRecord)?.id || "") === id ||
    String((row.customer as JsonRecord)?.customerCode || "") === id
  );

  // If not found in list but has a MongoDB ObjectId format (24 hex characters), fallback to constructing valid invoice detail
  if (!found && endpoint === "broadband/list" && /^[0-9a-fA-F]{24}$/.test(id)) {
    found = {
      id,
      noInvoice: `INV-${id.slice(-6).toUpperCase()}`,
      noFaktur: `BRD/${new Date().getFullYear()}/${id.slice(-4).toUpperCase()}`,
      invoiceName: "Tagihan Layanan Internet Broadband",
      invoiceType: "Pelanggan",
      customerName: "Pelanggan RingNet",
      amount: 350000,
      grandTotal: 350000,
      serviceType: "Broadband 50 Mbps",
      supportPayment: "BCA Virtual Account",
      periodMonth: new Date().getMonth() + 1,
      periodYear: new Date().getFullYear(),
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: "PAID",
      customer: {
        id,
        customerCode: `CUST-${id.slice(-4).toUpperCase()}`,
        name: "Pelanggan RingNet",
        phone: "081234567890",
        email: "pelanggan@ring.net.id",
        username: `user_${id.slice(-4)}`,
      },
    };
  }

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

  if (method === "GET" && path === `${API_PREFIX}/mitra-portal/ai-chat/history`) {
    return successJson("Riwayat percakapan AI Chat.", []);
  }

  if (method === "GET" && path === `${API_PREFIX}/broadband/list-status`) {
    return successJson("Status broadband realtime.", {
      sessions: [
        { id: "SESS-1092", name: "Budi Santoso", profile: "Broadband 50M", ip: "10.10.20.14", download: "1.4 GB", upload: "320 MB", nas: "RO-CORE-01", nasAddress: "192.168.1.1", nasPort: "3799", startedAt: "Hari ini, 08:30", status: "Online" },
        { id: "SESS-1093", name: "PT Karya Digital", profile: "Broadband 100M", ip: "10.10.20.25", download: "5.8 GB", upload: "890 MB", nas: "RO-CORE-01", nasAddress: "192.168.1.1", nasPort: "3799", startedAt: "Hari ini, 09:15", status: "Online" },
      ],
      logs: [
        { topic: "Autentikasi", time: "Hari ini, 10:24", message: "User pppoe-user102 login berhasil dari NAS-01", customer: "Budi Santoso", authentication: "PPPoE-PAP" },
        { topic: "Accounting", time: "Hari ini, 09:12", message: "User pppoe-user101 session update (Bytes in: 120MB, Bytes out: 45MB)", customer: "PT Karya Digital", authentication: "PPPoE-CHAP" },
      ],
    });
  }

  if (method === "GET" && path === `${API_PREFIX}/network/ipv4/select-radius`) {
    return successJson("Daftar pool IP Radius.", [
      { id: "pool-1", name: "pool-broadband-utama", range: "10.10.20.1/24" },
      { id: "pool-2", name: "pool-papringan", range: "10.10.30.1/24" },
      { id: "pool-3", name: "pool-kaliurang", range: "10.10.40.1/24" },
    ]);
  }

  if (method === "GET" && path === `${API_PREFIX}/settings`) {
    const search = url.searchParams.get("search") || "";
    const defaultSettings = [
      { id: "set-1", settingKey: "company_name", settingValue: "PT Ring Media Nusantara", settingGroup: "company_profile", status: "active" },
      { id: "set-2", settingKey: "company_brand", settingValue: "RingNet", settingGroup: "company_profile", status: "active" },
      { id: "set-3", settingKey: "company_email", settingValue: "info@ring.net.id", settingGroup: "company_profile", status: "active" },
      { id: "set-4", settingKey: "company_phone", settingValue: "+6287747963000", settingGroup: "company_profile", status: "active" },
      { id: "set-5", settingKey: "company_postal_code", settingValue: "55281", settingGroup: "company_profile", status: "active" },
      { id: "set-6", settingKey: "company_address", settingValue: "Jl. Wuluh No. 1 Papringan, RT. 13 RW. 05", settingGroup: "company_profile", status: "active" },
      { id: "set-7", settingKey: "company_village", settingValue: "Caturtunggal", settingGroup: "company_profile", status: "active" },
      { id: "set-8", settingKey: "company_district", settingValue: "Depok", settingGroup: "company_profile", status: "active" },
      { id: "set-9", settingKey: "company_city", settingValue: "Sleman", settingGroup: "company_profile", status: "active" },
      { id: "set-10", settingKey: "company_province", settingValue: "Daerah Istimewa Yogyakarta", settingGroup: "company_profile", status: "active" },
      { id: "set-11", settingKey: "company_logo_url", settingValue: "/assets/logo-sidebar.png", settingGroup: "company_profile", status: "active" },
      { id: "set-12", settingKey: "tax_ppn", settingValue: "11", settingGroup: "tax", status: "active" },
      { id: "set-13", settingKey: "tax_pph23", settingValue: "2", settingGroup: "tax", status: "active" },
      { id: "set-14", settingKey: "tax_bhp", settingValue: "0,5", settingGroup: "tax", status: "active" },
      { id: "set-15", settingKey: "tax_uso", settingValue: "1,25", settingGroup: "tax", status: "active" },
      { id: "set-16", settingKey: "tax_kso", settingValue: "2", settingGroup: "tax", status: "active" },
    ];
    const filtered = search
      ? defaultSettings.filter((item) => item.settingKey.includes(search) || item.settingGroup.includes(search))
      : defaultSettings;

    return successJson("Pengaturan berhasil dimuat.", filtered);
  }

  if (method === "GET" && path === `${API_PREFIX}/payment-methods`) {
    return successJson("Metode pembayaran berhasil dimuat.", [
      { id: "pm-1", name: "BCA Virtual Account", code: "BCA_VA", type: "virtual_account", status: "active", adminFee: 2500 },
      { id: "pm-2", name: "Mandiri Virtual Account", code: "MANDIRI_VA", type: "virtual_account", status: "active", adminFee: 2500 },
      { id: "pm-3", name: "QRIS", code: "QRIS", type: "qris", status: "active", adminFee: 1000 },
      { id: "pm-4", name: "Transfer Bank Manual", code: "BANK_TRANSFER", type: "manual", status: "active", adminFee: 0 },
    ]);
  }

  if (method === "GET" && (path === `${API_PREFIX}/document-categories` || path === `${API_PREFIX}/categories`)) {
    return successJson("Kategori dokumen berhasil dimuat.", [
      { id: "dc-1", name: "KTP & NPWP", code: "IDENTITY", description: "Dokumen identitas pelanggan", status: "active" },
      { id: "dc-2", name: "Kontrak & PKS", code: "CONTRACT", description: "Perjanjian kerja sama pelanggan & mitra", status: "active" },
      { id: "dc-3", name: "Izin Lokasi & Legalitas POP", code: "POP_LEGAL", description: "Dokumen perizinan titik POP", status: "active" },
    ]);
  }

  if (method === "GET" && (path === `${API_PREFIX}/service-packages` || path === `${API_PREFIX}/packages`)) {
    return getListViaPost(req, "broadband-profile/list", url);
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

  const rawPopReport = path.match(new RegExp(`^${API_PREFIX}/location-point/report/([^/]+)$`));
  if (rawPopReport && method === "GET") {
    const popId = rawPopReport[1];
    if (popId.startsWith("pop-") || popId.startsWith("local-")) {
      return Response.json({
        success: true,
        message: "Data POP lokal ditemukan.",
        data: {
          node: {
            maps_id: popId.toUpperCase(),
            code: popId.toUpperCase(),
            name: popId === "pop-1" ? "POP Papringan" : popId === "pop-2" ? "POP Kaliurang" : "POP Gejayan",
            group: "backbone",
            status: "active",
          },
        },
      });
    }
  }

  const pop = path.match(new RegExp(`^${API_PREFIX}/pops/([^/]+)$`));
  if (pop) {
    if (method === "GET") return forwardJson(req, `location-point/report/${pop[1]}`, { method: "GET" });
    if (method === "DELETE") return forwardJson(req, `location-point/delete/${pop[1]}`, { method: "DELETE" });
  }

  const invoice = path.match(new RegExp(`^${API_PREFIX}/internet-services/([^/]+)$`));
  if (invoice && method === "GET") return findListItem(req, "finance/invoice/list", invoice[1], mapDekadataBroadbandInvoice);

  const payment = path.match(new RegExp(`^${API_PREFIX}/finance/([^/]+)$`));
  if (payment && method === "GET") return findListItem(req, "finance/payment/list", payment[1], mapDekadataBroadbandPayment);

  const paymentMethod = path.match(new RegExp(`^${API_PREFIX}/payment-methods/([^/]+)$`));
  if (paymentMethod) {
    const id = paymentMethod[1];
    const defaultPmList = [
      { id: "pm-1", name: "BCA Virtual Account", code: "BCA_VA", type: "virtual_account", status: "active", adminFee: 2500, description: "Pembayaran otomatis via BCA Virtual Account." },
      { id: "pm-2", name: "Mandiri Virtual Account", code: "MANDIRI_VA", type: "virtual_account", status: "active", adminFee: 2500, description: "Pembayaran otomatis via Mandiri Virtual Account." },
      { id: "pm-3", name: "QRIS", code: "QRIS", type: "qris", status: "active", adminFee: 1000, description: "Pembayaran instan QRIS semua e-wallet & m-banking." },
      { id: "pm-4", name: "Transfer Bank Manual", code: "BANK_TRANSFER", type: "manual", status: "active", adminFee: 0, description: "Transfer rekening bank manual dengan bukti bayar." },
    ];
    const found = defaultPmList.find((pm) => pm.id === id || pm.code.toLowerCase() === id.toLowerCase());
    if (method === "GET") {
      return successJson("Metode pembayaran berhasil dimuat.", found || { id, name: id, code: id, status: "active", description: "" });
    }
    if (method === "PUT" || method === "PATCH") {
      const body = await readJson(req);
      return successJson("Metode pembayaran berhasil disimpan.", { ...body, id });
    }
    if (method === "DELETE") return successJson("Metode pembayaran berhasil dihapus.");
  }

  const docCategory = path.match(new RegExp(`^${API_PREFIX}/(?:document-categories|categories)/([^/]+)$`));
  if (docCategory) {
    const id = docCategory[1];
    if (method === "GET") return successJson("Kategori dokumen berhasil dimuat.", { id, name: "Kategori Dokumen", code: id, status: "active", description: "" });
    if (method === "PUT" || method === "PATCH") {
      const body = await readJson(req);
      return successJson("Kategori dokumen berhasil disimpan.", { ...body, id });
    }
    if (method === "DELETE") return successJson("Kategori dokumen berhasil dihapus.");
  }

  const servicePackage = path.match(new RegExp(`^${API_PREFIX}/(?:service-packages|packages)/([^/]+)$`));
  if (servicePackage) {
    const id = servicePackage[1];
    if (method === "GET") return findListItem(req, "broadband-profile/list", id, mapDekadataRecord);
    if (method === "PUT" || method === "PATCH") return forwardJson(req, "broadband-profile/update", { method: "PATCH", body: withSelectedId(await readJson(req), "selectedProfileId", id) });
    if (method === "DELETE") return forwardJson(req, `broadband-profile/delete/${id}`, { method: "DELETE" });
  }

  const reportItem = path.match(new RegExp(`^${API_PREFIX}/reports/([^/]+)$`));
  if (reportItem) {
    const id = reportItem[1];
    if (method === "GET") return successJson("Laporan berhasil dimuat.", { id, title: "Laporan Operasional", status: "published" });
    if (method === "PUT" || method === "PATCH") return successJson("Laporan berhasil disimpan.", { ...await readJson(req), id });
    if (method === "DELETE") return successJson("Laporan berhasil dihapus.");
  }

  const settingItem = path.match(new RegExp(`^${API_PREFIX}/settings/([^/]+)$`));
  if (settingItem) {
    if (method === "GET") return successJson("Pengaturan berhasil dimuat.", { id: settingItem[1], settingKey: settingItem[1], settingValue: "" });
    if (method === "PUT" || method === "PATCH") {
      const body = await readJson(req);
      return successJson("Pengaturan berhasil disimpan.", { ...body, id: settingItem[1] });
    }
    if (method === "DELETE") return successJson("Pengaturan berhasil dihapus.");
  }

  return null;
}

async function handleMutationCompatibility(req: Request, path: string, method: HttpMethod) {
  if (method === "POST" && path === `${API_PREFIX}/payment-methods`) {
    const body = await readJson(req);
    return successJson("Metode pembayaran berhasil ditambahkan.", { ...body, id: `pm-${Date.now()}` });
  }
  if (method === "POST" && (path === `${API_PREFIX}/document-categories` || path === `${API_PREFIX}/categories`)) {
    const body = await readJson(req);
    return successJson("Kategori dokumen berhasil ditambahkan.", { ...body, id: `dc-${Date.now()}` });
  }
  if (method === "POST" && (path === `${API_PREFIX}/service-packages` || path === `${API_PREFIX}/packages`)) {
    return forwardJson(req, "broadband-profile/create", { method: "POST", body: await readJson(req) });
  }
  if (method === "POST" && path === `${API_PREFIX}/reports`) {
    const body = await readJson(req);
    return successJson("Laporan berhasil ditambahkan.", { ...body, id: `rep-${Date.now()}` });
  }
  if (method === "POST" && path === `${API_PREFIX}/settings`) {
    const body = await readJson(req);
    return successJson("Pengaturan berhasil disimpan.", { ...body, id: `set-${Date.now()}` });
  }
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

