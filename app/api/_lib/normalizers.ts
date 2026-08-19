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

export function mapDekadataBroadbandInvoice(row: JsonRecord): JsonRecord {
  const customer = typeof row.customer === "object" && row.customer ? row.customer as JsonRecord : {};
  const rawId = row.invoice_id || row.billing_id || row.broadband_id || row.service_id || row.customer_id || row._id || row.id || "";
  const invoiceNo = textValue(row.no_invoice || row.noInvoice || row.invoice_no || row.invoiceNo || row.no_faktur || row.noFaktur || (rawId ? `BRD-${rawId}` : ""));
  const amount = Number(row.amount || row.grandTotal || row.grand_total || row.total || row.price || row.package_price || row.monthly_fee || row.bill_amount || 0) || 0;
  const customerName = textValue(row.customerName || row.customer_name || customer.name || row.customer || row.name || row.fullname);
  const packageName = textValue(row.packageName || row.package_name || row.product_name || row.product || row.profile || row.profile_name || row.serviceType, "Broadband");

  return {
    ...row,
    id: String(rawId || invoiceNo || customerName),
    noInvoice: invoiceNo,
    noFaktur: textValue(row.no_faktur || row.noFaktur || invoiceNo),
    invoiceName: textValue(row.invoiceName || row.invoice_name || packageName),
    invoiceType: textValue(row.invoiceType || row.invoice_type, "Pelanggan"),
    customerName,
    amount,
    grandTotal: amount,
    serviceType: packageName,
    supportPayment: textValue(row.supportPayment || row.support_payment || row.payment_support),
    periodMonth: row.periodMonth || row.period_month || row.month,
    periodYear: row.periodYear || row.period_year || row.year,
    createdAt: row.createdAt || row.created_at || row.billing_date || row.invoice_date,
    dueDate: row.dueDate || row.due_date || row.expired_at || row.deadline,
    status: normalizeStatus(row.payment_status || row.invoice_status || row.billing_status || row.status_payment || row.status),
    customer: {
      id: textValue(row.customer_id || row.customerId || customer.customer_id || customer._id || rawId, ""),
      customerCode: textValue(row.customer_id || row.customerCode || customer.customer_id, ""),
      name: customerName,
      phone: textValue(row.phone || row.customer_phone || customer.phone, ""),
      email: textValue(row.email || row.username || customer.email, ""),
      username: textValue(row.username || row.pppoe_username || customer.username, ""),
      supportPayment: textValue(row.supportPayment || row.support_payment),
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

