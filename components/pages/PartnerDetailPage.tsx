"use client";

import api from "@/lib/api";
import { Badge, Card, DataTable, PageHeader, TableSkeleton } from "@/components/ui/AdminUI";
import { currency, date, monthName } from "@/lib/format";
import { Building2, FileText, MapPin, Phone, Ticket, Users } from "lucide-react";
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

export default function PartnerDetailPage({ id }: { id: string }) {
  const [detail, setDetail] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setLoading(true);
    setToast("");
    api.get(`/partners/${id}/detail`)
      .then((res) => setDetail(res.data.data))
      .catch((err) => {
        setDetail(null);
        setToast(err.response?.data?.message || "Gagal memuat detail mitra.");
      })
      .finally(() => setLoading(false));
  }, [id]);

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
      <PageHeader title={detail.name} subtitle="Detail mitra bisnis individual, pelanggan terdaftar, faktur & tagihan, dan tiket operasional." actionHref={`/users/mitra/${detail.id}/edit`} actionLabel="Edit Mitra" />
      {toast ? <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{toast}</div> : null}

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
    </div>
  );
}
