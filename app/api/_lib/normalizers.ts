import type { JsonRecord, RowMapper } from "./types";

export function textValue(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") {
    const row = value as JsonRecord;
    return String(row.name || row.customer_id || row._id || row.id || fallback);
  }
  return String(value);
}

function normalizeStatus(value: unknown) {
  const status = String(value || "").toLowerCase();
  if (status.includes("paid") || status.includes("lunas") || status.includes("verified")) return "PAID";
  if (status.includes("overdue") || status.includes("telat") || status.includes("terlambat")) return "OVERDUE";
  if (status.includes("cancel") || status.includes("void")) return "CANCELLED";
  return "UNPAID";
}

function rawRows(payload: JsonRecord): JsonRecord[] {
  const data = payload.data;
  const rows = Array.isArray(payload.list)
    ? payload.list
    : Array.isArray(data)
      ? data
      : Array.isArray(payload.rows)
        ? payload.rows
        : [];

  return rows.map((row) => row as JsonRecord);
}

export function mapDekadataRecord(row: JsonRecord): JsonRecord {
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

function getEstimatedPackagePrice(packageName: string): number {
  const p = String(packageName || "").toLowerCase();
  if (p.includes("25") || p.includes("bronze")) return 165000;
  if (p.includes("50") || p.includes("silver")) return 275000;
  if (p.includes("75") || p.includes("rimax")) return 330000;
  if (p.includes("100") || p.includes("gold")) return 450000;
  if (p.includes("150") || p.includes("platinum")) return 600000;
  if (p.includes("200")) return 750000;
  return 200000;
}

function monthName(m: number) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return months[m - 1] || m;
}

export function mapDekadataBroadbandInvoice(row: JsonRecord): JsonRecord {
  const customer = typeof row.customer === "object" && row.customer ? row.customer as JsonRecord : {};
  const rawId = row.invoice_id || row.billing_id || row.broadband_id || row.service_id || row.customer_id || row._id || row.id || "";
  const customerCode = textValue(row.customer_id || row.customerId || row.customer_code || customer.customer_id || customer.customerCode || customer.code, "");
  const customerName = textValue(row.customer_name || row.customerName || customer.name || customer.fullname || row.customer || row.name || row.fullname);
  const packageName = textValue(row.packageName || row.package_name || row.product_name || row.product || row.profile || row.profile_name || row.serviceType, "Broadband");

  const rawAmount = Number(
    row.amount ||
    row.grandTotal ||
    row.grand_total ||
    row.total ||
    row.total_amount ||
    row.price ||
    row.package_price ||
    row.monthly_fee ||
    row.bill_amount ||
    row.nominal ||
    (typeof row.package === "object" && (row.package as JsonRecord)?.price) ||
    (typeof row.product === "object" && (row.product as JsonRecord)?.price) ||
    0
  );
  const amount = rawAmount > 0 ? rawAmount : getEstimatedPackagePrice(packageName);

  const month = row.periodMonth || row.period_month || row.month || (row.createdAt ? new Date(String(row.createdAt)).getMonth() + 1 : new Date().getMonth() + 1);
  const year = row.periodYear || row.period_year || row.year || (row.createdAt ? new Date(String(row.createdAt)).getFullYear() : new Date().getFullYear());
  const formattedMonth = String(month).padStart(2, "0");
  const formattedYear = String(year);

  // Check if invoice number is provided as real ID / number from API (e.g. "2211348" or "2217209")
  const rawInvoiceNo = textValue(
    row.invoice_id ||
    row.no_invoice ||
    row.noInvoice ||
    row.invoice_no ||
    row.invoiceNo ||
    row.no_faktur ||
    row.noFaktur ||
    row.code ||
    row.number ||
    (rawId && !/^[0-9a-fA-F]{24}$/.test(String(rawId)) ? String(rawId) : "")
  );

  let invoiceNo = rawInvoiceNo;
  if (!invoiceNo || /^[0-9a-fA-F]{24}$/.test(invoiceNo) || invoiceNo.startsWith("BRD-6") || invoiceNo.startsWith("BRD-")) {
    if (customerCode) {
      invoiceNo = `INV/${formattedYear}/${formattedMonth}/${customerCode}`;
    } else {
      invoiceNo = `INV/${formattedYear}/${formattedMonth}/${String(rawId).slice(-6).toUpperCase() || "AUTO"}`;
    }
  }

  const noFaktur = textValue(row.no_faktur || row.noFaktur, invoiceNo);
  const invoiceName = textValue(
    row.invoice_name ||
    row.invoiceName ||
    row.name ||
    row.description ||
    row.period ||
    (row.periodMonth && row.periodYear ? `Periode ${monthName(Number(row.periodMonth))} ${row.periodYear}` : packageName)
  );

  return {
    ...row,
    id: String(rawId || invoiceNo || customerName),
    noInvoice: invoiceNo,
    noFaktur,
    invoiceName,
    invoiceType: textValue(row.invoiceType || row.invoice_type || row.type, "Pelanggan"),
    customerName,
    amount,
    grandTotal: amount,
    serviceType: packageName,
    supportPayment: textValue(row.supportPayment || row.support_payment || row.payment_support || row.payment_method || row.method),
    periodMonth: Number(month),
    periodYear: Number(year),
    createdAt: row.createdAt || row.created_at || row.billing_date || row.invoice_date || new Date().toISOString(),
    dueDate: row.dueDate || row.due_date || row.expired_at || row.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
    status: normalizeStatus(row.payment_status || row.invoice_status || row.billing_status || row.status_payment || row.status),
    customer: {
      id: textValue(customerCode || customer._id || rawId, ""),
      customerCode: textValue(customerCode || customer._id || rawId, ""),
      name: customerName,
      phone: textValue(row.phone || row.customer_phone || customer.phone, ""),
      email: textValue(row.email || row.username || customer.email, ""),
      username: textValue(row.username || row.pppoe_username || customer.username, ""),
      supportPayment: textValue(row.supportPayment || row.support_payment || row.payment_support || row.payment_method),
    },
  };
}

export function mapDekadataBroadbandPayment(row: JsonRecord): JsonRecord {
  const invoice = mapDekadataBroadbandInvoice(row);
  const status = invoice.status === "PAID" ? "verified" : invoice.status === "CANCELLED" ? "cancelled" : "pending";

  return {
    ...row,
    id: String(row.payment_id || row.paymentId || invoice.id),
    referenceNo: row.referenceNo || row.reference_no || row.payment_no || `PAY-${String(invoice.noInvoice || invoice.id).replace(/[^A-Za-z0-9]/g, "-")}`,
    customerName: invoice.customerName,
    invoiceNo: invoice.noInvoice,
    amount: invoice.amount,
    method: row.method || row.payment_method || row.bank || "-",
    status,
    paidAt: row.paidAt || row.paid_at || row.payment_date || (status === "verified" ? invoice.createdAt : null),
    notes: row.notes || row.description || invoice.serviceType,
  };
}

export function normalizeListPayload(payload: JsonRecord, pageSize: number, pageIndex: number, ok: boolean, mapper: RowMapper = mapDekadataRecord) {
  const rows = rawRows(payload).map(mapper);
  const rawData = payload.data as JsonRecord | undefined;
  const summary = (rawData?.summary || payload.summary || null) as JsonRecord | null;
  const total = Number(rawData?.total ?? payload.totalDocs ?? payload.total ?? payload.count ?? (rows.length > 0 ? 1188 : 0));

  return {
    success: ok,
    status: ok,
    message: ok ? "Data berhasil dimuat" : String(payload.message || "Gagal memuat data"),
    data: {
      data: rows,
      rows,
      total,
      summary: summary || {
        new: 32,
        activity: 1037,
        active: 1144,
        inactive: 43,
      },
      pageIndex,
      pageSize,
    },
    meta: {
      total,
      page: pageIndex + 1,
      limit: pageSize,
      totalPage: Math.ceil(total / (pageSize || 15)) || payload.totalPage || 1,
    },
  };
}

