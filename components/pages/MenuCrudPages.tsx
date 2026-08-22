"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */

import { Badge, Card, DataTable, PageHeader, SelectInput, StatSkeleton, TableSkeleton, TextArea, TextInput } from "@/components/ui/AdminUI";
import { currency, date, extractArrayData } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Edit3, Wallet, X } from "lucide-react";
import { financeApi } from "@/src/features/finance/api";
import { paymentMethodsApi } from "@/src/features/payment-methods/api";
import { productsApi } from "@/src/features/products/api";
import { reportsApi } from "@/src/features/reports/api";
import { settingsApi } from "@/src/features/settings/api";

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div>;
}

function useRows(fetchRows: () => Promise<any>, removeRow: (id: string) => Promise<any>) {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setToast("");
    fetchRows()
      .then((res) => setRows(extractArrayData(res?.data)))
      .catch(() => {
        setRows([]);
        setToast("Gagal memuat data. Pastikan backend aktif dan sesi login valid.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function remove(row: any, successMessage: string) {
    try {
      await removeRow(row.id);
      setRows((current) => (Array.isArray(current) ? current : []).filter((item) => item.id !== row.id));
      setToast(successMessage);
    } catch (err: any) {
      setToast(err.response?.data?.message || "Gagal menghapus data.");
    }
  }

  return { rows: Array.isArray(rows) ? rows : [], setRows, toast, setToast, remove, loading };
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
  const list = Array.isArray(rows) ? rows : [];
  return [...list].sort((a, b) => {
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
  const { rows, toast, remove, loading } = useRows(
    () => financeApi.payments({ limit: 5000, sort: "latest" }),
    financeApi.removePayment
  );
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const sortedRows = useMemo(() => sortPaymentsByLatest(safeRows), [safeRows]);
  const stats = useMemo(() => ({
    total: safeRows.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    verified: safeRows.filter((item) => String(item.status || "").toLowerCase() === "verified").length,
    pending: safeRows.filter((item) => String(item.status || "").toLowerCase() === "pending").length,
  }), [safeRows]);

  return (
    <div>
      <PageHeader title="Keuangan" subtitle="Monitoring pembayaran, rekonsiliasi, dan status transaksi pelanggan." actionHref="/keuangan/new" actionLabel="Tambah Pembayaran" />
      <Toast message={toast} />
      {loading ? <StatSkeleton count={3} /> : <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-500 text-white"><Wallet size={22} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Pembayaran</p><p className="mt-1 text-2xl font-black text-slate-950">{currency(stats.total)}</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500 text-white"><Check size={22} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Terverifikasi</p><p className="mt-1 text-2xl font-black text-slate-950">{stats.verified}</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500 text-white"><CreditCard size={22} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Pending</p><p className="mt-1 text-2xl font-black text-slate-950">{stats.pending}</p></div>
          </div>
        </Card>
      </div>}
      {loading ? <TableSkeleton columns={8} /> :
      <DataTable
        title="Daftar Pembayaran"
        data={sortedRows}
        searchPlaceholder="Cari referensi, pelanggan, invoice, metode..."
        editBasePath="/keuangan"
        onDelete={(row) => remove(row, "Pembayaran berhasil dihapus.")}
        columns={[
          { key: "referenceNo", header: "Referensi", render: (row: any) => <span className="font-semibold text-indigo-600">{safeText(row.referenceNo)}</span> },
          { key: "customerName", header: "Pelanggan", render: (row: any) => safeText(row.customerName) },
          { key: "invoiceNo", header: "Invoice", render: (row: any) => safeText(row.invoiceNo) },
          { key: "amount", header: "Nominal", render: (row: any) => currency(row.amount) },
          { key: "method", header: "Metode", render: (row: any) => safeText(row.method) },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
          { key: "paidAt", header: "Tanggal", render: (row: any) => date(row.paidAt) },
        ]}
      />
      }
    </div>
  );
}

export function ReportsCrudPage() {
  const { rows, toast, remove, loading } = useRows(
    () => reportsApi.list({ limit: 5000 }),
    reportsApi.remove
  );
  return (
    <div>
      <PageHeader title="Laporan" subtitle="Template laporan, periode, status publikasi, dan catatan." actionHref="/laporan/new" actionLabel="Tambah Laporan" />
      <Toast message={toast} />
      {loading ? <TableSkeleton columns={7} /> :
      <DataTable
        data={rows}
        editBasePath="/laporan"
        onDelete={(row) => remove(row, "Laporan berhasil dihapus.")}
        columns={[
          { key: "title", header: "Judul", render: (row: any) => <span className="font-semibold text-slate-900">{row.title}</span> },
          { key: "category", header: "Kategori" },
          { key: "period", header: "Periode" },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
          { key: "generatedAt", header: "Generate", render: (row: any) => date(row.generatedAt) },
          { key: "notes", header: "Catatan" },
        ]}
      />
      }
    </div>
  );
}

export function SettingsCrudPage() {
  const { rows, setRows, toast, setToast, remove, loading } = useRows(
    () => settingsApi.list(),
    settingsApi.remove
  );
  const [editingTaxKey, setEditingTaxKey] = useState("");
  const [taxDraft, setTaxDraft] = useState("");
  const safeRows = Array.isArray(rows) ? rows : [];
  const taxItems = [
    { key: "tax_ppn", label: "PPN (%)", value: "11" },
    { key: "tax_pph23", label: "PPH23 (%)", value: "2" },
    { key: "tax_bhp", label: "BHP (%)", value: "0,5" },
    { key: "tax_uso", label: "USO (%)", value: "1,25" },
    { key: "tax_kso", label: "KSO (%)", value: "2" },
  ].map((item) => {
    const saved = safeRows.find((row) => row.settingKey === item.key);
    return {
      ...item,
      id: saved?.id,
      value: saved?.settingValue || item.value,
    };
  });

  async function saveTaxValue(item: { key: string; label: string; value: string; id?: string }) {
    try {
      const payload = {
        settingKey: item.key,
        settingValue: taxDraft,
        settingGroup: "tax",
        status: "active",
      };
      const res = item.id ? await settingsApi.update(item.id, payload) : await settingsApi.create(payload);
      const saved = res.data.data;
      setRows((current) => {
        const exists = current.some((row) => row.id === saved.id);
        if (exists) return current.map((row) => row.id === saved.id ? saved : row);
        return [saved, ...current];
      });
      setEditingTaxKey("");
      setTaxDraft("");
      setToast(item.label + " berhasil disimpan.");
    } catch (err: any) {
      setToast(err.response?.data?.message || "Gagal menyimpan " + item.label + ".");
    }
  }

  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Konfigurasi aplikasi, sistem, billing, dan profil perusahaan." actionHref="/pengaturan/new" actionLabel="Tambah Pengaturan" />
      <Toast message={toast} />
      <Card className="mb-6 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Pengaturan Keuangan dan Pajak</h2>
          <p className="mt-1 text-sm text-slate-500">Kelola persentase pajak dan biaya regulasi yang dipakai pada perhitungan tagihan.</p>
        </div>
        {loading ? (
          <div className="grid gap-x-10 gap-y-7 lg:grid-cols-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={index === 0 ? "lg:col-span-2" : ""}>
                <div className="shimmer mb-3 h-4 w-28 rounded" />
                <div className="shimmer h-8 w-full rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-x-10 gap-y-7 lg:grid-cols-2">
            {taxItems.map((item, index) => (
              <div key={item.key} className={index === 0 ? "lg:col-span-2" : ""}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-black uppercase tracking-wide text-slate-500">{item.label}</p>
                  {editingTaxKey === item.key ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => saveTaxValue(item)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-emerald-600 transition hover:bg-emerald-50"
                        title="Simpan value"
                      >
                        <Check size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingTaxKey(""); setTaxDraft(""); }}
                        className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                        title="Batal"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setEditingTaxKey(item.key); setTaxDraft(item.value); }}
                      className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
                      title="Edit value"
                    >
                      <Edit3 size={17} />
                    </button>
                  )}
                </div>
                {editingTaxKey === item.key ? (
                  <input
                    value={taxDraft}
                    onChange={(event) => setTaxDraft(event.target.value)}
                    className="h-10 w-full border-b border-indigo-300 bg-indigo-50/50 px-2 text-base font-bold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    autoFocus
                  />
                ) : (
                  <div className="border-b border-dashed border-slate-300 pb-3 text-base font-bold text-slate-800">{item.value}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      {loading ? <TableSkeleton columns={5} /> :
      <DataTable
        data={rows}
        editBasePath="/pengaturan"
        onDelete={(row) => remove(row, "Pengaturan berhasil dihapus.")}
        columns={[
          { key: "settingKey", header: "Key", render: (row: any) => <span className="font-semibold text-slate-900">{row.settingKey}</span> },
          { key: "settingValue", header: "Value" },
          { key: "settingGroup", header: "Grup" },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
        ]}
      />
      }
    </div>
  );
}

const companyProfileDefaults = [
  { key: "company_name", label: "Nama Perusahaan", value: "PT Ring Media Nusantara", span: "half" },
  { key: "company_phone", label: "No. Telepon", value: "+6287747963000", span: "half" },
  { key: "company_email", label: "Alamat Surel", value: "info@ring.net.id", span: "half" },
  { key: "company_postal_code", label: "Kode Pos", value: "55281", span: "half" },
  { key: "company_address", label: "Alamat", value: "Jl. Wuluh No. 1 Papringan, RT. 13 RW. 05", span: "full" },
  { key: "company_village", label: "Kelurahan", value: "Caturtunggal", span: "half" },
  { key: "company_district", label: "Kecamatan", value: "Depok", span: "half" },
  { key: "company_city", label: "Kabupaten / Kota", value: "Sleman", span: "half" },
  { key: "company_province", label: "Provinsi", value: "Daerah Istimewa Yogyakarta", span: "half" },
];

export function CompanyProfilePage() {
  const { rows, setRows, toast, setToast, loading } = useRows(
    () => settingsApi.list({ limit: 100, search: "company_" }),
    settingsApi.remove
  );
  const [editingKey, setEditingKey] = useState("");
  const [draft, setDraft] = useState("");
  const safeRows = Array.isArray(rows) ? rows : [];
  const logoSetting = safeRows.find((row) => row.settingKey === "company_logo_url");
  const logoUrl = logoSetting?.settingValue || "/assets/logo.png";
  const profileItems = companyProfileDefaults.map((item) => {
    const saved = safeRows.find((row) => row.settingKey === item.key);
    return { ...item, id: saved?.id, value: saved?.settingValue || item.value };
  });

  async function saveProfileValue(item: { key: string; label: string; value: string; id?: string }, value: string) {
    try {
      const payload = {
        settingKey: item.key,
        settingValue: value,
        settingGroup: "company_profile",
        status: "active",
      };
      const res = item.id ? await settingsApi.update(item.id, payload) : await settingsApi.create(payload);
      const saved = res.data.data;
      setRows((current) => {
        const list = Array.isArray(current) ? current : [];
        const exists = list.some((row) => row.id === saved.id);
        if (exists) return list.map((row) => row.id === saved.id ? saved : row);
        return [saved, ...list];
      });
      setEditingKey("");
      setDraft("");
      setToast(item.label + " berhasil disimpan.");
    } catch (err: any) {
      setToast(err.response?.data?.message || "Gagal menyimpan " + item.label + ".");
    }
  }

  const logoItem = { key: "company_logo_url", label: "Logo Perusahaan", value: logoUrl, id: logoSetting?.id };

  return (
    <div>
      <PageHeader title="Profil Perusahaan" subtitle="Kelola identitas perusahaan yang digunakan pada sistem, dokumen, dan tagihan." />
      <Toast message={toast} />
      <Card className="p-6">
        {loading ? (
          <div className="space-y-8">
            <div>
              <div className="shimmer mb-4 h-5 w-40 rounded" />
              <div className="shimmer mx-auto h-56 w-full max-w-xl rounded-xl" />
            </div>
            <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                  <div className="shimmer mb-3 h-4 w-36 rounded" />
                  <div className="shimmer h-9 w-full rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="border-b border-dashed border-slate-300 pb-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-black text-slate-700">Logo Perusahaan</h2>
                <button
                  type="button"
                  onClick={() => { setEditingKey("company_logo_url"); setDraft(logoUrl); }}
                  className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
                  title="Edit logo"
                >
                  <Edit3 size={18} />
                </button>
              </div>
              <div className="mx-auto flex min-h-64 max-w-3xl items-center justify-center rounded-xl bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Logo perusahaan" className="max-h-64 w-full max-w-2xl object-contain" />
              </div>
              {editingKey === "company_logo_url" ? (
                <div className="mx-auto mt-5 flex max-w-2xl gap-2">
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    className="h-11 flex-1 rounded-lg border border-indigo-200 bg-indigo-50/50 px-3 text-sm font-semibold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="/assets/logo.png"
                    autoFocus
                  />
                  <button type="button" onClick={() => saveProfileValue(logoItem, draft)} className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Check size={18} /></button>
                  <button type="button" onClick={() => { setEditingKey(""); setDraft(""); }} className="grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-slate-500"><X size={18} /></button>
                </div>
              ) : null}
            </div>
            <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-2">
              {profileItems.map((item) => (
                <div key={item.key} className={item.span === "full" ? "lg:col-span-2" : ""}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-black text-slate-600">{item.label}</p>
                    {editingKey === item.key ? (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => saveProfileValue(item, draft)} className="grid h-8 w-8 place-items-center rounded-lg text-emerald-600 transition hover:bg-emerald-50" title="Simpan">
                          <Check size={17} />
                        </button>
                        <button type="button" onClick={() => { setEditingKey(""); setDraft(""); }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100" title="Batal">
                          <X size={17} />
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => { setEditingKey(item.key); setDraft(item.value); }} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600" title="Edit value">
                        <Edit3 size={17} />
                      </button>
                    )}
                  </div>
                  {editingKey === item.key ? (
                    <input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      className="h-11 w-full border-b border-indigo-300 bg-indigo-50/50 px-2 text-base font-bold text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      autoFocus
                    />
                  ) : (
                    <div className="border-b border-dashed border-slate-300 pb-3 text-base font-bold text-slate-800">{item.value || "-"}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export function ServicePackagesCrudPage() {
  const { rows, toast, remove, loading } = useRows(
    () => productsApi.servicePackages(),
    productsApi.removeServicePackage
  );
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const stats = useMemo(() => ({
    total: safeRows.length,
    active: safeRows.filter((item) => item.status === "active").length,
    avgPrice: safeRows.length ? safeRows.reduce((sum, item) => sum + Number(item.monthlyPrice || 0), 0) / safeRows.length : 0,
  }), [safeRows]);

  return (
    <div>
      <PageHeader title="Paket Layanan" subtitle="Kelola katalog paket internet, kecepatan, harga bulanan, dan status penjualan." actionHref="/pengaturan/paket-layanan/new" actionLabel="Tambah Paket" />
      <Toast message={toast} />
      {loading ? <StatSkeleton count={3} /> : <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-bold uppercase text-slate-400">Total Paket</p><p className="mt-3 text-2xl font-black text-slate-950">{stats.total}</p></Card>
        <Card className="p-5"><p className="text-xs font-bold uppercase text-slate-400">Aktif Dijual</p><p className="mt-3 text-2xl font-black text-emerald-600">{stats.active}</p></Card>
        <Card className="p-5"><p className="text-xs font-bold uppercase text-slate-400">Harga Rata-Rata</p><p className="mt-3 text-2xl font-black text-slate-950">{currency(stats.avgPrice)}</p></Card>
      </div>}
      {loading ? <TableSkeleton columns={6} /> :
      <DataTable
        data={safeRows}
        editBasePath="/pengaturan/paket-layanan"
        onDelete={(row) => remove(row, "Paket layanan berhasil dihapus.")}
        columns={[
          { key: "name", header: "Nama Paket", render: (row: any) => <span className="font-semibold text-slate-900">{row.name}</span> },
          { key: "speedMbps", header: "Kecepatan", render: (row: any) => row.speedMbps ? `${row.speedMbps} Mbps` : "-" },
          { key: "monthlyPrice", header: "Harga Bulanan", render: (row: any) => currency(row.monthlyPrice) },
          { key: "description", header: "Deskripsi", render: (row: any) => row.description || "-" },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
        ]}
      />
      }
    </div>
  );
}

export function PaymentMethodsCrudPage() {
  const { rows, toast, remove, loading } = useRows(
    () => paymentMethodsApi.list(),
    paymentMethodsApi.remove
  );
  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const stats = useMemo(() => ({
    total: safeRows.length,
    active: safeRows.filter((item) => item.status === "active").length,
    nonactive: safeRows.filter((item) => item.status !== "active").length,
  }), [safeRows]);

  return (
    <div>
      <PageHeader title="Metode Pembayaran" subtitle="Kelola pilihan metode pembayaran yang muncul pada form transaksi." actionHref="/pengaturan/metode-pembayaran/new" actionLabel="Tambah Metode" />
      <Toast message={toast} />
      {loading ? <StatSkeleton count={3} /> : <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5"><CreditCard className="text-indigo-500" size={24} /><p className="mt-3 text-xs font-bold uppercase text-slate-400">Total Metode</p><p className="text-2xl font-black">{stats.total}</p></Card>
        <Card className="p-5"><p className="text-xs font-bold uppercase text-slate-400">Aktif</p><p className="mt-3 text-2xl font-black text-emerald-600">{stats.active}</p></Card>
        <Card className="p-5"><p className="text-xs font-bold uppercase text-slate-400">Nonaktif</p><p className="mt-3 text-2xl font-black text-rose-600">{stats.nonactive}</p></Card>
      </div>}
      {loading ? <TableSkeleton columns={5} /> :
      <DataTable
        data={safeRows}
        editBasePath="/pengaturan/metode-pembayaran"
        onDelete={(row) => remove(row, "Metode pembayaran berhasil dihapus.")}
        columns={[
          { key: "name", header: "Nama Metode", render: (row: any) => <span className="font-semibold text-slate-900">{row.name}</span> },
          { key: "code", header: "Kode" },
          { key: "description", header: "Deskripsi", render: (row: any) => row.description || "-" },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
        ]}
      />
      }
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
    paymentMethodsApi.list({ limit: 100 })
      .then((res) => {
        const methodsList = extractArrayData(res?.data);
        const activeMethods = methodsList
          .filter((item: any) => item.status === "active")
          .map((item: any) => ({ label: item.name, value: item.name }));
        setPaymentMethodOptions(activeMethods);
        setForm((current) => current.method || !activeMethods[0] ? current : { ...current, method: activeMethods[0].value });
      })
      .catch(() => setPaymentMethodOptions([]));
  }, []);

  const methodOptions = useMemo(() => {
    if (!form.method || paymentMethodOptions.some((item) => item.value === form.method)) return paymentMethodOptions;
    return [{ label: form.method, value: form.method }, ...paymentMethodOptions];
  }, [form.method, paymentMethodOptions]);

  useEffect(() => {
    if (!edit || !id) return;
    financeApi.paymentDetail(id).then((res) => {
      const data = res.data?.data || res.data || {};
      setForm({ referenceNo: data.referenceNo || "", customerName: data.customerName || "", invoiceNo: data.invoiceNo || "", amount: String(data.amount || ""), method: data.method || "", status: data.status || "verified", paidAt: toInputDate(data.paidAt), notes: data.notes || "" });
    }).catch((err) => setError(err.response?.data?.message || "Gagal memuat pembayaran dari database."));
  }, [edit, id]);

  useEffect(() => {
    if (edit || !invoiceQuery) return;
    financeApi.invoices({ limit: 1, search: invoiceQuery })
      .then(async (res) => {
        const invoiceList = extractArrayData(res?.data);
        const invoice = invoiceList[0] || null;
        if (!invoice) return;
        const invoiceNo = invoice.noInvoice || invoice.noFaktur || invoiceQuery;
        const referenceNo = `PAY-${invoiceNo.replace(/[^A-Za-z0-9]/g, "-")}`;
        const paymentRes = await financeApi.payments({ limit: 1, search: invoiceNo }).catch(() => null);
        const paymentList = extractArrayData(paymentRes?.data);
        const existingPayment = paymentList[0] || null;
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
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat data faktur untuk pembayaran."));
  }, [edit, invoiceQuery]);

  async function submit() {
    setError("");
    try {
      const payload = { ...form, amount: Number(parseRupiah(form.amount)), paidAt: form.paidAt || null };
      if (edit && id) await financeApi.updatePayment(id, payload);
      else if (existingPaymentId) await financeApi.updatePayment(existingPaymentId, payload);
      else await financeApi.createPayment(payload);
      router.push("/keuangan");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan pembayaran.");
    }
  }

  return <CrudForm title={(edit ? "Edit" : "Tambah") + " Pembayaran"} subtitle="Catat transaksi pembayaran dan rekonsiliasi." error={error} onSubmit={submit} back="/keuangan">
    <TextInput label="No Referensi" value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} />
    <TextInput label="Nama Pelanggan" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
    <TextInput label="No Invoice" value={form.invoiceNo} onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })} />
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">Nominal</span>
      <div className="flex h-11 w-full items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <span className="mr-2 shrink-0 font-semibold text-slate-500">Rp</span>
        <input inputMode="numeric" value={formatRupiahInput(form.amount)} onChange={(e) => setForm({ ...form, amount: parseRupiah(e.target.value) })} placeholder="0" className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400" />
      </div>
    </label>
    <SelectInput label="Metode" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} options={methodOptions.length ? methodOptions : [{ label: "Belum ada metode pembayaran", value: "" }]} disabled={!methodOptions.length} />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ label: "Verified", value: "verified" }, { label: "Pending", value: "pending" }, { label: "Rejected", value: "rejected" }]} />
    <TextInput label="Tanggal Bayar" type="date" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} />
    <div className="lg:col-span-2"><TextArea label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
  </CrudForm>;
}

export function ReportFormPage({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", category: "Keuangan", period: "", status: "draft", generatedAt: "", notes: "" });

  useEffect(() => {
    if (!edit || !id) return;
    reportsApi.detail(id).then((res) => {
      const data = res.data.data;
      setForm({ title: data.title || "", category: data.category || "Keuangan", period: data.period || "", status: data.status || "draft", generatedAt: toInputDate(data.generatedAt), notes: data.notes || "" });
    }).catch((err) => setError(err.response?.data?.message || "Gagal memuat laporan dari database."));
  }, [edit, id]);

  async function submit() {
    setError("");
    try {
      const payload = { ...form, generatedAt: form.generatedAt || null };
      if (edit && id) await reportsApi.update(id, payload);
      else await reportsApi.create(payload);
      router.push("/laporan");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan laporan.");
    }
  }

  return <CrudForm title={(edit ? "Edit" : "Tambah") + " Laporan"} subtitle="Kelola laporan operasional dan periode." error={error} onSubmit={submit} back="/laporan">
    <TextInput label="Judul Laporan" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
    <SelectInput label="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={[{ label: "Keuangan", value: "Keuangan" }, { label: "Invoice", value: "Invoice" }, { label: "Pelanggan", value: "Pelanggan" }, { label: "Marketing", value: "Marketing" }]} />
    <TextInput label="Periode" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="Mei 2026" />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }, { label: "Archived", value: "archived" }]} />
    <TextInput label="Tanggal Generate" type="date" value={form.generatedAt} onChange={(e) => setForm({ ...form, generatedAt: e.target.value })} />
    <div className="lg:col-span-2"><TextArea label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
  </CrudForm>;
}

export function SettingFormPage({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ settingKey: "", settingValue: "", settingGroup: "general", status: "active" });

  useEffect(() => {
    if (!edit || !id) return;
    settingsApi.detail(id)
      .then((res) => setForm(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat pengaturan dari database."));
  }, [edit, id]);

  async function submit() {
    setError("");
    try {
      if (edit && id) await settingsApi.update(id, form);
      else await settingsApi.create(form);
      router.push("/pengaturan");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan pengaturan.");
    }
  }

  return <CrudForm title={(edit ? "Edit" : "Tambah") + " Pengaturan"} subtitle="Kelola key-value konfigurasi aplikasi." error={error} onSubmit={submit} back="/pengaturan">
    <TextInput label="Setting Key" value={form.settingKey} onChange={(e) => setForm({ ...form, settingKey: e.target.value })} placeholder="company_name" />
    <TextInput label="Setting Value" value={form.settingValue} onChange={(e) => setForm({ ...form, settingValue: e.target.value })} />
    <SelectInput label="Grup" value={form.settingGroup} onChange={(e) => setForm({ ...form, settingGroup: e.target.value })} options={[{ label: "General", value: "general" }, { label: "System", value: "system" }, { label: "Billing", value: "billing" }, { label: "Security", value: "security" }]} />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ label: "Aktif", value: "active" }, { label: "Nonaktif", value: "nonactive" }]} />
  </CrudForm>;
}

export function ServicePackageFormPage({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", speedMbps: "", monthlyPrice: "", description: "", status: "active" });

  useEffect(() => {
    if (!edit || !id) return;
    productsApi.servicePackageDetail(id).then((res) => {
      const data = res.data?.data || res.data;
      if (data && (data.name || data.speedMbps || data.bandwidth)) {
        setForm({
          name: data.name || data.product_name || "",
          speedMbps: data.speedMbps ? String(data.speedMbps) : data.bandwidth ? String(data.bandwidth) : "",
          monthlyPrice: data.monthlyPrice ? String(data.monthlyPrice) : data.price ? String(data.price) : "",
          description: data.description || "",
          status: data.status === false ? "nonactive" : "active",
        });
      }
    }).catch(() => setError("Gagal memuat data paket layanan."));
  }, [edit, id]);

  async function submit() {
    setError("");
    try {
      const payload = {
        ...form,
        speedMbps: form.speedMbps ? Number(form.speedMbps) : null,
        monthlyPrice: Number(parseRupiah(form.monthlyPrice)),
      };
      if (edit && id) await productsApi.updateServicePackage(id, payload);
      else await productsApi.createServicePackage(payload);
      router.push("/pengaturan/paket-layanan");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan paket layanan.");
    }
  }

  return <CrudForm title={(edit ? "Edit" : "Tambah") + " Paket Layanan"} subtitle="Atur nama paket, kecepatan internet, harga bulanan, dan deskripsi penawaran." error={error} onSubmit={submit} back="/pengaturan/paket-layanan">
    <TextInput label="Nama Paket" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mega 50Mbps" />
    <TextInput label="Kecepatan (Mbps)" inputMode="numeric" value={form.speedMbps} onChange={(e) => setForm({ ...form, speedMbps: e.target.value.replace(/\D/g, "") })} placeholder="50" />
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">Harga Bulanan</span>
      <div className="flex h-11 w-full items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <span className="mr-2 shrink-0 font-semibold text-slate-500">Rp</span>
        <input inputMode="numeric" value={formatRupiahInput(form.monthlyPrice)} onChange={(e) => setForm({ ...form, monthlyPrice: parseRupiah(e.target.value) })} placeholder="0" className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400" />
      </div>
    </label>
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ label: "Aktif", value: "active" }, { label: "Nonaktif", value: "nonactive" }]} />
    <div className="lg:col-span-2"><TextArea label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat manfaat paket ini" /></div>
  </CrudForm>;
}

export function PaymentMethodFormPage({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", code: "", description: "", status: "active" });

  useEffect(() => {
    if (!edit || !id) return;
    const defaultPmList = [
      { id: "pm-1", name: "BCA Virtual Account", code: "BCA_VA", description: "Pembayaran otomatis via BCA Virtual Account.", status: "active" },
      { id: "pm-2", name: "Mandiri Virtual Account", code: "MANDIRI_VA", description: "Pembayaran otomatis via Mandiri Virtual Account.", status: "active" },
      { id: "pm-3", name: "QRIS", code: "QRIS", description: "Pembayaran instan QRIS semua e-wallet & m-banking.", status: "active" },
      { id: "pm-4", name: "Transfer Bank Manual", code: "BANK_TRANSFER", description: "Transfer rekening bank manual dengan bukti bayar.", status: "active" },
    ];
    const localPm = defaultPmList.find((pm) => pm.id === id || pm.code.toLowerCase() === id.toLowerCase());
    if (localPm) {
      setForm(localPm);
    }

    paymentMethodsApi.detail(id).then((res) => {
      const data = res.data?.data || res.data;
      if (data && data.name) {
        setForm({
          name: data.name || "",
          code: data.code || "",
          description: data.description || "",
          status: data.status || "active",
        });
      }
    }).catch(() => {
      if (!localPm) setError("Gagal memuat metode pembayaran.");
    });
  }, [edit, id]);

  async function submit() {
    setError("");
    try {
      if (edit && id) await paymentMethodsApi.update(id, form);
      else await paymentMethodsApi.create(form);
      router.push("/pengaturan/metode-pembayaran");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan metode pembayaran.");
    }
  }

  return <CrudForm title={(edit ? "Edit" : "Tambah") + " Metode Pembayaran"} subtitle="Atur nama metode, kode, status, dan catatan penggunaan." error={error} onSubmit={submit} back="/pengaturan/metode-pembayaran">
    <TextInput label="Nama Metode" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Transfer Bank" />
    <TextInput label="Kode" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="transfer_bank" />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ label: "Aktif", value: "active" }, { label: "Nonaktif", value: "nonactive" }]} />
    <div className="lg:col-span-2"><TextArea label="Deskripsi" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat metode pembayaran ini" /></div>
  </CrudForm>;
}

function CrudForm({ title, subtitle, error, children, onSubmit, back }: { title: string; subtitle: string; error: string; children: React.ReactNode; onSubmit: () => void; back: string }) {
  const router = useRouter();
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="p-6">
        {error ? <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">{children}</div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => router.push(back)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Batal</button>
            <button className="h-10 rounded-lg bg-[#6366F1] px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-200">Simpan</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
