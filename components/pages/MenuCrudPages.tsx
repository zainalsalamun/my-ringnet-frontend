"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { Badge, Card, DataTable, PageHeader, SelectInput, TableSkeleton, TextArea, TextInput } from "@/components/ui/AdminUI";
import { currency, date } from "@/lib/format";
import { formatErrorMessage } from "@/lib/error";
import { financeService, internetServiceService } from "@/services";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div>;
}

function toInputDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function parseRupiah(value: string) {
  return value.replace(/\D/g, "");
}

function formatRupiahInput(value: string) {
  const raw = parseRupiah(value);
  if (!raw) return "";
  return new Intl.NumberFormat("id-ID").format(Number(raw));
}

function paymentTimeValue(row: any) {
  const paidTime = row.paidAt ? new Date(row.paidAt).getTime() : 0;
  if (paidTime && !Number.isNaN(paidTime)) return paidTime;

  const periodText = String([row.invoiceNo, row.referenceNo].filter(Boolean).join(" "));
  const match = periodText.match(/[/-](0?[1-9]|1[0-2])[/-](20\d{2})/);
  if (match) return new Date(Number(match[2]), Number(match[1]) - 1, 1).getTime();

  const createdTime = row.createdAt ? new Date(row.createdAt).getTime() : 0;
  return Number.isNaN(createdTime) ? 0 : createdTime;
}

function sortPaymentsByLatest(rows: any[]) {
  return [...rows].sort((a, b) => {
    const timeDiff = paymentTimeValue(b) - paymentTimeValue(a);
    if (timeDiff !== 0) return timeDiff;
    return String(b.referenceNo || "").localeCompare(String(a.referenceNo || ""));
  });
}

function safeText(value: any, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return String(value.name || value.customer_id || value._id || value.id || fallback);
  return String(value);
}

export function FinanceCrudPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setToast("");
    financeService
      .getList()
      .then((data) => setRows(data))
      .catch((err) => setToast(formatErrorMessage(err, "Gagal memuat data transaksi pembayaran.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function remove(row: any) {
    try {
      await financeService.deletePayment(row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast("Pembayaran berhasil dihapus.");
    } catch (err: any) {
      setToast(formatErrorMessage(err, "Gagal menghapus pembayaran."));
    }
  }

  const sortedRows = useMemo(() => sortPaymentsByLatest(rows), [rows]);
  const stats = useMemo(
    () => ({
      total: rows.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      verified: rows.filter((item) => String(item.status || "").toLowerCase() === "verified").length,
      pending: rows.filter((item) => String(item.status || "").toLowerCase() === "pending").length,
    }),
    [rows]
  );

  return (
    <div>
      <PageHeader
        title="Keuangan"
        subtitle="Monitoring pembayaran, rekonsiliasi, dan status transaksi pelanggan."
        actionHref="/keuangan/new"
        actionLabel="Tambah Pembayaran"
      />
      <Toast message={toast} />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Total Pembayaran</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{currency(stats.total)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Terverifikasi</p>
          <p className="mt-2 text-2xl font-black text-emerald-600">{stats.verified}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-bold uppercase text-slate-400">Pending</p>
          <p className="mt-2 text-2xl font-black text-amber-600">{stats.pending}</p>
        </Card>
      </div>

      {loading ? (
        <TableSkeleton columns={7} />
      ) : (
        <DataTable
          data={sortedRows}
          editBasePath="/keuangan"
          onDelete={remove}
          columns={[
            { key: "referenceNo", header: "No Referensi" },
            { key: "customerName", header: "Nama Pelanggan" },
            { key: "invoiceNo", header: "No Invoice" },
            { key: "amount", header: "Nominal", render: (row: any) => currency(row.amount) },
            { key: "method", header: "Metode" },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
            { key: "paidAt", header: "Tanggal Bayar", render: (row: any) => date(row.paidAt) },
          ]}
        />
      )}
    </div>
  );
}

export function ReportsCrudPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    financeService
      .getReports()
      .then((data) => setRows(data))
      .catch((err) => setToast(formatErrorMessage(err, "Gagal memuat laporan.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function remove(row: any) {
    try {
      await financeService.deleteReport(row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast("Laporan berhasil dihapus.");
    } catch (err: any) {
      setToast(formatErrorMessage(err, "Gagal menghapus laporan."));
    }
  }

  return (
    <div>
      <PageHeader title="Laporan" subtitle="Arsip laporan operasional, pendapatan, dan billing." actionHref="/laporan/new" actionLabel="Buat Laporan" />
      <Toast message={toast} />
      {loading ? (
        <TableSkeleton columns={6} />
      ) : (
        <DataTable
          data={rows}
          editBasePath="/laporan"
          onDelete={remove}
          columns={[
            { key: "title", header: "Judul Laporan" },
            { key: "category", header: "Kategori" },
            { key: "period", header: "Periode" },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
            { key: "generatedAt", header: "Tanggal Dibuat", render: (row: any) => date(row.generatedAt) },
          ]}
        />
      )}
    </div>
  );
}

export function SettingsCrudPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    financeService
      .getCompanySettings()
      .then((data) => {
        setRows(data ? (Array.isArray(data) ? data : [data]) : []);
      })
      .catch((err) => setToast(formatErrorMessage(err, "Gagal memuat pengaturan.")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Pengaturan Sistem" subtitle="Kelola konfigurasi umum aplikasi." actionHref="/pengaturan/new" actionLabel="Tambah Pengaturan" />
      <Toast message={toast} />
      {loading ? (
        <TableSkeleton columns={5} />
      ) : (
        <DataTable
          data={rows}
          editBasePath="/pengaturan"
          columns={[
            { key: "settingKey", header: "Key Konfigurasi", render: (row: any) => row.settingKey || row.key || "Profil Perusahaan" },
            { key: "settingValue", header: "Nilai", render: (row: any) => safeText(row.companyName || row.settingValue || row.value) },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status || "active"} /> },
          ]}
        />
      )}
    </div>
  );
}

export function ServicePackagesCrudPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    financeService
      .getServicePackages()
      .then((data) => setRows(data))
      .catch((err) => setToast(formatErrorMessage(err, "Gagal memuat paket layanan.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function remove(row: any) {
    try {
      await financeService.deleteServicePackage(row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast("Paket layanan berhasil dihapus.");
    } catch (err: any) {
      setToast(formatErrorMessage(err, "Gagal menghapus paket layanan."));
    }
  }

  return (
    <div>
      <PageHeader title="Paket Layanan" subtitle="Daftar paket internet, bandwidth, dan tarif bulanan." actionHref="/pengaturan/paket-layanan/new" actionLabel="Tambah Paket" />
      <Toast message={toast} />
      {loading ? (
        <TableSkeleton columns={5} />
      ) : (
        <DataTable
          data={rows}
          editBasePath="/pengaturan/paket-layanan"
          onDelete={remove}
          columns={[
            { key: "name", header: "Nama Paket" },
            { key: "speedMbps", header: "Kecepatan", render: (row: any) => (row.speedMbps ? `${row.speedMbps} Mbps` : "-") },
            { key: "monthlyPrice", header: "Harga Bulanan", render: (row: any) => currency(row.monthlyPrice) },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
          ]}
        />
      )}
    </div>
  );
}

export function PaymentMethodsCrudPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    financeService
      .getPaymentMethods()
      .then((data) => setRows(data))
      .catch((err) => setToast(formatErrorMessage(err, "Gagal memuat metode pembayaran.")))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  async function remove(row: any) {
    try {
      await financeService.deletePaymentMethod(row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast("Metode pembayaran berhasil dihapus.");
    } catch (err: any) {
      setToast(formatErrorMessage(err, "Gagal menghapus metode pembayaran."));
    }
  }

  return (
    <div>
      <PageHeader title="Metode Pembayaran" subtitle="Daftar kanal transfer, payment gateway, dan rekening bank penerima." actionHref="/pengaturan/metode-pembayaran/new" actionLabel="Tambah Metode" />
      <Toast message={toast} />
      {loading ? (
        <TableSkeleton columns={4} />
      ) : (
        <DataTable
          data={rows}
          editBasePath="/pengaturan/metode-pembayaran"
          onDelete={remove}
          columns={[
            { key: "name", header: "Nama Metode" },
            { key: "code", header: "Kode Kanal" },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
          ]}
        />
      )}
    </div>
  );
}

export function FinanceFormPage({ edit = false, id, invoiceQuery = "" }: { edit?: boolean; id?: string; invoiceQuery?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ referenceNo: "", customerName: "", invoiceNo: "", amount: "", method: "", status: "verified", paidAt: "", notes: "" });
  const [existingPaymentId, setExistingPaymentId] = useState("");
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    financeService
      .getPaymentMethods(100)
      .then((data: any[]) => {
        const activeMethods = data
          .filter((item: any) => item.status === "active")
          .map((item: any) => ({ label: item.name, value: item.name }));
        setPaymentMethodOptions(activeMethods);
        setForm((current) => (current.method || !activeMethods[0] ? current : { ...current, method: activeMethods[0].value }));
      })
      .catch(() => setPaymentMethodOptions([]));
  }, []);

  const methodOptions = useMemo(() => {
    if (!form.method || paymentMethodOptions.some((item) => item.value === form.method)) return paymentMethodOptions;
    return [{ label: form.method, value: form.method }, ...paymentMethodOptions];
  }, [form.method, paymentMethodOptions]);

  useEffect(() => {
    if (!edit || !id) return;
    financeService
      .getDetail(id)
      .then((data) => {
        if (!data) return;
        setForm({
          referenceNo: data.referenceNo || "",
          customerName: data.customerName || "",
          invoiceNo: data.invoiceNo || "",
          amount: String(data.amount || ""),
          method: data.method || "",
          status: data.status || "verified",
          paidAt: toInputDate(data.paidAt),
          notes: data.notes || "",
        });
      })
      .catch((err) => setError(formatErrorMessage(err, "Gagal memuat pembayaran dari database.")));
  }, [edit, id]);

  useEffect(() => {
    if (edit || !invoiceQuery) return;
    internetServiceService
      .searchInvoices({ search: invoiceQuery, limit: 1 })
      .then(async (invoices: any[]) => {
        const invoice = invoices[0];
        if (!invoice) return;
        const invoiceNo = invoice.noInvoice || invoice.noFaktur || invoiceQuery;
        const referenceNo = `PAY-${invoiceNo.replace(/[^A-Za-z0-9]/g, "-")}`;
        const existingPayment = await financeService.findPaymentByInvoice(invoiceNo).catch(() => null);
        if (existingPayment?.id) setExistingPaymentId(existingPayment.id);
        setForm((current) => ({
          ...current,
          referenceNo: current.referenceNo || existingPayment?.referenceNo || referenceNo,
          customerName: current.customerName || existingPayment?.customerName || invoice.customerName || invoice.customer?.name || "",
          invoiceNo: existingPayment?.invoiceNo || invoiceNo,
          amount: current.amount || String(existingPayment?.amount || invoice.amount || invoice.grandTotal || 0),
          method: existingPayment?.method || current.method || "",
          status: existingPayment?.status || current.status || "verified",
          paidAt: current.paidAt || toInputDate(existingPayment?.paidAt) || new Date().toISOString().slice(0, 10),
          notes: current.notes || existingPayment?.notes || "",
        }));
      })
      .catch((err: any) => setError(formatErrorMessage(err, "Gagal memuat data faktur untuk pembayaran.")));
  }, [edit, invoiceQuery]);

  async function submit() {
    setError("");
    try {
      const payload = { ...form, amount: Number(parseRupiah(form.amount)), paidAt: form.paidAt || null };
      if (edit && id) await financeService.updatePayment(id, payload);
      else if (existingPaymentId) await financeService.updatePayment(existingPaymentId, payload);
      else await financeService.createPayment(payload);
      router.push("/keuangan");
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal menyimpan pembayaran."));
    }
  }

  return (
    <CrudForm title={(edit ? "Edit" : "Tambah") + " Pembayaran"} subtitle="Catat transaksi pembayaran dan rekonsiliasi." error={error} onSubmit={submit} back="/keuangan">
      <TextInput label="No Referensi" value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} />
      <TextInput label="Nama Pelanggan" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
      <TextInput label="No Invoice" value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Nominal</span>
        <div className="flex h-11 w-full items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
          <span className="mr-2 shrink-0 font-semibold text-slate-500">Rp</span>
          <input
            inputMode="numeric"
            value={formatRupiahInput(form.amount)}
            onChange={(e) => setForm({ ...form, amount: parseRupiah(e.target.value) })}
            placeholder="0"
            className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
          />
        </div>
      </label>
      <SelectInput
        label="Metode"
        value={form.method}
        onChange={(e) => setForm({ ...form, method: e.target.value })}
        options={methodOptions.length ? methodOptions : [{ label: "Belum ada metode pembayaran", value: "" }]}
        disabled={!methodOptions.length}
      />
      <SelectInput
        label="Status"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        options={[
          { label: "Verified", value: "verified" },
          { label: "Pending", value: "pending" },
          { label: "Rejected", value: "rejected" },
        ]}
      />
      <TextInput label="Tanggal Bayar" type="date" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} />
      <div className="lg:col-span-2">
        <TextArea label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </CrudForm>
  );
}

export function ReportFormPage({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", category: "Keuangan", period: "", status: "draft", generatedAt: "", notes: "" });

  useEffect(() => {
    if (!edit || !id) return;
    financeService
      .getReportDetail(id)
      .then((data) => {
        if (!data) return;
        setForm({
          title: data.title || "",
          category: data.category || "Keuangan",
          period: data.period || "",
          status: data.status || "draft",
          generatedAt: toInputDate(data.generatedAt),
          notes: data.notes || "",
        });
      })
      .catch((err) => setError(formatErrorMessage(err, "Gagal memuat laporan dari database.")));
  }, [edit, id]);

  async function submit() {
    setError("");
    try {
      const payload = { ...form, generatedAt: form.generatedAt || null };
      if (edit && id) await financeService.updateReport(id, payload);
      else await financeService.createReport(payload);
      router.push("/laporan");
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal menyimpan laporan."));
    }
  }

  return (
    <CrudForm title={(edit ? "Edit" : "Tambah") + " Laporan"} subtitle="Kelola laporan operasional dan periode." error={error} onSubmit={submit} back="/laporan">
      <TextInput label="Judul Laporan" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <SelectInput
        label="Kategori"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        options={[
          { label: "Keuangan", value: "Keuangan" },
          { label: "Invoice", value: "Invoice" },
          { label: "Pelanggan", value: "Pelanggan" },
          { label: "Marketing", value: "Marketing" },
        ]}
      />
      <TextInput label="Periode" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="Mei 2026" />
      <SelectInput
        label="Status"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        options={[
          { label: "Draft", value: "draft" },
          { label: "Published", value: "published" },
          { label: "Archived", value: "archived" },
        ]}
      />
      <TextInput label="Tanggal Generate" type="date" value={form.generatedAt} onChange={(e) => setForm({ ...form, generatedAt: e.target.value })} />
      <div className="lg:col-span-2">
        <TextArea label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </CrudForm>
  );
}

export function SettingFormPage({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ settingKey: "", settingValue: "", settingGroup: "general", status: "active" });

  useEffect(() => {
    if (!edit || !id) return;
    financeService
      .getCompanySettings(id)
      .then((data) => setForm(data || {}))
      .catch((err) => setError(formatErrorMessage(err, "Gagal memuat pengaturan dari database.")));
  }, [edit, id]);

  async function submit() {
    setError("");
    try {
      await financeService.saveCompanySettings(form, edit && id ? id : undefined);
      router.push("/pengaturan");
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal menyimpan pengaturan."));
    }
  }

  return (
    <CrudForm title={(edit ? "Edit" : "Tambah") + " Pengaturan"} subtitle="Kelola key-value konfigurasi aplikasi." error={error} onSubmit={submit} back="/pengaturan">
      <TextInput label="Setting Key" value={form.settingKey} onChange={(e) => setForm({ ...form, settingKey: e.target.value })} placeholder="company_name" />
      <TextInput label="Setting Value" value={form.settingValue} onChange={(e) => setForm({ ...form, settingValue: e.target.value })} />
      <SelectInput
        label="Grup"
        value={form.settingGroup}
        onChange={(e) => setForm({ ...form, settingGroup: e.target.value })}
        options={[
          { label: "General", value: "general" },
          { label: "System", value: "system" },
          { label: "Billing", value: "billing" },
          { label: "Security", value: "security" },
        ]}
      />
      <SelectInput
        label="Status"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        options={[
          { label: "Aktif", value: "active" },
          { label: "Nonaktif", value: "nonactive" },
        ]}
      />
    </CrudForm>
  );
}

export function CompanyProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    companyName: "PT. Ring Media Nusantara",
    companyAddress: "Jl. Wuluh No. 1 Papringan, Caturtunggal, Depok, Sleman, DIY 55281",
    companyEmail: "billing@ring.net.id",
    companyPhone: "+6287747963000",
    companyWebsite: "https://ring.net.id",
  });

  useEffect(() => {
    financeService
      .getCompanySettings("company-profile")
      .then((data) => {
        if (data) {
          setForm((prev) => ({
            ...prev,
            companyName: data.companyName || prev.companyName,
            companyAddress: data.companyAddress || prev.companyAddress,
            companyEmail: data.companyEmail || prev.companyEmail,
            companyPhone: data.companyPhone || prev.companyPhone,
            companyWebsite: data.companyWebsite || prev.companyWebsite,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setToast("");
    try {
      await financeService.saveCompanySettings(form, "company-profile");
      setToast("Profil perusahaan berhasil diperbarui.");
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal menyimpan profil perusahaan."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Card className="p-8 text-sm text-slate-500">Memuat profil perusahaan...</Card>;
  }

  return (
    <div>
      <PageHeader title="Profil Perusahaan" subtitle="Kelola data resmi perusahaan untuk faktur, invoice, dan dokumen." />
      <Toast message={toast} />
      <Card className="p-6">
        {error ? <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <TextInput label="Nama Perusahaan" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
            <TextInput label="Email Resmi" type="email" value={form.companyEmail} onChange={(e) => setForm({ ...form, companyEmail: e.target.value })} required />
            <TextInput label="Nomor Telepon / WhatsApp" value={form.companyPhone} onChange={(e) => setForm({ ...form, companyPhone: e.target.value })} required />
            <TextInput label="Website" value={form.companyWebsite} onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })} />
            <div className="lg:col-span-2">
              <TextArea label="Alamat Kantor Pusat" value={form.companyAddress} onChange={(e) => setForm({ ...form, companyAddress: e.target.value })} required />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="submit" disabled={saving} className="h-10 rounded-lg bg-[#6366F1] px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 disabled:opacity-50">
              {saving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function ServicePackageFormPage({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", speedMbps: "", monthlyPrice: "", description: "", status: "active" });

  useEffect(() => {
    if (!edit || !id) return;
    financeService
      .getServicePackageDetail(id)
      .then((data) => {
        if (!data) return;
        setForm({
          name: data.name || "",
          speedMbps: data.speedMbps ? String(data.speedMbps) : "",
          monthlyPrice: data.monthlyPrice ? String(data.monthlyPrice) : "",
          description: data.description || "",
          status: data.status || "active",
        });
      })
      .catch((err) => setError(formatErrorMessage(err, "Gagal memuat data paket layanan.")));
  }, [edit, id]);

  async function submit() {
    setError("");
    try {
      const payload = {
        ...form,
        speedMbps: form.speedMbps ? Number(form.speedMbps) : null,
        monthlyPrice: Number(parseRupiah(form.monthlyPrice)),
      };
      if (edit && id) await financeService.updateServicePackage(id, payload);
      else await financeService.createServicePackage(payload);
      router.push("/pengaturan/paket-layanan");
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal menyimpan paket layanan."));
    }
  }

  return (
    <CrudForm
      title={(edit ? "Edit" : "Tambah") + " Paket Layanan"}
      subtitle="Atur nama paket, kecepatan internet, harga bulanan, dan deskripsi penawaran."
      error={error}
      onSubmit={submit}
      back="/pengaturan/paket-layanan"
    >
      <TextInput label="Nama Paket" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mega 50Mbps" />
      <TextInput label="Kecepatan (Mbps)" inputMode="numeric" value={form.speedMbps} onChange={(e) => setForm({ ...form, speedMbps: e.target.value.replace(/\D/g, "") })} placeholder="50" />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Harga Bulanan</span>
        <div className="flex h-11 w-full items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
          <span className="mr-2 shrink-0 font-semibold text-slate-500">Rp</span>
          <input
            inputMode="numeric"
            value={formatRupiahInput(form.monthlyPrice)}
            onChange={(e) => setForm({ ...form, monthlyPrice: parseRupiah(e.target.value) })}
            placeholder="0"
            className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400"
          />
        </div>
      </label>
      <SelectInput
        label="Status"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        options={[
          { label: "Aktif", value: "active" },
          { label: "Nonaktif", value: "nonactive" },
        ]}
      />
      <div className="lg:col-span-2">
        <TextArea label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat manfaat paket ini" />
      </div>
    </CrudForm>
  );
}

export function PaymentMethodFormPage({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", code: "", description: "", status: "active" });

  useEffect(() => {
    if (!edit || !id) return;
    financeService
      .getPaymentMethodDetail(id)
      .then((data) => {
        if (!data) return;
        setForm({
          name: data.name || "",
          code: data.code || "",
          description: data.description || "",
          status: data.status || "active",
        });
      })
      .catch((err) => setError(formatErrorMessage(err, "Gagal memuat metode pembayaran.")));
  }, [edit, id]);

  async function submit() {
    setError("");
    try {
      if (edit && id) await financeService.updatePaymentMethod(id, form);
      else await financeService.createPaymentMethod(form);
      router.push("/pengaturan/metode-pembayaran");
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal menyimpan metode pembayaran."));
    }
  }

  return (
    <CrudForm title={(edit ? "Edit" : "Tambah") + " Metode Pembayaran"} subtitle="Atur nama metode, kode, status, dan catatan penggunaan." error={error} onSubmit={submit} back="/pengaturan/metode-pembayaran">
      <TextInput label="Nama Metode" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Transfer Bank" />
      <TextInput label="Kode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="transfer_bank" />
      <SelectInput
        label="Status"
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        options={[
          { label: "Aktif", value: "active" },
          { label: "Nonaktif", value: "nonactive" },
        ]}
      />
      <div className="lg:col-span-2">
        <TextArea label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat metode pembayaran ini" />
      </div>
    </CrudForm>
  );
}

function CrudForm({
  title,
  subtitle,
  error,
  children,
  onSubmit,
  back,
}: {
  title: string;
  subtitle: string;
  error: string;
  children: React.ReactNode;
  onSubmit: () => void;
  back: string;
}) {
  const router = useRouter();
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="p-6">
        {error ? <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="space-y-6"
        >
          <div className="grid gap-5 lg:grid-cols-2">{children}</div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => router.push(back)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">
              Batal
            </button>
            <button className="h-10 rounded-lg bg-[#6366F1] px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-200">
              Simpan
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
