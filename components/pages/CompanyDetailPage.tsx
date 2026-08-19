"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { Badge, Card, DataTable, PageHeader } from "@/components/ui/AdminUI";
import { currency, date } from "@/lib/format";
import { formatErrorMessage } from "@/lib/error";
import { companyService } from "@/services";
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
    companyService
      .getDetail(id)
      .then((raw) => {
        if (!raw) throw new Error("Data bisnis tidak ditemukan.");
        setCompany({
          id: raw.id || raw.partner_id || raw.customer_id || id,
          companyCode: raw.companyCode || raw.partnerCode || raw.partner_id || raw.customer_id || id,
          name: raw.name || raw.company_name || raw.username || "-",
          email: raw.email || "-",
          phone: raw.phone || raw.pic_phone || "-",
          area: raw.area || "-",
          city: raw.city || raw.regency || "-",
          address: raw.address || "-",
          coordinate: raw.coordinate || "",
          status: raw.status === false ? "nonactive" : raw.status === true || raw.status === "active" ? "active" : raw.status || "active",
          ktp: raw.ktp || raw.pic_ktp || "-",
          npwp: raw.npwp || "-",
          nib: raw.nib || "-",
          picName: raw.pic_name || raw.picName || raw.contact_person || "-",
          picPhone: raw.pic_phone || raw.picPhone || "-",
          picEmail: raw.pic_email || raw.picEmail || "-",
          packageName: raw.package_name || raw.packageName || raw.product || "-",
          createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
          customers: raw.customers || [],
          products:
            raw.products ||
            (raw.package_name || raw.packageName || raw.product
              ? [
                  {
                    id: "main-product",
                    name: raw.package_name || raw.packageName || raw.product,
                    capacity: raw.capacity || "-",
                    price: raw.package_price || raw.price || 0,
                    vlanId: raw.vlan_id || "-",
                  },
                ]
              : []),
          invoices: raw.invoices || [],
          tickets: raw.tickets || [],
        });
      })
      .catch((err) => setError(formatErrorMessage(err, "Gagal memuat detail bisnis dari database.")))
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
          <InfoRow
            label="Status"
            value={<Badge value={company.status || "active"} />}
            action={
              <Link href={`/users/bisnis/${company.id}/edit`} className="text-[#6366F1]">
                <Edit size={16} />
              </Link>
            }
          />
          <InfoRow label="ID Bisnis" value={company.companyCode || "-"} />
          <InfoRow label="Nama Perusahaan" value={company.name || "-"} />
          <InfoRow label="Alamat" value={company.address || [company.area, company.city].filter(Boolean).join(", ") || "-"} />
          <InfoRow label="Area" value={company.area || "-"} />
          <InfoRow label="Kota" value={company.city || "-"} />
          <InfoRow label="Nomor Telepon" value={company.phone || "-"} />
          <InfoRow label="Alamat Surel" value={company.email || "-"} />
          <InfoRow label="PIC" value={company.picName || "-"} />
          <InfoRow label="Kontak PIC" value={[company.picPhone, company.picEmail].filter(Boolean).join(" / ") || "-"} />
          <InfoRow label="KTP" value={company.ktp || "-"} />
          <InfoRow label="NPWP" value={company.npwp || "-"} />
          <InfoRow label="NIB" value={company.nib || "-"} />
          <InfoRow label="Jenis Pelanggan" value="Perusahaan" />
          <InfoRow label="Produk" value={company.packageName || "-"} />
          <InfoRow label="Dompet" value={currency(0)} />
          <InfoRow label="Tanggal" value={date(company.createdAt)} />
          <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
            <Link
              href={`/dokumen/legalitas?companyId=${company.id}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline"
            >
              <FileText size={15} /> Dokumen Legalitas
            </Link>
            <Link
              href={`/mitra/sla?companyId=${company.id}`}
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline"
            >
              <MapIcon size={15} /> Monitoring SLA
            </Link>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 text-base font-bold text-slate-950">Produk & Kapasitas Layanan</h2>
            <DataTable
              data={company.products}
              columns={[
                { key: "name", header: "Nama Paket / Layanan", render: (row: any) => <span className="font-semibold text-slate-900">{row.name}</span> },
                { key: "capacity", header: "Kapasitas", render: (row: any) => row.capacity || "-" },
                { key: "price", header: "Biaya Bulanan", render: (row: any) => currency(row.price) },
                { key: "vlanId", header: "VLAN", render: (row: any) => row.vlanId || "-" },
              ]}
            />
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-base font-bold text-slate-950">Customer Terkait</h2>
            <DataTable
              data={company.customers}
              searchPlaceholder="Cari customer perumahan..."
              columns={[
                { key: "customerCode", header: "ID", render: (row: any) => <span className="font-bold text-indigo-600">{row.customerCode || row.id}</span> },
                { key: "name", header: "Nama", render: (row: any) => <span className="font-semibold text-slate-900">{row.name}</span> },
                { key: "phone", header: "Telepon" },
                { key: "status", header: "Status", render: (row: any) => <Badge value={row.status || "active"} /> },
              ]}
            />
          </Card>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Riwayat Faktur Bisnis</h2>
          <DataTable
            data={company.invoices}
            searchPlaceholder="Cari faktur bisnis..."
            columns={[
              { key: "noInvoice", header: "Nomor Faktur", render: (row: any) => <span className="font-semibold text-slate-800">{row.noInvoice || row.id}</span> },
              { key: "serviceType", header: "Layanan", render: (row: any) => row.serviceType || company.packageName },
              { key: "amount", header: "Total Tagihan", render: (row: any) => currency(row.amount || 0) },
              { key: "dueDate", header: "Jatuh Tempo", render: (row: any) => date(row.dueDate) },
              { key: "status", header: "Status", render: (row: any) => <Badge value={row.status || "unpaid"} /> },
            ]}
          />
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Riwayat Tiket</h2>
          <DataTable
            data={company.tickets}
            searchPlaceholder="Cari tiket..."
            columns={[
              { key: "ticketNo", header: "Nomor Tiket", render: (row: any) => <span className="font-semibold text-slate-800">{row.ticketNo || row.id}</span> },
              { key: "title", header: "Subjek Laporan" },
              { key: "priority", header: "Prioritas", render: (row: any) => <Badge value={row.priority || "normal"} /> },
              { key: "status", header: "Status", render: (row: any) => <Badge value={row.status || "open"} /> },
              { key: "createdAt", header: "Tanggal", render: (row: any) => date(row.createdAt) },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
