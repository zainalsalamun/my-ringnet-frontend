"use client";

import api from "@/lib/api";
import { Badge, Card, DataTable, PageHeader, TableSkeleton } from "@/components/ui/AdminUI";
import { currency, date, monthName } from "@/lib/format";
import { Building2, FileText, Loader2, MapPin, Phone, Search, Ticket, Trash2, UserPlus, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PartnerDetail = {
  id: string;
  partnerCode?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  area?: string | null;
  city?: string | null;
  status?: string | null;
  createdAt?: string | null;
  customers: any[];
  invoices: any[];
  tickets: any[];
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border-b border-slate-100 py-3">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value || "-"}</p>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">{icon}</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function ownerLabel(customer: any) {
  if (customer.partner?.name) return `Marketing: ${customer.partner.partnerCode || "-"} - ${customer.partner.name}`;
  if (customer.company?.name) return `Bisnis: ${customer.company.companyCode || "-"} - ${customer.company.name}`;
  return "Belum terdaftar ke marketing";
}

function CustomerAssignmentModal({ partnerId, onClose, onSaved }: { partnerId: string; onClose: () => void; onSaved: (detail: PartnerDetail) => void }) {
  const [rows, setRows] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError("");
      api.get(`/partners/${partnerId}/available-customers`, { params: { search: query, limit: 50 } })
        .then((res) => setRows(res.data.data || []))
        .catch((err) => {
          setRows([]);
          setError(err.response?.data?.message || "Gagal memuat pelanggan.");
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [partnerId, query]);

  function toggle(customerId: string) {
    setSelected((current) => current.includes(customerId) ? current.filter((id) => id !== customerId) : [...current, customerId]);
  }

  function save() {
    if (!selected.length) {
      setError("Pilih minimal satu pelanggan.");
      return;
    }
    setSaving(true);
    setError("");
    api.post(`/partners/${partnerId}/customers`, { customerIds: selected })
      .then((res) => {
        onSaved(res.data.data);
        onClose();
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal menambahkan pelanggan ke marketing."))
      .finally(() => setSaving(false));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-black text-slate-950">Tambah Pelanggan Marketing</h3>
            <p className="mt-1 text-sm text-slate-500">Pilih pelanggan yang sudah ada di database, lalu hubungkan ke marketing ini.</p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"><X size={18} /></button>
        </div>
        <div className="p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari ID pelanggan, nama, nomor telepon, area..." className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" autoFocus />
          </div>
          {error ? <div className="mt-3 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
          <div className="mt-4 max-h-[420px] overflow-y-auto rounded-xl border border-slate-200">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm font-semibold text-slate-400"><Loader2 size={18} className="animate-spin" /> Memuat pelanggan...</div>
            ) : rows.length ? rows.map((customer) => {
              const active = selected.includes(customer.id);
              return (
                <button key={customer.id} type="button" onClick={() => toggle(customer.id)} className={"flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 " + (active ? "bg-indigo-50" : "hover:bg-slate-50")}>
                  <span className={"mt-1 grid h-5 w-5 shrink-0 place-items-center rounded border text-xs font-black " + (active ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-transparent")}>✓</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-slate-900">{customer.customerCode || "-"} - {customer.name}</span>
                    <span className="mt-1 block text-sm text-slate-500">{customer.phone || "-"} · {customer.area || "-"} · {customer.city || "-"}</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-400">{customer.packageName || "Paket belum diisi"} · {ownerLabel(customer)}</span>
                  </span>
                </button>
              );
            }) : (
              <div className="px-4 py-12 text-center text-sm font-semibold text-slate-400">Pelanggan tidak ditemukan.</div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">{selected.length} pelanggan dipilih</p>
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700">Batal</button>
            <button onClick={save} disabled={saving || !selected.length} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-200 disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Simpan Pelanggan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartnerDetailPage({ id }: { id: string }) {
  const [detail, setDetail] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);

  function loadDetail() {
    setLoading(true);
    setToast("");
    api.get(`/partners/${id}/detail`)
      .then((res) => setDetail(res.data.data))
      .catch((err) => {
        setDetail(null);
        setToast(err.response?.data?.message || "Gagal memuat detail mitra.");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDetail();
  }, [id]);

  function detachCustomer(customer: any) {
    if (!window.confirm(`Lepas ${customer.name} dari marketing ini?`)) return;
    api.delete(`/partners/${id}/customers/${customer.id}`)
      .then((res) => {
        setDetail(res.data.data);
        setToast("Pelanggan berhasil dilepas dari marketing.");
      })
      .catch((err) => setToast(err.response?.data?.message || "Gagal melepas pelanggan."));
  }

  const outstanding = useMemo(() => (
    detail?.invoices.filter((invoice) => invoice.status !== "PAID").reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0) || 0
  ), [detail]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Detail Mitra Bisnis" subtitle="Memuat profil mitra, pelanggan, tagihan, dan tiket." />
        <div className="mb-6 grid gap-4 md:grid-cols-3"><TableSkeleton columns={3} rows={1} showHeader={false} /></div>
        <TableSkeleton columns={7} />
      </div>
    );
  }

  if (!detail) {
    return (
      <div>
        <PageHeader title="Detail Mitra Bisnis" subtitle="Profil mitra, pelanggan, tagihan, dan tiket." />
        <Card className="p-6 text-sm font-semibold text-rose-600">{toast || "Mitra tidak ditemukan."}</Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={detail.name} subtitle="Detail marketing/mitra individual, pelanggan terdaftar, faktur & tagihan, dan tiket operasional." actionHref={`/users/mitra/${detail.id}/edit`} actionLabel="Edit Mitra" />
      {toast ? <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{toast}</div> : null}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <SummaryCard icon={<Users size={20} />} label="Pelanggan" value={String(detail.customers.length)} />
        <SummaryCard icon={<FileText size={20} />} label="Faktur & Tagihan" value={String(detail.invoices.length)} />
        <SummaryCard icon={<Ticket size={20} />} label="Tiket" value={String(detail.tickets.length)} />
        <SummaryCard icon={<Building2 size={20} />} label="Tunggakan" value={currency(outstanding)} />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 p-6 text-white">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/95 text-xl font-black text-indigo-600 shadow-lg">
              {detail.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="mt-3 text-center">
              <h2 className="text-xl font-black">{detail.name}</h2>
              <p className="text-xs font-semibold text-white/80">ID Mitra {detail.partnerCode || "-"}</p>
            </div>
          </div>
          <div className="p-5">
            <InfoRow label="Status" value={detail.status || "active"} />
            <InfoRow label="ID Mitra" value={detail.partnerCode} />
            <InfoRow label="Nama Mitra Individual" value={detail.name} />
            <InfoRow label="Nomor Telepon" value={detail.phone} />
            <InfoRow label="Alamat Surel" value={detail.email} />
            <InfoRow label="Area" value={detail.area} />
            <InfoRow label="Kota" value={detail.city} />
            <InfoRow label="Tanggal Bergabung" value={date(detail.createdAt)} />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <MapPin size={18} className="text-indigo-500" />
            <h2 className="font-black text-slate-950">Lokasi dan Kontak</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <Phone size={20} className="text-indigo-500" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">Kontak Utama</p>
              <p className="mt-1 font-bold text-slate-900">{detail.phone || "-"}</p>
              <p className="mt-1 text-sm text-slate-500">{detail.email || "Email belum tersedia"}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <MapPin size={20} className="text-indigo-500" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">Coverage Area</p>
              <p className="mt-1 font-bold text-slate-900">{detail.area || "-"}</p>
              <p className="mt-1 text-sm text-slate-500">{detail.city || "-"}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <DataTable
          title="Pelanggan Terdaftar"
          data={detail.customers}
          searchPlaceholder="Cari pelanggan mitra..."
          headerAction={(
            <button onClick={() => setAssignOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#6366F1] px-3 text-xs font-bold text-white shadow-sm shadow-indigo-200">
              <UserPlus size={15} /> Tambah Pelanggan
            </button>
          )}
          extraActions={(row: any) => (
            <button onClick={() => detachCustomer(row)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-rose-500 hover:border-rose-200 hover:bg-rose-50" title="Lepas dari marketing"><Trash2 size={15} /></button>
          )}
          columns={[
            { key: "name", header: "Nama", render: (row: any) => <Link href={`/users/pelanggan/${row.id}`} className="font-semibold text-indigo-600 hover:underline">{row.name}</Link> },
            { key: "phone", header: "Kontak" },
            { key: "area", header: "Area" },
            { key: "city", header: "Kota" },
            { key: "packageName", header: "Paket" },
            { key: "invoiceCount", header: "Total Tagihan" },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
          ]}
        />

        <DataTable
          title="Faktur & Tagihan"
          data={detail.invoices}
          searchPlaceholder="Cari invoice pelanggan mitra..."
          columns={[
            { key: "noInvoice", header: "Nomor Tagihan", render: (row: any) => <Link href={`/internet-services/${row.id}`} className="font-semibold text-indigo-600 hover:underline">{row.noInvoice}</Link> },
            { key: "customerName", header: "Pelanggan" },
            { key: "serviceType", header: "Nama Tagihan" },
            { key: "periodMonth", header: "Periode", render: (row: any) => `${monthName(row.periodMonth)} ${row.periodYear}` },
            { key: "amount", header: "Total Harga", render: (row: any) => currency(row.amount) },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
            { key: "dueDate", header: "Tanggal", render: (row: any) => date(row.dueDate) },
          ]}
        />

        <DataTable
          title="Tiket"
          data={detail.tickets}
          searchPlaceholder="Cari tiket mitra..."
          columns={[
            { key: "ticketNo", header: "Nomor Tiket", render: (row: any) => <Link href={`/users/mitra/${detail.id}/tickets/${row.id}`} className="font-semibold text-indigo-600 hover:underline">{row.ticketNo}</Link> },
            { key: "title", header: "Nama" },
            { key: "customer", header: "Pelanggan", render: (row: any) => row.customer?.name || "-" },
            { key: "priority", header: "Prioritas", render: (row: any) => <Badge value={row.priority} /> },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
            { key: "createdAt", header: "Tanggal", render: (row: any) => date(row.createdAt) },
          ]}
        />
      </div>

      {assignOpen ? <CustomerAssignmentModal partnerId={detail.id} onClose={() => setAssignOpen(false)} onSaved={(nextDetail) => { setDetail(nextDetail); setToast("Pelanggan berhasil ditambahkan ke marketing."); }} /> : null}
    </div>
  );
}
