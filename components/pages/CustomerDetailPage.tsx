"use client";

import { Badge, Card, DataTable, PageHeader } from "@/components/ui/AdminUI";
import { currency, date } from "@/lib/format";
import { formatErrorMessage } from "@/lib/error";
import { customerService } from "@/services";
import { Edit, FileText, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CustomerDetailPage({ id }: { id: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customer, setCustomer] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [invoices, setInvoices] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerService
      .getDetail(id)
      .then((raw) => {
        if (!raw) throw new Error("Data pelanggan tidak ditemukan.");
        const normalized = {
          id: raw.customer_id || raw.id || id,
          name: raw.name || raw.username || "-",
          address: raw.address || "-",
          area: raw.area || "-",
          city: raw.city || raw.area || "-",
          coordinate: raw.coordinate || "-",
          phone: raw.phone || "-",
          email: raw.email || "-",
          ktp: raw.ktp || "-",
          npwp: raw.npwp || "-",
          customerType: raw.type || raw.customerType || "home",
          supportPayment: raw.pay_support || raw.supportPayment || "-",
          supportTechnical: raw.tech_support || raw.supportTechnical || "-",
          walletBalance: raw.walletBalance || 0,
          status: raw.status === false ? "nonactive" : raw.status === true || raw.status === "active" ? "active" : raw.status || "active",
          createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
          packageName: raw.package_name || raw.packageName || "BROADBAND FIBER",
          invoices: raw.invoices || [],
          tickets: raw.tickets || [],
        };
        setCustomer(normalized);
        setInvoices(normalized.invoices);
        setTickets(normalized.tickets);
      })
      .catch((err) => setError(formatErrorMessage(err, "Gagal memuat detail pelanggan dari database.")))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center font-medium text-slate-500">Memuat detail pelanggan...</div>;
  if (!customer) return <div className="p-10 text-center font-medium text-slate-500">{error || "Pelanggan tidak ditemukan."}</div>;

  return (
    <div>
      <PageHeader title="Detail Pelanggan" subtitle="Informasi lengkap pelanggan, status layanan, dan riwayat." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <div className="divide-y divide-slate-100 p-6">
            <InfoRow
              label="Status"
              value={<Badge value={customer.status || "active"} />}
              action={
                <Link href={`/users/pelanggan/${id}/edit`} className="text-[#6366F1]">
                  <Edit size={16} />
                </Link>
              }
            />
            <InfoRow label="Nama Pengguna" value={customer.name} />
            <InfoRow label="Alamat" value={customer.address || `${customer.area || ""}, ${customer.city || ""}`} />
            <InfoRow label="Area" value={customer.area || "-"} />
            <InfoRow label="Kota" value={customer.city || "-"} />
            <InfoRow label="Koordinat" value={customer.coordinate || "-"} />
            <InfoRow label="Nomor Telepon" value={customer.phone || "-"} />
            <InfoRow label="Alamat Surel" value={customer.email || "-"} />
            <InfoRow label="KTP" value={customer.ktp || "-"} />
            <InfoRow label="NPWP" value={customer.npwp || "-"} />
            <InfoRow label="Jenis Pelanggan" value={customer.customerType || "Perumahan / Apartemen / Kos"} />
            <InfoRow label="Dukungan Pembayaran" value={customer.supportPayment || "-"} />
            <InfoRow label="Dukungan Teknis" value={customer.supportTechnical || "-"} />
            <InfoRow label="Dompet" value={currency(customer.walletBalance || 0)} />
            <InfoRow label="Tanggal" value={date(customer.createdAt || new Date().toISOString())} />
          </div>
          <div className="border-t border-slate-100 p-6">
            <Link href={`/users/pelanggan/${id}/documents`} className="flex items-center gap-2 font-semibold text-slate-700 hover:text-indigo-600">
              <FileText size={18} /> Dokumen Pendukung Lainnya
            </Link>
          </div>
        </Card>

        <Card className="h-full min-h-[400px] overflow-hidden bg-slate-100 p-0">
          <OpenStreetMap coordinate={customer.coordinate} label={customer.name} />
        </Card>
      </div>

      <div className="mt-8 space-y-8">
        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Riwayat Faktur</h2>
          <DataTable
            data={invoices}
            searchPlaceholder="Cari nomor invoice, paket, status..."
            columns={[
              { key: "noInvoice", header: "Nomor Faktur", render: (row) => <span className="font-semibold text-slate-800">{row.noInvoice || row.id}</span> },
              { key: "serviceType", header: "Layanan", render: (row) => row.serviceType || customer.packageName },
              { key: "amount", header: "Total Tagihan", render: (row) => currency(row.amount || 0) },
              { key: "dueDate", header: "Jatuh Tempo", render: (row) => date(row.dueDate) },
              { key: "status", header: "Status", render: (row) => <Badge value={row.status || "unpaid"} /> },
            ]}
          />
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Riwayat Tiket</h2>
          <DataTable
            data={tickets}
            searchPlaceholder="Cari nomor tiket, subjek, status..."
            columns={[
              { key: "ticketNo", header: "Nomor Tiket", render: (row) => <span className="font-semibold text-slate-800">{row.ticketNo || row.id}</span> },
              { key: "title", header: "Subjek Laporan" },
              { key: "priority", header: "Prioritas", render: (row) => <Badge value={row.priority || "normal"} /> },
              { key: "status", header: "Status", render: (row) => <Badge value={row.status || "open"} /> },
              { key: "createdAt", header: "Tanggal", render: (row) => date(row.createdAt) },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-800">{value}</span>
        {action}
      </div>
    </div>
  );
}

function OpenStreetMap({ coordinate, label }: { coordinate?: string; label?: string }) {
  const parsed = parseCoordinate(coordinate);

  if (!parsed) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 p-6 text-center text-slate-500">
        <MapPin size={24} className="text-slate-400" />
        <p className="text-sm font-semibold">Koordinat belum tersedia</p>
        <p className="text-xs text-slate-400">Tambahkan latitude dan longitude pada menu edit profil pelanggan.</p>
      </div>
    );
  }

  const { lat, lng } = parsed;
  const delta = 0.008;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="flex h-full min-h-[400px] flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-1.5 font-bold text-slate-800">
          <MapPin size={15} className="text-rose-500" /> {label || "Lokasi Pelanggan"}
        </span>
        <span className="font-mono text-slate-500">{lat.toFixed(6)}, {lng.toFixed(6)}</span>
      </div>
      <div className="relative min-h-[350px] flex-1 bg-slate-100">
        <iframe
          src={iframeSrc}
          title={`Peta Lokasi ${label || "Pelanggan"}`}
          className="h-full min-h-[350px] w-full border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function parseCoordinate(value?: string) {
  if (!value || typeof value !== "string") return null;
  const cleaned = value.replace(/[^\d.,\- ]/g, "").trim();
  const parts = cleaned.split(/[\s,]+/).filter(Boolean).map((part) => Number(part));
  if (parts.length < 2) return null;
  const [lat, lng] = parts;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

export default CustomerDetailPage;
