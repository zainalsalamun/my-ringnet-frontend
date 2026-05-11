"use client";

import api from "@/lib/api";
import { Badge, Card, DataTable, PageHeader } from "@/components/ui/AdminUI";
import { currency, date } from "@/lib/format";
import { Building2, Edit, FileText, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function InfoRow({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr_auto] items-center gap-4 border-b border-slate-100 py-3.5 sm:grid-cols-[200px_1fr_auto]">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="break-words text-sm text-slate-600">{value}</span>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export default function CompanyDetailPage({ id }: { id: string }) {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    api.get(`/companies/${id}/detail`)
      .then((res) => setCompany(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat detail bisnis dari database."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center font-medium text-slate-500">Memuat detail bisnis...</div>;
  if (!company) return <div className="p-10 text-center font-medium text-slate-500">{error || "Bisnis / Perusahaan tidak ditemukan."}</div>;

  return (
    <div>
      <PageHeader title={company.name} subtitle="Detail bisnis/perusahaan, produk, faktur & tagihan, dan tiket operasional." />

      <Card className="mb-6 overflow-hidden border-0">
        <div className="relative grid min-h-32 place-items-center bg-[url('/assets/logo.png')] bg-cover bg-center px-6 py-8 text-center text-white">
          <div className="absolute inset-0 bg-slate-950/55" />
          <div className="relative">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/95 text-indigo-600 shadow-lg">
              <Building2 size={30} />
            </div>
            <h1 className="mt-3 text-xl font-black">{company.name}</h1>
            <p className="text-xs font-semibold text-white/80">{company.companyCode || "-"}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <InfoRow label="Status" value={<Badge value={company.status || "active"} />} action={<Link href={`/users/bisnis/${company.id}/edit`} className="text-[#6366F1]"><Edit size={16} /></Link>} />
          <InfoRow label="ID Mitra" value={company.companyCode || "-"} />
          <InfoRow label="Nama Pengguna" value={company.name || "-"} />
          <InfoRow label="Alamat" value={[company.area, company.city].filter(Boolean).join(", ") || "-"} />
          <InfoRow label="Area" value={company.area || "-"} />
          <InfoRow label="Kota" value={company.city || "-"} />
          <InfoRow label="Nomor Telepon" value={company.phone || "-"} />
          <InfoRow label="Alamat Surel" value={company.email || "-"} />
          <InfoRow label="KTP" value="-" />
          <InfoRow label="NPWP" value="-" />
          <InfoRow label="Jenis Pelanggan" value="Perusahaan" />
          <InfoRow label="Dompet" value={currency(0)} />
          <InfoRow label="Tanggal" value={date(company.createdAt)} />
          <div className="pt-5">
            <Link href={`/dokumen/legalitas-mitra?company=${company.id}`} className="flex items-center gap-2 font-semibold text-slate-700 hover:text-indigo-600">
              <FileText size={18} /> Dokumen Pendukung Lainnya
            </Link>
          </div>
        </Card>

        <Card className="relative min-h-[400px] overflow-hidden bg-slate-100 p-0">
          <div className="absolute inset-0 bg-slate-200 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.22),transparent_28%),linear-gradient(135deg,rgba(14,165,233,0.18),rgba(15,23,42,0.04))]" />
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-emerald-600 shadow-xl"><MapIcon size={24} /></div>
              <p className="rounded-full bg-white/85 px-4 py-1.5 font-semibold text-slate-600 backdrop-blur-sm">{company.area || "Area"} / {company.city || "Kota"}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 space-y-6">
        <DataTable
          title="Pelanggan Terdaftar"
          data={company.customers || []}
          searchPlaceholder="Cari pelanggan perusahaan..."
          columns={[
            { key: "name", header: "Nama", render: (row: any) => <Link href={`/users/pelanggan/${row.id}`} className="font-semibold text-indigo-600 hover:underline">{row.name}</Link> },
            { key: "phone", header: "Kontak", render: (row: any) => row.phone || "-" },
            { key: "area", header: "Area", render: (row: any) => row.area || "-" },
            { key: "city", header: "Kota", render: (row: any) => row.city || "-" },
            { key: "packageName", header: "Paket", render: (row: any) => row.packageName || "-" },
            { key: "invoiceCount", header: "Invoice", render: (row: any) => row.invoiceCount || 0 },
            { key: "outstandingAmount", header: "Tunggakan", render: (row: any) => currency(row.outstandingAmount || 0) },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
          ]}
        />

        <DataTable
          title="Produk"
          data={company.products || []}
          searchPlaceholder="Cari produk perusahaan..."
          columns={[
            { key: "name", header: "Nama", render: (row: any) => <span className="font-semibold text-indigo-600">{row.name}</span> },
            { key: "capacity", header: "Kapasitas", render: (row: any) => row.capacity || "-" },
            { key: "price", header: "Harga", render: (row: any) => currency(row.price) },
            { key: "vlanId", header: "VLAN ID", render: (row: any) => row.vlanId || "-" },
          ]}
        />

        <DataTable
          title="Faktur & Tagihan"
          data={company.invoices || []}
          searchPlaceholder="Cari invoice perusahaan..."
          columns={[
            { key: "noInvoice", header: "Nomor Tagihan", render: (row: any) => <Link href={`/internet-services/${row.id}`} className="font-semibold text-indigo-600 hover:underline">{row.noInvoice}</Link> },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
            { key: "amount", header: "Total Harga", render: (row: any) => currency(row.amount) },
            { key: "serviceType", header: "Nama Tagihan" },
            { key: "dueDate", header: "Tanggal", render: (row: any) => date(row.dueDate) },
          ]}
        />

        <DataTable
          title="Tiket"
          data={company.tickets || []}
          searchPlaceholder="Cari tiket perusahaan..."
          columns={[
            { key: "ticketNo", header: "Nomor Tiket", render: (row: any) => <span className="font-semibold text-indigo-600">{row.ticketNo}</span> },
            { key: "title", header: "Nama" },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
          ]}
        />
      </div>
    </div>
  );
}
