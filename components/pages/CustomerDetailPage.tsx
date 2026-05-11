"use client";

import api from "@/lib/api";
import { Badge, Card, DataTable, PageHeader } from "@/components/ui/AdminUI";
import { currency, date } from "@/lib/format";
import { Edit, FileText, Map as MapIcon } from "lucide-react";
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
    setLoading(true);
    setError("");
    api.get("/customers/" + id + "/detail")
      .then((res) => {
        const data = res.data.data;
        setCustomer(data);
        setInvoices(data.invoices || []);
        setTickets(data.tickets || []);
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat detail pelanggan dari database."))
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
            <InfoRow label="Status" value={<Badge value={customer.status || "active"} />} action={<Link href={`/users/pelanggan/${id}/edit`} className="text-[#6366F1]"><Edit size={16} /></Link>} />
            <InfoRow label="Nama Pengguna" value={customer.name} />
            <InfoRow label="Alamat" value={customer.address || `${customer.area || ''}, ${customer.city || ''}`} />
            <InfoRow label="Area" value={customer.area || "-"} />
            <InfoRow label="Kota" value={customer.city || "-"} />
            <InfoRow label="Nomor Telepon" value={customer.phone || "-"} />
            <InfoRow label="Alamat Surel" value={customer.email || "-"} />
            <InfoRow label="KTP" value={customer.ktp || "-"} />
            <InfoRow label="NPWP" value={customer.npwp || "-"} />
            <InfoRow label="Jenis Pelanggan" value={customer.customerType || "Perumahan / Apartemen / Kos"} />
            <InfoRow label="Dompet" value={currency(customer.walletBalance || 0)} />
            <InfoRow label="Tanggal" value={date(customer.createdAt || new Date().toISOString())} />
          </div>
          <div className="border-t border-slate-100 p-6">
            <Link href={`/users/pelanggan/${id}/documents`} className="flex items-center gap-2 font-semibold text-slate-700 hover:text-indigo-600">
              <FileText size={18} /> Dokumen Pendukung Lainnya
            </Link>
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-slate-100 p-0 min-h-[400px]">
          <div className="absolute inset-0 bg-slate-200 bg-cover bg-center opacity-50" />
          <div className="absolute inset-0 grid place-items-center">
             <div className="flex flex-col items-center gap-3">
               <div className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-xl text-emerald-600"><MapIcon size={24} /></div>
               <p className="font-semibold text-slate-600 bg-white/80 px-4 py-1.5 rounded-full backdrop-blur-sm">Peta Lokasi Tersedia</p>
             </div>
          </div>
        </Card>
      </div>

      <div className="mt-6">
         <Card className="p-6">
            <div className="flex flex-wrap items-center gap-2 mb-6">
               <Badge value="Aktif" />
               <span className="font-bold text-[#6366F1] uppercase tracking-wide">{customer.packageName || "BROADBAND FIBER BRONZE 25"} - {customer.email || "user@ring.net.id"}</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-center">
               <div className="pt-4 sm:pt-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Unduh</p>
                  <p className="mt-2 text-3xl font-medium text-slate-700">4.84 GB</p>
               </div>
               <div className="pt-4 sm:pt-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Unggah</p>
                  <p className="mt-2 text-3xl font-medium text-slate-700">860.26 MB</p>
               </div>
               <div className="pt-4 sm:pt-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Uptime</p>
                  <p className="mt-2 text-3xl font-medium text-slate-700">08:07:14</p>
               </div>
            </div>
         </Card>
      </div>

      <div className="mt-6 space-y-6">
         {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
         <DataTable title="Faktur & Tagihan" data={invoices} 
            columns={[
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               { key: "noInvoice", header: "Nomor Tagihan", render: (row: any) => <Link href={`/internet-services/${row.id}`} className="text-indigo-600 font-medium">{row.noInvoice}</Link> },
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               { key: "amount", header: "Total Harga", render: (row: any) => currency(row.amount) },
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               { key: "serviceType", header: "Nama Tagihan", render: (row: any) => `Tagihan ${row.serviceType}` },
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               { key: "createdAt", header: "Tanggal", render: (row: any) => date(row.createdAt) }
            ]} 
         />

         {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
         <DataTable title="Tiket" data={tickets} 
            columns={[
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               { key: "ticketNo", header: "Nomor Tiket", render: (row: any) => <span className="text-[#6366F1] font-medium">{row.ticketNo}</span> },
               { key: "title", header: "Nama" },
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
               { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> }
            ]} 
         />
      </div>
    </div>
  );
}

function InfoRow({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr_auto] sm:grid-cols-[200px_1fr_auto] items-center py-3.5 gap-4">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="text-sm text-slate-600 break-words">{value}</span>
      {action && <div>{action}</div>}
    </div>
  );
}
