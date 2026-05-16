"use client";

import { Badge, Card, PageHeader, StatCard } from "@/components/ui/AdminUI";
import api from "@/lib/api";
import { currency, date, monthName } from "@/lib/format";
import { invoices } from "@/lib/fallback-data";
import { Ban, Building2, CreditCard, FileText, Mail, MapPin, MessageCircle, Phone, Printer, Receipt, Settings, Shield, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

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

  const customer = invoice.customer || {};
  const items = normalizeInvoiceItems(invoice);
  const subtotal = numberValue(invoice.subtotal) || items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  const discount = numberValue(invoice.discountTotal) || items.reduce((total, item) => total + item.discount, 0);
  const tax = numberValue(invoice.taxAmount);
  const total = numberValue(invoice.grandTotal) || numberValue(invoice.amount) || Math.max(0, subtotal - discount + tax);
  const invoiceNumber = invoice.noFaktur || invoice.noInvoice || invoice.id;
  const invoiceHeader = String(invoiceNumber).toUpperCase().startsWith("INV") ? invoiceNumber : `INV-${invoiceNumber}`;
  const invoiceTitle = invoice.invoiceName || `Periode ${monthName(invoice.periodMonth)} ${invoice.periodYear}`;
  const paymentUrl = `https://srv.ring.net.id/mypay/${encodeURIComponent(invoiceNumber || "invoice")}`;
  const companyName = settingValue(settings, "company_name", "Ring Media Nusantara");
  const companyAddress = settingValue(settings, "company_address", "Jl. Wuluh No. 1 Papringan, RT. 13, RW. 05, Caturtunggal, Depok, Sleman, DI Yogyakarta 55281.");
  const companyEmail = settingValue(settings, "company_email", "billing@ring.net.id");
  const companyPhone = settingValue(settings, "company_phone", "+6287747963000");

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
          <span>Dashboard</span><span>/</span><Link href="/keuangan" className="hover:text-indigo-600">Keuangan</Link><span>/</span><Link href="/internet-services" className="text-indigo-600 hover:underline">Faktur & Tagihan</Link><span>/</span><span className="text-slate-800">{invoiceNumber}</span>
        </div>
      </div>
      {message ? <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div> : null}

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#5B9CE5] px-5 py-4 text-white">
          <h1 className="text-lg font-bold">{invoiceHeader}</h1>
          <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/15 px-4 text-sm font-bold transition hover:bg-white/25">
            <Printer size={17} /> Cetak
          </button>
        </div>

        <div className="space-y-8 p-5 lg:p-8">
          <div className="flex flex-col gap-6 border-y border-slate-200 py-6 md:flex-row md:items-center md:justify-between">
            <div className="relative h-28 w-52">
              <Image src="/assets/logo.png" alt="RingNet" fill sizes="208px" className="object-contain object-left" priority />
            </div>
            <div className="text-left md:text-right">
              <p className="text-2xl font-black text-slate-950">#{invoiceNumber}</p>
              <p className="mt-1 text-xl font-bold text-slate-800">{invoiceTitle}</p>
              <span className="mt-3 inline-flex rounded-md bg-amber-400 px-3 py-1 text-sm font-black uppercase text-white">
                Jatuh Tempo : {date(invoice.dueDate)}
              </span>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">{companyName}</h2>
              <div className="mt-5 space-y-3 text-sm font-semibold text-slate-600">
                <IconLine icon={<MapPin size={18} />} value={companyAddress} />
                <IconLine icon={<Mail size={18} />} value={companyEmail} accent="text-cyan-500" />
                <IconLine icon={<Phone size={18} />} value={companyPhone} accent="text-emerald-500" />
              </div>
            </div>
            <div className="text-left lg:text-right">
              <h2 className="text-2xl font-bold text-slate-950">{invoice.customerName || customer.name || "Faktur Umum"}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">ID Pelanggan : <span className="text-slate-800">{customer.customerCode || "-"}</span></p>
              <div className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
                <p>{customer.address || "-"}</p>
                <p>{customer.email || "-"}</p>
                <p>{customer.phone || "-"}</p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="mb-3 text-xl font-bold text-slate-950">Rincian Pembayaran :</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border border-slate-200 text-sm">
                <thead className="bg-slate-50 text-left font-bold text-slate-600">
                  <tr>
                    <th className="w-16 border border-slate-200 px-4 py-4 text-center">No</th>
                    <th className="border border-slate-200 px-4 py-4">Nama Produk</th>
                    <th className="w-24 border border-slate-200 px-4 py-4 text-center">Qty</th>
                    <th className="w-40 border border-slate-200 px-4 py-4 text-right">Harga</th>
                    <th className="w-40 border border-slate-200 px-4 py-4 text-right">Diskon</th>
                    <th className="w-40 border border-slate-200 px-4 py-4 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td className="border border-slate-200 px-4 py-4 text-center font-semibold text-slate-600">{index + 1}</td>
                      <td className="border border-slate-200 px-4 py-4 font-bold text-slate-700">{item.name}</td>
                      <td className="border border-slate-200 px-4 py-4 text-center"><span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-black text-blue-600">{item.quantity}</span></td>
                      <td className="border border-slate-200 px-4 py-4 text-right font-semibold text-slate-600">{currency(item.unitPrice)}</td>
                      <td className="border border-slate-200 px-4 py-4 text-right font-semibold text-slate-600">{currency(item.discount)}</td>
                      <td className="border border-slate-200 px-4 py-4 text-right font-semibold text-slate-600">{currency(item.total)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} className="border border-slate-200 px-4 py-4 text-right font-bold text-slate-700">Subtotal</td>
                    <td className="border border-slate-200 px-4 py-4 text-right font-bold text-slate-700">{currency(subtotal)}</td>
                  </tr>
                  {discount ? (
                    <tr>
                      <td colSpan={5} className="border border-slate-200 px-4 py-4 text-right font-bold text-slate-700">Diskon</td>
                      <td className="border border-slate-200 px-4 py-4 text-right font-bold text-slate-700">{currency(discount)}</td>
                    </tr>
                  ) : null}
                  {tax ? (
                    <tr>
                      <td colSpan={5} className="border border-slate-200 px-4 py-4 text-right font-bold text-slate-700">Pajak</td>
                      <td className="border border-slate-200 px-4 py-4 text-right font-bold text-slate-700">{currency(tax)}</td>
                    </tr>
                  ) : null}
                  <tr className="bg-amber-50">
                    <td colSpan={5} className="border border-amber-200 px-4 py-4 text-right text-base font-black text-slate-800">TOTAL</td>
                    <td className="border border-amber-200 px-4 py-4 text-right text-base font-black text-slate-800">{currency(total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {invoice.notes ? <div className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-600">{invoice.notes}</div> : null}

          <div className="space-y-4 text-center">
            <DigitalQr value={paymentUrl} />
            <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
              Link Pembayaran : <a href={paymentUrl} className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">{paymentUrl}</a>
            </div>
            <p className="font-bold text-slate-700">Faktur dibuat secara digital dan berlaku tanpa tanda tangan dan stempel</p>
            <p className="text-sm font-semibold text-slate-500">{date(invoice.createdAt || new Date())}</p>
          </div>

          {invoice.disableAuthOnDue ? (
            <div className="rounded-lg bg-rose-50 px-4 py-4 text-center font-semibold text-rose-700">
              Autentikasi akan dinonaktifkan saat tagihan jatuh tempo
            </div>
          ) : null}

          <div className="flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-6">
            <Link href="/payments/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-cyan-500 px-5 text-sm font-bold text-white shadow-sm shadow-cyan-100"><CreditCard size={18} /> Tambah Pembayaran</Link>
            <Link href={`/internet-services/${invoice.id}/edit`} className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#5B9CE5] px-5 text-sm font-bold text-white shadow-sm shadow-blue-100"><FileText size={18} /> Ubah Tagihan</Link>
            <button type="button" onClick={() => setMessage("Fitur pembatalan tagihan akan memakai status khusus pada tahap berikutnya.")} className="inline-flex h-11 items-center gap-2 rounded-lg bg-rose-500 px-5 text-sm font-bold text-white shadow-sm shadow-rose-100"><Ban size={18} /> Batalkan Tagihan</button>
            <a href={`https://wa.me/${String(customer.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Halo ${invoice.customerName || customer.name || ""}, berikut link pembayaran faktur ${invoiceNumber}: ${paymentUrl}`)}`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-white shadow-sm shadow-emerald-100"><MessageCircle size={18} /> Kirim Pesan</a>
          </div>
        </div>
      </Card>
      </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-900">{value}</p></div>;
}

function IconLine({ icon, value, accent = "text-rose-500" }: { icon: ReactNode; value: string; accent?: string }) {
  return <div className="flex items-start gap-3"><span className={accent}>{icon}</span><span>{value || "-"}</span></div>;
}

function settingValue(settings: any[], key: string, fallback: string) {
  const item = settings.find((setting) => setting.key === key);
  return item?.value || fallback;
}

function numberValue(value: unknown) {
  return Number(value || 0);
}

function normalizeInvoiceItems(invoice: any) {
  const rawItems = typeof invoice.items === "string" ? safeJson(invoice.items) : invoice.items;
  if (Array.isArray(rawItems) && rawItems.length) {
    return rawItems.map((item: any) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || item.price || 0);
      const discount = Number(item.discount || 0);
      return {
        name: item.name || invoice.serviceType || "Layanan Internet",
        quantity,
        unitPrice,
        discount,
        total: Number(item.total || Math.max(0, unitPrice * quantity - discount)),
      };
    });
  }

  const amount = numberValue(invoice.amount);
  return [{
    name: invoice.serviceType || "Layanan Internet",
    quantity: 1,
    unitPrice: amount,
    discount: 0,
    total: amount,
  }];
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function DigitalQr({ value }: { value: string }) {
  const seed = value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return (
    <div className="mx-auto grid w-fit grid-cols-[repeat(17,7px)] gap-[2px] rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200" aria-label="QR pembayaran">
      {Array.from({ length: 289 }).map((_, index) => {
        const row = Math.floor(index / 17);
        const col = index % 17;
        const finder = (row < 5 && col < 5) || (row < 5 && col > 11) || (row > 11 && col < 5);
        const core = finder && (row === 0 || row === 4 || col === 0 || col === 4 || row === 2 || col === 2);
        const active = core || ((index * 37 + seed + row * 11 + col * 5) % 9 < 4);
        return <span key={index} className={active ? "h-[7px] w-[7px] bg-slate-950" : "h-[7px] w-[7px] bg-white"} />;
      })}
    </div>
  );
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
