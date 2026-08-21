"use client";

import { Badge, Card, DataTable, PageHeader } from "@/components/ui/AdminUI";
import { currency, date } from "@/lib/format";
import { Edit, FileText, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { customersApi } from "@/src/features/customers/api";

import api from "@/lib/api";

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
    let active = true;

    async function loadCustomer() {
      setLoading(true);
      setError("");

      try {
        let rawData: any = null;

        // 1. Try rawRead GET /customer/read/{id}
        try {
          const res = await customersApi.rawRead(id);
          const candidate = res.data?.data || res.data;
          if (candidate && (candidate.name || candidate.username || candidate.customer_id)) {
            rawData = candidate;
          }
        } catch {
          // ignore
        }

        // 2. If not found, search in POST /customer/list with globalFilter
        if (!rawData) {
          try {
            const listRes = await customersApi.rawList({
              pageSize: 50,
              pageIndex: 0,
              sorting: [],
              columnFilters: [],
              globalFilter: id,
              withDeleted: false,
            });
            const list = listRes.data?.data?.data || listRes.data?.data || listRes.data?.rows || [];
            if (Array.isArray(list)) {
              const matched = list.find((item: any) =>
                String(item.customer_id || "") === id ||
                String(item.id || "") === id ||
                String(item._id || "") === id ||
                String(item.name || "").toLowerCase().includes(id.toLowerCase())
              );
              if (matched) rawData = matched;
            }
          } catch {
            // ignore
          }
        }

        // 3. Enrich with broadband info if available (POST /broadband/list)
        let broadbandData: any = null;
        try {
          const bbRes = await api.post("/broadband/list", {
            pageSize: 10,
            pageIndex: 0,
            sorting: [],
            columnFilters: [],
            globalFilter: id,
          });
          const bbList = bbRes.data?.data?.data || bbRes.data?.data || bbRes.data?.rows || [];
          if (Array.isArray(bbList) && bbList.length > 0) {
            broadbandData = bbList.find((b: any) =>
              String(b.customer_id || b.customer?.customer_id || "") === id ||
              String(b.id || "") === id
            ) || bbList[0];
          }
        } catch {
          // ignore
        }

        if (!active) return;

        if (rawData || broadbandData) {
          const raw = rawData || {};
          const bb = broadbandData || {};
          const fullAddress = [raw.address, raw.village, raw.district, raw.city, raw.area, raw.province]
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(", ") || raw.address || "-";

          const normalized = {
            id: raw.customer_id || raw.id || bb.customer_id || id,
            customerCode: raw.customer_id || raw.customerCode || bb.customer_id || id,
            name: raw.name || raw.username || bb.customer_name || bb.name || `Pelanggan ${id}`,
            address: fullAddress,
            area: raw.area || raw.district || raw.village || "-",
            city: raw.city || raw.province || "-",
            coordinate: raw.coordinate || bb.coordinate || "-",
            phone: raw.phone || bb.phone || "-",
            email: raw.email || bb.email || (raw.username && raw.username.includes("@") ? raw.username : "-"),
            ktp: raw.ktp || raw.identity_card || raw.nik || "-",
            npwp: raw.npwp || raw.tax_id || "-",
            customerType: raw.type || raw.customerType || "home",
            supportPayment: raw.pay_support || raw.supportPayment || raw.payment_method || bb.supportPayment || "BCA Virtual Account",
            supportTechnical: raw.tech_support || raw.supportTechnical || bb.pop_name || bb.location_point_name || "-",
            walletBalance: raw.walletBalance || raw.balance || 0,
            status: raw.status === false || raw.status === "nonactive" ? "nonactive" : "active",
            createdAt: raw.created_at || raw.createdAt || bb.created_at || new Date().toISOString(),
            packageName: raw.package_name || raw.packageName || bb.package_name || bb.profile_name || bb.service_type || "BROADBAND FIBER",
            invoices: raw.invoices || (bb.invoices ? bb.invoices : []),
            tickets: raw.tickets || [],
          };
          setCustomer(normalized);
          setInvoices(normalized.invoices);
          setTickets(normalized.tickets);
        } else {
          setError(`Data pelanggan dengan ID ${id} tidak ditemukan.`);
        }
      } catch (err: any) {
        if (!active) return;
        setError(err.response?.data?.message || "Gagal memuat detail pelanggan dari database.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCustomer();
    return () => { active = false; };
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

function parseCoordinate(value?: string | null) {
  if (!value) return null;
  const [latRaw, lngRaw] = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isFinite(latRaw) || !Number.isFinite(lngRaw)) return null;
  if (Math.abs(latRaw) > 90 || Math.abs(lngRaw) > 180) return null;
  return { lat: latRaw, lng: lngRaw };
}

function OpenStreetMap({ coordinate, label }: { coordinate?: string | null; label?: string }) {
  const point = parseCoordinate(coordinate);
  if (!point) {
    return (
      <div className="grid min-h-[400px] place-items-center p-6 text-center">
        <div>
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-slate-400 shadow-sm">
            <MapPin size={24} />
          </div>
          <p className="mt-3 font-semibold text-slate-700">Koordinat belum tersedia</p>
          <p className="mt-1 text-sm text-slate-500">Tambahkan koordinat pelanggan agar peta OpenStreetMap tampil di sini.</p>
        </div>
      </div>
    );
  }

  const delta = 0.012;
  const bbox = [
    point.lng - delta,
    point.lat - delta,
    point.lng + delta,
    point.lat + delta,
  ].join(",");
  const marker = `${point.lat},${point.lng}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`;
  const viewUrl = `https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(point.lat))}&mlon=${encodeURIComponent(String(point.lng))}#map=16/${encodeURIComponent(String(point.lat))}/${encodeURIComponent(String(point.lng))}`;

  return (
    <div className="relative h-full min-h-[400px]">
      <iframe
        title={`Peta lokasi ${label || "pelanggan"}`}
        src={src}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute left-4 top-4 rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur">
        {coordinate}
      </div>
      <a
        href={viewUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-4 right-4 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-indigo-600 shadow-lg hover:bg-indigo-50"
      >
        Buka OpenStreetMap
      </a>
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
