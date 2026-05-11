"use client";

import { Badge, Card, PageHeader, StatCard } from "@/components/ui/AdminUI";
import api from "@/lib/api";
import { currency, date, monthName } from "@/lib/format";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { invoices } from "@/lib/fallback-data";
import { Building2, Download, FileText, Receipt, Settings, Shield, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

export function InvoiceDetailPage({ id }: { id: string }) {
  const [invoice, setInvoice] = useState<any>(invoices.find((item) => String(item.id) === String(id)) || invoices[0]);
  const [settings, setSettings] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/internet-services/" + id)
      .then((res) => setInvoice(res.data.data))
      .catch(() => setMessage("Menampilkan data fallback. Pastikan backend aktif dan sesi login valid."));
    api.get("/settings?limit=100&search=company_")
      .then((res) => setSettings(res.data.data || []))
      .catch(() => setSettings([]));
  }, [id]);

  async function download() {
    await downloadInvoicePdf(invoice, settings);
    setMessage("PDF invoice berhasil diunduh.");
  }

  return (
    <div>
      <PageHeader title="Detail Invoice" subtitle="Rincian invoice dan status pembayaran pelanggan." />
      {message ? <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <div className="flex items-start justify-between border-b border-slate-100 pb-6">
            <div>
              <p className="text-sm font-semibold text-slate-500">Invoice</p>
              <h1 className="mt-1 text-2xl font-black text-slate-950">{invoice.noInvoice}</h1>
              <p className="mt-2 text-sm text-slate-500">Faktur: {invoice.noFaktur}</p>
            </div>
            <Badge value={invoice.status} />
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Info label="Pelanggan" value={invoice.customerName} />
            <Info label="Paket Layanan" value={invoice.serviceType} />
            <Info label="Periode" value={monthName(invoice.periodMonth) + " " + invoice.periodYear} />
            <Info label="Jatuh Tempo" value={date(invoice.dueDate)} />
            <Info label="Total Tagihan" value={currency(invoice.amount)} />
            <Info label="Tanggal Dibuat" value={date(invoice.createdAt)} />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-bold text-slate-950">Aksi Invoice</h2>
          <div className="mt-4 space-y-3">
            <a href={"/internet-services/" + invoice.id + "/edit"} className="flex h-11 items-center justify-center rounded-lg bg-[#6366F1] text-sm font-bold text-white">Edit Invoice</a>
            <button onClick={download} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700"><Download size={16} /> Unduh PDF</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>;
}

export function FinancePage() {
  return <div><PageHeader title="Keuangan" subtitle="Monitoring pembayaran, tunggakan, dan cashflow." /><div className="grid gap-4 md:grid-cols-3"><StatCard icon={<Wallet size={22} />} label="Pembayaran Masuk" value={currency(1248750000)} trend="+16.3% bulan ini" /><StatCard icon={<Receipt size={22} />} label="Belum Lunas" value={currency(235450000)} trend="455 invoice terbuka" accent="amber" /><StatCard icon={<Building2 size={22} />} label="Mitra Dibayar" value={currency(154000000)} trend="32 mitra aktif" accent="emerald" /></div><Card className="mt-6 p-5"><h2 className="mb-4 font-bold text-slate-950">Rekonsiliasi Terbaru</h2><div className="space-y-3">{invoices.map((item) => <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><div><p className="font-semibold">{item.customerName}</p><p className="text-sm text-slate-500">{item.noInvoice}</p></div><div className="text-right"><p className="font-bold">{currency(item.amount)}</p><Badge value={item.status} /></div></div>)}</div></Card></div>;
}

export function ReportsPage() {
  return <div><PageHeader title="Laporan" subtitle="Laporan pelanggan, pendapatan, invoice, dan marketing." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{["Pendapatan Bulanan", "Aging Tunggakan", "Akuisisi Pelanggan", "Performa Mitra"].map((item) => <Card key={item} className="p-5"><FileText className="text-indigo-500" size={24} /><h2 className="mt-4 font-bold text-slate-950">{item}</h2><p className="mt-2 text-sm text-slate-500">Export PDF/XLS dan filter periode tersedia.</p><button className="mt-5 h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700">Generate</button></Card>)}</div></div>;
}

export function SettingsPage() {
  return <div><PageHeader title="Pengaturan" subtitle="Konfigurasi sistem, profil perusahaan, dan keamanan." /><div className="grid gap-6 xl:grid-cols-2"><Card className="p-6"><Settings className="text-indigo-500" size={26} /><h2 className="mt-4 font-bold text-slate-950">Profil Perusahaan</h2><div className="mt-5 grid gap-4"><Info label="Nama" value="MyRingNet ISP" /><Info label="Domain API" value="http://localhost:3000/api" /><Info label="Zona Waktu" value="Asia/Jakarta" /></div></Card><Card className="p-6"><Shield className="text-emerald-500" size={26} /><h2 className="mt-4 font-bold text-slate-950">Keamanan</h2><div className="mt-5 space-y-3"><div className="flex items-center justify-between rounded-lg bg-slate-50 p-4"><span className="font-semibold">JWT Authentication</span><Badge value="active" /></div><div className="flex items-center justify-between rounded-lg bg-slate-50 p-4"><span className="font-semibold">Protected Routes</span><Badge value="active" /></div></div></Card></div></div>;
}
