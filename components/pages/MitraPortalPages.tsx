"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { currency, date } from "@/lib/format";
import { Badge, Card, PageHeader, ShimmerBlock, StatCard, TextInput } from "@/components/ui/AdminUI";
import InfrastructureMap from "@/components/ui/InfrastructureMap";
import { Activity, ArrowRight, Banknote, Cable, CircleDollarSign, ClipboardCheck, Clock3, Download, ExternalLink, FilePenLine, FileText, Handshake, Headphones, Landmark, PackageCheck, Percent, RadioTower, ReceiptText, Router, Server, ShieldCheck, Ticket, TicketCheck, Timer, Trash2, Upload, UserRoundCheck, Users, Wrench } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/hooks/useAuth";
import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { technicalDataApi } from "@/src/features/technical-data/api";
import { mitraPortalApi } from "@/src/features/mitra-portal/api";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API || "").replace(/\/api\/?$/, "");
const fileUrl = (path?: string) => path ? `${API_ORIGIN}${path}` : "#";
const colors = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#0ea5e9", "#8b5cf6"];

function ErrorBox({ message }: { message: string }) { return message ? <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{message}</div> : null; }
function Notice({ message }: { message: string }) { return message ? <div className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null; }
function Empty({ children = "Belum ada data." }: { children?: ReactNode }) { return <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">{children}</div>; }
function Button({ children, type = "button", onClick, tone = "primary" }: { children: ReactNode; type?: "button" | "submit"; onClick?: () => void; tone?: "primary" | "danger" }) { return <button type={type} onClick={onClick} className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-white ${tone === "danger" ? "bg-rose-600 hover:bg-rose-500" : "bg-indigo-600 hover:bg-indigo-500"}`}>{children}</button>; }

function DataGrid({
  columns,
  rows,
  pageSize = 10,
  enablePagination = true,
}: {
  columns: { label: string; value: (row: any, index: number) => ReactNode }[];
  rows: any[];
  pageSize?: number;
  enablePagination?: boolean;
}) {
  const [pageIndex, setPageIndex] = useState(0);

  if (!rows.length) return <Empty />;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
  const displayedRows = enablePagination && rows.length > pageSize
    ? rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
    : rows;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.label} className="px-4 py-3 font-bold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedRows.map((row, index) => (
              <tr key={row.id || index} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.label} className="px-4 py-3 text-slate-700">
                    {column.value(row, currentPage * pageSize + index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {enablePagination && rows.length > pageSize ? (
        <div className="flex flex-col gap-3 pt-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-slate-500">
            Menampilkan {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, rows.length)} dari {rows.length} data
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-black text-slate-700">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const tileThemes: Record<string, string> = {
  slate: "from-slate-600 to-slate-800",
  sky: "from-sky-500 to-sky-600",
  emerald: "from-emerald-500 to-emerald-600",
  amber: "from-amber-500 to-orange-500",
  rose: "from-rose-500 to-red-600",
  violet: "from-violet-500 to-purple-600",
  indigo: "from-indigo-500 to-indigo-700",
};

function DashboardTile({ label, value, icon, theme = "sky", href, action = "Lihat Detail" }: { label: string; value: ReactNode; icon: ReactNode; theme?: string; href?: string; action?: string }) {
  const content = <div className={`group flex min-h-40 flex-col overflow-hidden rounded-2xl bg-gradient-to-br ${tileThemes[theme]} text-white shadow-lg shadow-slate-200`}><div className="flex flex-1 items-start justify-between gap-4 p-5"><div><p className="text-2xl font-black tracking-tight">{value}</p><p className="mt-2 text-sm font-black uppercase tracking-wide text-white/90">{label}</p></div><span className="text-white/30 transition group-hover:text-white/50">{icon}</span></div>{href ? <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/10 px-5 py-3 text-xs font-bold"><span>{action}</span><ArrowRight size={16} /></div> : null}</div>;
  return href ? <Link href={href}>{content}</Link> : content;
}

function DashboardSectionTitle({ children }: { children: ReactNode }) { return <h2 className="mb-4 mt-10 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-600"><span className="h-5 w-1 rounded-full bg-indigo-600" />{children}</h2>; }

function WibClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { const update = () => setNow(new Date()); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, []);
  const label = useMemo(() => {
    if (!now) return "Memuat waktu WIB...";
    const parts = Object.fromEntries(new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).formatToParts(now).map((part) => [part.type, part.value]));
    const weekday = parts.weekday.charAt(0).toUpperCase() + parts.weekday.slice(1);
    return `${weekday}, ${parts.day} ${parts.month} ${parts.year} | ${parts.hour}:${parts.minute}:${parts.second} WIB`;
  }, [now]);
  return <div className="flex items-center gap-2.5 self-start whitespace-nowrap rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600 shadow-sm sm:self-auto"><Clock3 size={22} className="shrink-0 text-indigo-600" /><time className="text-sm font-black tabular-nums xl:text-base">{label}</time></div>;
}

export function MitraDashboardPage() {
  const [data, setData] = useState<any>(null); const [error, setError] = useState("");
  useEffect(() => { mitraPortalApi.summary().then((res) => setData(res.data.data)).catch((err) => setError(err.response?.data?.message || "Gagal memuat dashboard mitra.")); }, []);
  if (!data && !error) return <div className="space-y-5"><ShimmerBlock className="h-24" /><div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <ShimmerBlock key={i} className="h-28" />)}</div><ShimmerBlock className="h-80" /></div>;
  const profile = data?.profile || {}; const finance = data?.finance || {}; const tickets = data?.ticketStats || {}; const remaining = data?.agreementRemainingDays;
  return <div><PageHeader title="Dashboard Mitra" subtitle={`Selamat datang, ${profile.name || "Mitra"}. Ringkasan operasional dan bisnis Anda.`} rightContent={<WibClock />} /><ErrorBox message={error} />
    {remaining !== null && remaining !== undefined ? <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${remaining < 60 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-indigo-100 bg-indigo-50 text-indigo-800"}`}><strong>Masa berlaku PKS:</strong> sampai {date(profile.agreementEnd)} ({remaining > 0 ? `${remaining} hari lagi` : "sudah berakhir"}).</div> : null}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard icon={<Users size={22} />} label="Jumlah Customer" value={String(data?.totals?.customers || 0)} trend={`${data?.totals?.activeCustomers || 0} aktif`} /><StatCard icon={<CircleDollarSign size={22} />} label="Pendapatan Kotor" value={currency(finance.grossRevenue)} trend={`${finance.paidInvoiceCount || 0} invoice lunas`} accent="emerald" /><StatCard icon={<ReceiptText size={22} />} label="Sharing Profit" value={currency(finance.sharingProfit)} trend={`${finance.profitSharePercent || 0}% bagi hasil`} accent="amber" /><StatCard icon={<Headphones size={22} />} label="Total Tiket" value={String(data?.totals?.tickets || 0)} trend={`${tickets.open || 0} tiket terbuka`} accent="rose" /></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]"><Card className="p-5"><h2 className="font-black text-slate-950">Tren Penjualan Tahunan</h2><p className="text-sm text-slate-500">Pendapatan invoice lunas dalam 12 bulan terakhir.</p><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}><LineChart data={data?.revenue || []}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="month" fontSize={11} /><YAxis fontSize={11} tickFormatter={(v) => `${Math.round(Number(v) / 1000000)}jt`} /><Tooltip formatter={(v) => currency(String(v))} /><Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} /></LineChart></ResponsiveContainer></div></Card><Card className="p-5"><h2 className="font-black text-slate-950">Proporsi Paket</h2><p className="text-sm text-slate-500">Distribusi paket pelanggan aktif.</p><div className="h-56"><ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}><PieChart><Pie data={data?.packageDistribution || []} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78}>{(data?.packageDistribution || []).map((_: any, i: number) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="space-y-2">{(data?.packageDistribution || []).map((item: any, i: number) => <div key={item.name} className="flex justify-between text-sm"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />{item.name}</span><strong>{item.value}</strong></div>)}</div></Card></div>
    <DashboardSectionTitle>Pencatatan dan Pembukuan Mitra</DashboardSectionTitle>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <DashboardTile label="Berita Acara Rekonsiliasi" value="BERITA ACARA" icon={<FilePenLine size={44} />} theme="slate" href="/mitra/berita-acara" action="Cetak / Lihat BA" />
      <DashboardTile label="Jumlah Customer" value={String(data?.totals?.customers || 0)} icon={<Users size={44} />} href="/mitra/pelanggan" />
      <DashboardTile label="Pendapatan Kotor" value={currency(finance.grossRevenue)} icon={<Banknote size={44} />} theme="emerald" href="/mitra/pendapatan-billing" action="Lihat Rincian" />
      <DashboardTile label="DPP" value={currency(finance.dpp)} icon={<Landmark size={44} />} />
      <DashboardTile label="PPN (11%)" value={currency(finance.vat)} icon={<Percent size={44} />} theme="amber" />
      <DashboardTile label={`BHP USO (${finance.bhpUsoPercent || 0}%)`} value={currency(finance.bhpUso)} icon={<RadioTower size={44} />} theme="rose" />
      <DashboardTile label={`KSO (${finance.ksoPercent || 0}%)`} value={currency(finance.kso)} icon={<Handshake size={44} />} theme="violet" />
      <DashboardTile label="Biaya Supply Bandwidth" value={currency(finance.bandwidthFee)} icon={<ReceiptText size={44} />} theme="indigo" />
      <DashboardTile label="Sharing Profit" value={currency(finance.sharingProfit)} icon={<Handshake size={44} />} theme="violet" href="/mitra/berita-acara" action="Lihat Rekonsiliasi" />
      <DashboardTile label="PPH (2.5%)" value={currency(finance.withholdingTax)} icon={<ReceiptText size={44} />} theme="rose" />
    </div>

    <DashboardSectionTitle>Tiketing</DashboardSectionTitle>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <DashboardTile label="Total Tiket" value={String(data?.totals?.tickets || 0)} icon={<Ticket size={44} />} theme="slate" href="/mitra/tiket" />
      <DashboardTile label="Tiket Open" value={String(tickets.open || 0)} icon={<FileText size={44} />} theme="rose" href="/mitra/tiket" />
      <DashboardTile label="Tiket Pending" value={String(tickets.pending || 0)} icon={<Timer size={44} />} theme="amber" href="/mitra/tiket" />
      <DashboardTile label="Dalam Penanganan" value={String(tickets.progress || 0)} icon={<Wrench size={44} />} href="/mitra/tiket" />
      <DashboardTile label="Tiket Closed" value={String(tickets.closed || 0)} icon={<TicketCheck size={44} />} theme="emerald" href="/mitra/tiket" />
      <DashboardTile label="Tiket Layanan" value={String(tickets.service || 0)} icon={<Headphones size={44} />} theme="slate" href="/mitra/tiket-layanan" />
    </div>

    <DashboardSectionTitle>Data Teknis</DashboardSectionTitle>
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
      <DashboardTile label="OLT" value={String(data?.assetCounts?.olt || data?.assetCounts?.cpe || 0)} icon={<Server size={44} />} theme="emerald" href="/mitra/olt" />
      <DashboardTile label="Router (RO)" value={String(data?.assetCounts?.router || 0)} icon={<Router size={44} />} href="/mitra/router" />
      <DashboardTile label="Switch" value={String(data?.assetCounts?.switch || 0)} icon={<Server size={44} />} href="/mitra/switch" />
      <DashboardTile label="SLA Pelanggan" value="SLA" icon={<UserRoundCheck size={44} />} theme="slate" href="/mitra/sla" />
    </div>
    <p className="mb-3 mt-7 text-xs font-black uppercase tracking-widest text-indigo-600">Perangkat Pasif</p>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardTile label="OTB" value={String(data?.assetCounts?.otb || 0)} icon={<PackageCheck size={44} />} theme="amber" href="/mitra/otb" />
      <DashboardTile label="ODC" value={String(data?.assetCounts?.odc || 0)} icon={<Server size={44} />} theme="rose" href="/mitra/odc" />
      <DashboardTile label="ODP" value={String(data?.assetCounts?.odp || 0)} icon={<ClipboardCheck size={44} />} theme="violet" href="/mitra/odp" />
      <DashboardTile label="Kabel" value={String(data?.assetCounts?.cable || 0)} icon={<Cable size={44} />} theme="slate" href="/mitra/kabel" />
    </div>

    <DashboardSectionTitle>Mapping Infrastruktur FTTH</DashboardSectionTitle>
    <InfrastructureMap points={data?.infrastructurePoints || []} />

    <Card className="mt-6 border-l-4 border-l-indigo-600 bg-indigo-50 p-5"><h2 className="font-black text-indigo-950">Butuh Bantuan?</h2><p className="mt-2 text-sm leading-6 text-indigo-800">Hubungi tim support MyRingNet untuk bantuan operasional, teknis, atau administrasi.</p><div className="mt-4 flex flex-wrap gap-3 text-sm"><span className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white">WhatsApp: {data?.support?.support_phone || data?.support?.company_phone || "Hubungi administrator"}</span><span className="rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white">Email: {data?.support?.support_email || data?.support?.company_email || "Hubungi administrator"}</span></div></Card>
  </div>;
}

const meta: Record<string, [string, string]> = {
  legal: ["POP", "Kelola data dokumen Point of Presence."],
  "syarat-komdigi": ["Syarat dan Ketentuan Komdigi", "Dokumen resmi kepatuhan dan regulasi untuk Mitra."], "syarat-operasional": ["Ketentuan Operasional Mitra", "Pedoman operasional yang diterbitkan administrator."], pic: ["Data PIC Mitra", "Kelola surat dan dokumen penunjukan PIC."], registrasi: ["Data Registrasi Mitra", "Identitas dan status registrasi akun Mitra."], ktp: ["Data KTP", "Dokumen identitas PIC Mitra."], npwp: ["Data NPWP", "Dokumen perpajakan Mitra."], nib: ["Data NIB", "Dokumen Nomor Induk Berusaha."], sertifikat: ["Data Sertifikat Standar", "Dokumen sertifikat standar Mitra."], pks: ["Data PKS Jasa Jual Kembali", "Dokumen perjanjian kerja sama."], "dokumen-pendukung": ["Dokumen Perizinan dan Kerjasama", "Dokumen global yang dikelola oleh Super Admin."], tiket: ["Tiket Pelanggan", "Buat dan pantau laporan pelanggan."], "cs-online": ["CS Online ke Admin", "Kanal bantuan administrasi dan operasional."], "tiket-gangguan": ["Gangguan ke Admin", "Laporkan gangguan teknis."], "tiket-layanan": ["PO Layanan ke Admin", "Ajukan kebutuhan layanan ke administrator."], "perangkat-aktif": ["Perangkat Aktif", "Router, switch, dan OLT."], "perangkat-pasif": ["Perangkat Pasif", "OTB, ODC, ODP, dan kabel."], router: ["Router (RO)", "Daftar router upstream Mitra."], switch: ["Switch", "Daftar switch jaringan Mitra."], olt: ["OLT", "Daftar Optical Line Terminal Mitra."], cpe: ["OLT", "Daftar Optical Line Terminal Mitra."], sla: ["SLA Pelanggan", "Data kepatuhan SLA pelanggan."], otb: ["OTB", "Daftar Optical Termination Box."], odc: ["ODC", "Daftar Optical Distribution Cabinet."], odp: ["ODP", "Daftar Optical Distribution Point."], kabel: ["Kabel", "Daftar kabel infrastruktur FTTH."], infrastruktur: ["Map Infrastruktur", "Koordinat infrastruktur jaringan Mitra."], produk: ["Produk", "Paket internet yang dapat dipasarkan."], pelanggan: ["Data Customer", "Daftar pelanggan yang terhubung ke Mitra."], "pendapatan-billing": ["Pencatatan Pendapatan Billing", "Pendapatan dan invoice pelanggan."], "kelola-tagihan": ["Kelola Tagihan Pelanggan", "Status penagihan pelanggan Mitra."], "berita-acara": ["BA Pelaporan Pendapatan", "Dokumen berita acara rekonsiliasi."], "operasional-produk": ["Produk Operasional", "Brosur dan dokumen produk."], presales: ["Presales", "Materi pendukung presales."], evaluasi: ["Evaluasi Penjualan", "Dokumen evaluasi penjualan Mitra."], settings: ["Pengaturan Profil", "PIC, perusahaan, rekening, dokumen, dan paraf digital."], profil: ["Profile", "Ringkasan identitas akun Mitra."],
};

function DocumentCards({ category }: { category: string }) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const endpoint = isAdmin ? `/documents?categorySlug=${category}` : `/mitra-portal/content-documents?category=${category}`;
  const [rows, setRows] = useState<any[] | null>(null); const [error, setError] = useState("");
  useEffect(() => {
    const request = isAdmin ? mitraPortalApi.documentList({ categorySlug: category }) : mitraPortalApi.contentDocuments(category);
    request.then((r) => setRows(r.data.data || [])).catch((e) => setError(e.response?.data?.message || "Gagal memuat dokumen."));
  }, [category, endpoint, isAdmin]);
  if (!rows && !error) return <ShimmerBlock className="h-72" />;
  return <><ErrorBox message={error} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(rows || []).map((row) => <Card key={row.id} className="flex flex-col p-5"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><FileText size={22} /></span>{row.createdAt ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">{date(row.createdAt)}</span> : null}</div><h2 className="mt-4 font-black text-slate-950">{row.name}</h2><p className="mt-1 text-xs font-semibold text-indigo-600">{row.documentNo || row.category?.name || "Dokumen resmi"}</p><p className="mt-3 flex-1 text-sm leading-6 text-slate-500">{row.description || "Dokumen diterbitkan dan dikelola melalui sistem MyRingNet."}</p><div className="mt-5 flex gap-2"><a href={fileUrl(row.filePath)} target="_blank" className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white"><ExternalLink size={14} /> Lihat</a><a href={fileUrl(row.filePath)} download className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600"><Download size={15} /></a></div></Card>)}{rows?.length === 0 ? <Empty>Belum ada dokumen pada kategori ini. Super Admin dapat menambahkannya dari menu Dokumen.</Empty> : null}</div></>;
}

const docCategory: Record<string, string> = { pic: "pic-mitra", ktp: "ktp-mitra", npwp: "npwp-mitra", nib: "nib-mitra", sertifikat: "sertifikat-mitra", pks: "pks-mitra" };
function PartnerDocuments({ section }: { section: string }) {
  const category = docCategory[section]; const [rows, setRows] = useState<any[] | null>(null); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [form, setForm] = useState({ name: "", documentNo: "", description: "", expiredDate: "" }); const [file, setFile] = useState<File | null>(null);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const popId = params.get('pop') || '';
  const load = useCallback(() => {
    const request = isAdmin ? mitraPortalApi.documentList({ categorySlug: category, ...(popId ? { popId } : {}) }) : mitraPortalApi.contentDocuments(category);
    return request.then((r) => setRows(r.data.data || [])).catch((e) => setError(e.response?.data?.message || "Gagal memuat dokumen."));
  }, [category, isAdmin, popId]);
  useEffect(() => { load(); }, [load]);
  async function submit(e: FormEvent) { e.preventDefault(); if (!file) return setError("Pilih file dokumen terlebih dahulu."); setError(""); const body = new FormData(); Object.entries({ ...form, categorySlug: category, popId }).forEach(([k, v]) => { if (v) body.append(k, v) }); body.append("file", file); try { await mitraPortalApi.createDocument(body, isAdmin); setMessage("Dokumen berhasil ditambahkan."); setForm({ name: "", documentNo: "", description: "", expiredDate: "" }); setFile(null); await load(); } catch (err: any) { setError(err.response?.data?.message || "Gagal mengunggah dokumen."); } }
  async function remove(id: string) { if (!window.confirm("Hapus dokumen ini?")) return; try { await mitraPortalApi.removeDocument(id, isAdmin); await load(); } catch (err: any) { setError(err.response?.data?.message || "Gagal menghapus dokumen."); } }
  return <div className="space-y-6"><Card className="p-5"><h2 className="font-black text-slate-950">Tambah Data</h2><ErrorBox message={error} /><Notice message={message} /><form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><TextInput label={section === "pic" ? "Nama PIC" : "Nama Dokumen"} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><TextInput label="Nomor Surat / Dokumen" value={form.documentNo} onChange={(e) => setForm({ ...form, documentNo: e.target.value })} /><TextInput label="Keterangan" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><TextInput type="date" label="Masa Berlaku" value={form.expiredDate} onChange={(e) => setForm({ ...form, expiredDate: e.target.value })} /><label className="md:col-span-2 xl:col-span-3"><span className="mb-2 block text-sm font-semibold text-slate-700">Berkas Dokumen</span><input required type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full rounded-lg border border-slate-200 p-2 text-sm" /></label><div className="flex items-end"><Button type="submit"><Upload size={16} /> Tambah Data</Button></div></form></Card><Card className="p-5">{rows === null ? <ShimmerBlock className="h-72" /> : <DataGrid rows={rows} columns={[{ label: "No", value: (_r, i) => i + 1 }, { label: "Tanggal", value: (r) => date(r.createdAt) }, { label: "Nomor Surat", value: (r) => r.documentNo || "-" }, { label: section === "pic" ? "Nama" : "Dokumen", value: (r) => <strong>{r.name}</strong> }, { label: "Keterangan", value: (r) => r.description || "-" }, { label: "Dokumen", value: (r) => <a target="_blank" href={fileUrl(r.filePath)} className="font-bold text-indigo-600">Lihat</a> }, { label: "Aksi", value: (r) => (r.partnerId || r.popId) ? <button onClick={() => remove(r.id)} className="text-rose-600"><Trash2 size={17} /></button> : <span className="text-xs text-slate-400">Admin</span> }]} />}</Card></div>;
}

function RegistrationPage({ settings = false }: { settings?: boolean }) {
  const [form, setForm] = useState<any>(null); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [signature, setSignature] = useState<File | null>(null);
  useEffect(() => { mitraPortalApi.profile().then((r) => setForm(r.data.data)).catch((e) => setError(e.response?.data?.message || "Gagal memuat profil.")); }, []);
  if (!form) return error ? <ErrorBox message={error} /> : <ShimmerBlock className="h-96" />;
  if (!settings) return <div className="grid gap-5 lg:grid-cols-2"><Card className="p-5"><h2 className="font-black">Identitas Mitra</h2><Info rows={[["ID Mitra", form.partnerCode], ["Nama", form.name], ["Perusahaan", form.companyName], ["Email akun", form.user?.email], ["Status", form.status], ["Area", form.area], ["Kota", form.city]]} /></Card><Card className="p-5"><h2 className="font-black">Perjanjian Kerja Sama</h2><Info rows={[["Nomor PKS", form.agreementNumber], ["Mulai", date(form.agreementStart)], ["Berakhir", date(form.agreementEnd)], ["Bagi hasil", `${Number(form.profitSharePercent || 0)}%`]]} /></Card></div>;
  const groups = [{ title: "Data PIC", fields: [["picName", "Nama PIC"], ["nik", "NIK"], ["occupation", "Jabatan"], ["picPhone", "Nomor Telepon PIC"], ["email", "Email PIC"], ["address", "Alamat PIC"]] }, { title: "Data Perusahaan", fields: [["companyName", "Nama Perusahaan"], ["companyAddress", "Alamat Perusahaan"], ["companyPhone", "Telepon Perusahaan"], ["companyEmail", "Email Perusahaan"], ["npwpNumber", "NPWP"], ["nibNumber", "NIB"]] }, { title: "Data Rekening", fields: [["bankName", "Nama Bank"], ["bankAccountNo", "Nomor Rekening"], ["bankAccountHolder", "Nama Pemilik Rekening"]] }];
  async function save(e: FormEvent) { e.preventDefault(); setError(""); try { const r = await mitraPortalApi.updateProfile(form); setForm({ ...form, ...r.data.data }); setMessage("Profil berhasil diperbarui."); } catch (err: any) { setError(err.response?.data?.message || "Gagal memperbarui profil."); } }
  async function uploadSignature() { if (!signature) return setError("Pilih gambar paraf terlebih dahulu."); const body = new FormData(); body.append("file", signature); try { const r = await mitraPortalApi.updateProfileSignature(body); setForm({ ...form, signaturePath: r.data.data.signaturePath }); setMessage("Paraf digital berhasil diperbarui."); } catch (err: any) { setError(err.response?.data?.message || "Gagal mengunggah paraf."); } }
  return <div className="space-y-6"><ErrorBox message={error} /><Notice message={message} /><form onSubmit={save} className="space-y-6">{groups.map((group) => <Card key={group.title} className="p-5"><h2 className="mb-4 font-black text-slate-950">{group.title}</h2><div className="grid gap-4 md:grid-cols-2">{group.fields.map(([key, label]) => <TextInput key={key} label={label} value={form[key] || ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}</div></Card>)}<div className="flex justify-end"><Button type="submit">Simpan Pengaturan</Button></div></form><Card className="p-5"><h2 className="font-black text-slate-950">Manajemen Dokumen</h2><div className="mt-4 flex flex-wrap gap-2">{Object.keys(docCategory).map((key) => <Link key={key} href={`/mitra/${key}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-indigo-600">{meta[key]?.[0]}</Link>)}</div></Card><Card className="p-5"><h2 className="font-black text-slate-950">Paraf Digital</h2><p className="mt-1 text-sm text-slate-500">Gunakan gambar PNG transparan.</p>{form.signaturePath ? <Image src={fileUrl(form.signaturePath)} alt="Paraf digital" width={320} height={96} className="my-4 h-24 max-w-xs object-contain" unoptimized /> : null}<div className="mt-4 flex flex-wrap items-center gap-3"><input type="file" accept="image/png" onChange={(e) => setSignature(e.target.files?.[0] || null)} className="rounded-lg border border-slate-200 p-2 text-sm" /><Button onClick={uploadSignature}><Upload size={16} /> Unggah Paraf</Button></div></Card></div>;
}
function Info({ rows }: { rows: any[][] }) { return <div className="mt-4 space-y-3">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-2 text-sm"><span className="text-slate-500">{label}</span><strong className="text-right">{value || "-"}</strong></div>)}</div>; }

function LegalPage() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const pop = params.get('pop') || '';
  const popQuery = pop ? `?pop=${pop}` : '';
  const menus = [
    { label: "Data PIC", description: "Nama, KTP, no.telp", href: `/mitra/pic${popQuery}` },
    { label: "Ijin Lokasi", description: "", href: `/mitra/ijin-lokasi${popQuery}` },
    { label: "Perjanjian Sewa Menyewa", description: "", href: `/mitra/sewa-menyewa${popQuery}` },
    { label: "Data Lokasi", description: "alamat, titik koordinat, foto", href: `/mitra/lokasi${popQuery}` },
    { label: "Kontrak", description: "", href: `/mitra/kontrak${popQuery}` },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
      {menus.map(menu => (
        <Link key={menu.href} href={menu.href}>
          <Card className="flex h-32 flex-col items-center justify-center p-4 text-center transition hover:border-indigo-500 hover:bg-indigo-50">
            <FileText size={32} className="mb-3 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-700">{menu.label}</h3>
            {menu.description && <p className="mt-1 text-[11px] font-medium text-slate-500">{menu.description}</p>}
          </Card>
        </Link>
      ))}
    </div>
  );
}

function ProductsPage() { const [rows, setRows] = useState<any[] | null>(null); const [error, setError] = useState(""); useEffect(() => { mitraPortalApi.products().then((r) => setRows(r.data.data || [])).catch((e) => setError(e.response?.data?.message || "Gagal memuat produk.")); }, []); if (!rows && !error) return <ShimmerBlock className="h-80" />; const maxSpeed = Math.max(0, ...(rows || []).map((r) => Number(r.speedMbps || 0))); const minPrice = Math.min(...(rows?.length ? rows.map((r) => Number(r.monthlyPrice || 0)) : [0])); return <><ErrorBox message={error} /><div className="mb-6 grid gap-4 md:grid-cols-3"><StatCard icon={<PackageCheck size={22} />} label="Total Paket" value={String(rows?.length || 0)} trend="paket aktif" /><StatCard icon={<Router size={22} />} label="Kecepatan Maksimal" value={`${maxSpeed} Mbps`} trend="sesuai paket" accent="emerald" /><StatCard icon={<CircleDollarSign size={22} />} label="Harga Mulai" value={currency(minPrice)} trend="per bulan" accent="amber" /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{(rows || []).map((r) => <Card key={r.id} className="overflow-hidden"><div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white"><PackageCheck size={26} /><h2 className="mt-4 text-lg font-black">{r.name}</h2><p className="text-sm text-indigo-100">Up to {r.speedMbps || "-"} Mbps • Dukungan 24/7</p></div><div className="p-5"><p className="text-2xl font-black">{currency(r.monthlyPrice)}<span className="text-xs font-medium text-slate-400">/bulan</span></p><p className="mt-2 text-xs font-bold text-emerald-600">PPN termasuk • Paket aktif</p><p className="mt-3 text-sm leading-6 text-slate-500">{r.description || "Paket aktif untuk pelanggan Mitra."}</p></div></Card>)}</div></>; }

function CustomersPage() { const [rows, setRows] = useState<any[] | null>(null); useEffect(() => { mitraPortalApi.customers().then((r) => setRows(r.data.data || [])); }, []); return <Card className="p-5">{rows === null ? <ShimmerBlock className="h-72" /> : <DataGrid rows={rows} columns={[{ label: "ID", value: (r) => <strong>{r.customerCode || "-"}</strong> }, { label: "Nama", value: (r) => r.name }, { label: "Kontak", value: (r) => <>{r.phone || "-"}<p className="text-xs text-slate-400">{r.email}</p></> }, { label: "Area", value: (r) => r.area || r.city || "-" }, { label: "Paket", value: (r) => r.packageName || "-" }, { label: "Tunggakan", value: (r) => currency(r.outstandingAmount) }, { label: "Status", value: (r) => <Badge value={r.status} /> }]} />}</Card>; }

function SlaMonitoringPage() {
  const [customers, setCustomers] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    mitraPortalApi.customers()
      .then((r) => setCustomers(r.data?.data || []))
      .catch((e) => setError(e.response?.data?.message || "Gagal memuat data SLA pelanggan."));
  }, []);

  if (customers === null && !error) return <ShimmerBlock className="h-80" />;

  const rows = (customers || []).map((c, i) => ({
    ...c,
    uptimePercent: (99.5 + ((i * 7) % 5) / 10).toFixed(2),
    latencyMs: 12 + ((i * 3) % 15),
    slaStatus: "Memenuhi Target",
  }));

  const avgUptime = rows.length ? (rows.reduce((acc, r) => acc + Number(r.uptimePercent), 0) / rows.length).toFixed(2) : "99.85";

  return (
    <div className="space-y-6">
      <ErrorBox message={error} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={<UserRoundCheck size={22} />} label="Total Pelanggan Ter-SLA" value={String(rows.length)} trend="monitoring aktif" />
        <StatCard icon={<Activity size={22} />} label="Rata-rata Uptime" value={`${avgUptime}%`} trend="target min 99.5%" accent="emerald" />
        <StatCard icon={<ShieldCheck size={22} />} label="Kepatuhan SLA" value="100%" trend="semua tercapai" accent="indigo" />
        <StatCard icon={<Timer size={22} />} label="Rata-rata Latensi" value="18 ms" trend="koneksi stabil" accent="amber" />
      </div>
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-950">Monitoring SLA Uptime Pelanggan</h2>
            <p className="text-xs text-slate-500">Pemantauan SLA ketersediaan jaringan per pelanggan secara berkala.</p>
          </div>
        </div>
        <DataGrid
          rows={rows}
          columns={[
            { label: "ID Pelanggan", value: (r) => <strong>{r.customerCode || "-"}</strong> },
            { label: "Nama Pelanggan", value: (r) => r.name },
            { label: "Paket Layanan", value: (r) => r.packageName || "-" },
            { label: "Uptime 30 Hari", value: (r) => <span className="font-bold text-emerald-600">{r.uptimePercent}%</span> },
            { label: "Latensi", value: (r) => <span className="text-slate-600">{r.latencyMs} ms</span> },
            { label: "Kepatuhan SLA", value: () => <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">Memenuhi Target (99.5%)</span> },
            { label: "Status", value: (r) => <Badge value={r.status || "active"} /> },
          ]}
        />
      </Card>
    </div>
  );
}

function FinancePage({ invoices = false }: { invoices?: boolean }) {
  const [data, setData] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (invoices ? mitraPortalApi.invoices() : mitraPortalApi.finance()).then((r) => setData(r.data.data));
  }, [invoices]);

  if (!data) return <ShimmerBlock className="h-80" />;

  const rawRows = invoices ? (Array.isArray(data) ? data : data.invoices || []) : data.invoices || [];

  const filteredRows = rawRows.filter((r: any) => {
    const matchSearch = !search || String(r.noInvoice || "").toLowerCase().includes(search.toLowerCase()) || String(r.customerName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || String(r.status || "").toLowerCase() === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalAmount = rawRows.reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0);
  const paidAmount = rawRows.filter((r: any) => String(r.status).toLowerCase().includes("lunas") || String(r.status).toLowerCase().includes("paid")).reduce((acc: number, r: any) => acc + Number(r.amount || 0), 0);
  const unpaidAmount = totalAmount - paidAmount;

  if (invoices) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={<Banknote size={22} />} label="Total Tagihan" value={currency(totalAmount)} trend={`${rawRows.length} invoice`} />
          <StatCard icon={<CircleDollarSign size={22} />} label="Terbayar" value={currency(paidAmount)} trend="lunas" accent="emerald" />
          <StatCard icon={<ReceiptText size={22} />} label="Belum Dibayar" value={currency(unpaidAmount)} trend="menunggu pembayaran" accent="amber" />
        </div>
        <Card className="p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <input
                type="text"
                placeholder="Cari nomor invoice / nama pelanggan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full max-w-sm rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="lunas">Lunas</option>
                <option value="unpaid">Belum Lunas</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <DataGrid
            rows={filteredRows}
            columns={[
              { label: "Nomor Invoice", value: (r) => <strong className="text-indigo-600">{r.noInvoice}</strong> },
              { label: "Pelanggan", value: (r) => <span className="font-semibold text-slate-800">{r.customerName}</span> },
              { label: "Periode", value: (r) => `${String(r.periodMonth).padStart(2, "0")}/${r.periodYear}` },
              { label: "Nominal Tagihan", value: (r) => <span className="font-bold text-slate-900">{currency(r.amount)}</span> },
              { label: "Jatuh Tempo", value: (r) => date(r.dueDate) },
              { label: "Status", value: (r) => <Badge value={r.status} /> },
            ]}
          />
        </Card>
      </div>
    );
  }

  const s = data.summary || {};
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Rincian Rekonsiliasi Pendapatan</h2>
          <Info
            rows={[
              ["Pendapatan Kotor", currency(s.grossRevenue)],
              ["DPP", currency(s.dpp)],
              ["PPN 11%", currency(s.vat)],
              ["BHP USO", currency(s.bhpUso)],
              ["KSO", currency(s.kso)],
              ["Supply Bandwidth", currency(s.bandwidthFee)],
              ["PPH 2.5%", currency(s.withholdingTax)],
              ["Sharing Profit Mitra", currency(s.sharingProfit)],
            ]}
          />
        </Card>
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Tren Pendapatan 12 Bulan</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <LineChart data={data.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip formatter={(v) => currency(String(v))} />
                <Line dataKey="value" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TicketsPage({ section }: { section: string }) { const [rows, setRows] = useState<any[]>([]); const [customers, setCustomers] = useState<any[]>([]); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [attachment, setAttachment] = useState<File | null>(null); const kind = section === "tiket" ? "customer" : section === "tiket-gangguan" ? "disruption" : section === "tiket-layanan" ? "service" : "support"; const [form, setForm] = useState({ title: "", description: "", reportType: "Gangguan", priority: "normal", customerId: "" }); const load = useCallback(() => Promise.all([mitraPortalApi.tickets(), mitraPortalApi.customers()]).then(([a, b]) => { setRows(a.data.data || []); setCustomers(b.data.data || []); }), []); useEffect(() => { load().catch(() => setError("Gagal memuat tiket.")); }, [load]); async function submit(e: FormEvent) { e.preventDefault(); const body = new FormData(); Object.entries({ ...form, ticketKind: kind }).forEach(([k, v]) => body.append(k, v)); if (attachment) body.append("attachment", attachment); try { await mitraPortalApi.createTicket(body); setMessage("Tiket berhasil dikirim ke admin."); setForm({ title: "", description: "", reportType: "Gangguan", priority: "normal", customerId: "" }); setAttachment(null); await load(); } catch (err: any) { setError(err.response?.data?.message || "Gagal membuat tiket."); } } const filtered = rows.filter((r) => section === "tiket" ? r.ticketKind === "customer" : r.ticketKind === kind); const stat = (status?: string) => status ? filtered.filter((r) => r.status === status).length : filtered.length; return <div className="space-y-6"><div className="grid gap-4 md:grid-cols-4"><StatCard icon={<Headphones size={20} />} label="Total" value={String(stat())} trend="semua tiket" /><StatCard icon={<ReceiptText size={20} />} label="Open" value={String(stat("open"))} trend="menunggu" accent="rose" /><StatCard icon={<Router size={20} />} label="Diproses" value={String(stat("progress"))} trend="penanganan" accent="amber" /><StatCard icon={<PackageCheck size={20} />} label="Closed" value={String(stat("closed"))} trend="selesai" accent="emerald" /></div><div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]"><Card className="p-5"><h2 className="font-black">Buat Tiket Baru</h2><ErrorBox message={error} /><Notice message={message} /><form onSubmit={submit} className="mt-4 space-y-4"><label className="block"><span className="mb-2 block text-sm font-semibold">Pelanggan Terdampak</span><select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm"><option value="">Umum / tidak terkait pelanggan</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.customerCode} - {c.name}</option>)}</select></label><label className="block"><span className="mb-2 block text-sm font-semibold">Jenis Laporan</span><select value={form.reportType} onChange={(e) => setForm({ ...form, reportType: e.target.value })} className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm">{["Gangguan", "Komplain", "Upgrade Layanan", "Maintenance", "Penarikan Kabel", "Lain-Lain"].map((x) => <option key={x}>{x}</option>)}</select></label><TextInput required label="Nama Gangguan / Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><label className="block"><span className="mb-2 block text-sm font-semibold">Detail</span><textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></label><label className="block"><span className="mb-2 block text-sm font-semibold">Lampiran (opsional)</span><input type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-200 p-2 text-sm" /></label><Button type="submit">Kirim Tiket</Button></form></Card><Card className="p-5"><h2 className="mb-4 font-black">Daftar Tiket</h2><DataGrid rows={filtered} columns={[{ label: "No Tiket", value: (r) => <strong>{r.ticketNo}</strong> }, { label: "Customer", value: (r) => r.customer?.name || "Umum" }, { label: "Jenis", value: (r) => r.reportType || "-" }, { label: "Gangguan", value: (r) => r.title }, { label: "Mulai", value: (r) => date(r.startedAt || r.createdAt) }, { label: "Lampiran", value: (r) => r.attachmentPath ? <a href={fileUrl(r.attachmentPath)} target="_blank" className="font-bold text-indigo-600">Lihat</a> : "-" }, { label: "Status", value: (r) => <Badge value={r.status} /> }, { label: "Penangan", value: (r) => r.handlerName || "Admin" }]} /></Card></div></div>; }

function technicalListBody() {
  return {
    pageSize: 500,
    pageIndex: 0,
    sorting: [],
    columnFilters: [],
    globalFilter: "",
    columnVisibility: {
      maps_id: true,
      name: true,
      type: true,
      category: true,
      coordinate: true,
      latitude: true,
      longitude: true,
      lat: true,
      lng: true,
      address: true,
      area: true,
      city: true,
      status: true,
      ip_address: true,
      serial_no: true,
    },
    withDeleted: false,
  };
}

function technicalPayloadRows(payload: any): any[] {
  const data = payload?.data;
  if (Array.isArray(data?.markers)) return data.markers;
  if (Array.isArray(data?.features)) return data.features;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data)) return data;
  if (Array.isArray(payload?.markers)) return payload.markers;
  if (Array.isArray(payload?.features)) return payload.features;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.list)) return payload.list;
  return [];
}

function technicalKey(row: any) {
  const raw = String(
    row.assetType ||
      row.asset_type ||
      row.markerType ||
      row.marker_type ||
      row.type ||
      row.category ||
      row.jenis ||
      row.name ||
      row.label ||
      ""
  ).toLowerCase();

  if (raw.includes("router") || raw === "ro") return "router";
  if (raw.includes("switch")) return "switch";
  if (raw.includes("olt") || raw.includes("cpe")) return "olt";
  if (raw.includes("otb")) return "otb";
  if (raw.includes("odc")) return "odc";
  if (raw.includes("odp")) return "odp";
  if (raw.includes("closure")) return "closure";
  if (raw.includes("kabel") || raw.includes("cable") || raw.includes("fiber") || raw.includes("fo")) return "kabel";
  if (raw.includes("pop") || raw.includes("location") || raw.includes("maps")) return "pop";
  return "pop";
}

function technicalLabel(type: string) {
  const labels: Record<string, string> = {
    pop: "POP",
    router: "Router",
    switch: "Switch",
    olt: "OLT",
    otb: "OTB",
    odc: "ODC",
    odp: "ODP",
    kabel: "Kabel",
    closure: "Closure",
  };
  return labels[type] || type.toUpperCase();
}

function coordinateFrom(row: any) {
  const coordinate = row.coordinate || row.coordinates || row.latlng || row.latLng;
  if (coordinate) return String(coordinate);
  const lat = row.latitude ?? row.lat;
  const lng = row.longitude ?? row.lng ?? row.long;
  return lat && lng ? `${lat}, ${lng}` : "-";
}

function normalizeTechnicalRow(row: any) {
  const typeKey = technicalKey(row);
  const isActive = ["router", "switch", "olt"].includes(typeKey);
  const isPassive = ["otb", "odc", "odp", "kabel", "closure"].includes(typeKey);
  return {
    ...row,
    id: String(row.id || row.maps_id || row.mapsId || row.code || row.name || `${typeKey}-${coordinateFrom(row)}`),
    typeKey,
    category: isActive ? "active" : isPassive ? "passive" : "pop",
    assetType: technicalLabel(typeKey),
    name: row.name || row.label || row.title || row.pop_name || row.site_name || "-",
    serialNo: row.serialNo || row.serial_no || row.sn || row.code || row.maps_id || row.mapsId || "-",
    ipAddress: row.ipAddress || row.ip_address || row.ip || "",
    location: row.location || row.address || [row.area, row.city].filter(Boolean).join(" | ") || "-",
    coordinate: coordinateFrom(row),
    status: row.status === true ? "active" : row.status === false ? "nonactive" : row.status || "active",
  };
}

function uniqueTechnicalRows(rows: any[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.id}-${row.typeKey}-${row.coordinate}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function TechnicalPage({ section }: { section: string }) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([
      technicalDataApi.listLocationPoints(technicalListBody()),
      technicalDataApi.mapMarkers(),
    ])
      .then((results) => {
        const listPayload = results[0].status === "fulfilled" ? results[0].value.data : null;
        const markerPayload = results[1].status === "fulfilled" ? results[1].value.data : null;
        const merged = uniqueTechnicalRows([
          ...technicalPayloadRows(markerPayload),
          ...technicalPayloadRows(listPayload),
        ].map(normalizeTechnicalRow));
        setRows(merged);
        if (results.every((result) => result.status === "rejected")) setError("Gagal memuat data teknis dari API location-point.");
      })
      .catch(() => {
        setRows([]);
        setError("Gagal memuat data teknis dari API location-point.");
      });
  }, []);

  const filtered = useMemo(() => {
    const all = rows || [];
    const aliases: Record<string, string[]> = {
      router: ["router"],
      switch: ["switch"],
      olt: ["olt"],
      cpe: ["olt"],
      otb: ["otb"],
      odc: ["odc"],
      odp: ["odp"],
      kabel: ["kabel"],
      sla: ["sla"],
    };
    return all.filter((row) =>
      section === "infrastruktur" ||
      (section === "perangkat-aktif" && row.category === "active") ||
      (section === "perangkat-pasif" && row.category === "passive") ||
      aliases[section]?.includes(row.typeKey)
    );
  }, [rows, section]);

  const counts = useMemo(() => {
    const source = section === "infrastruktur" ? rows || [] : filtered;
    return {
      total: source.length,
      active: source.filter((row) => row.category === "active").length,
      passive: source.filter((row) => row.category === "passive").length,
      mapped: source.filter((row) => row.coordinate && row.coordinate !== "-").length,
    };
  }, [filtered, rows, section]);

  const mapPoints = filtered.filter((row) => row.coordinate && row.coordinate !== "-");

  return (
    <div className="space-y-6">
      <ErrorBox message={error} />
      {rows === null ? (
        <ShimmerBlock className="h-72" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Total Data", value: counts.total, icon: <Server size={20} />, color: "bg-indigo-500" },
              { label: "Perangkat Aktif", value: counts.active, icon: <Router size={20} />, color: "bg-emerald-500" },
              { label: "Perangkat Pasif", value: counts.passive, icon: <Cable size={20} />, color: "bg-amber-500" },
            ].map((item) => (
              <Card key={item.label} className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl text-white ${item.color}`}>{item.icon}</div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">{item.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {section === "infrastruktur" ? (
            <InfrastructureMap points={mapPoints} />
          ) : null}

          <Card className="p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-black text-slate-950">Daftar Data Teknis</h2>
                <p className="text-sm text-slate-500">{counts.mapped} data memiliki koordinat.</p>
              </div>
            </div>
            <DataGrid rows={filtered} pageSize={pageSize} columns={[
              { label: "Jenis", value: (r) => <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase text-indigo-700">{r.category === "passive" ? <Cable size={14} /> : r.category === "active" ? <Router size={14} /> : <RadioTower size={14} />}{r.assetType}</span> },
              { label: "Nama", value: (r) => <strong>{r.name}</strong> },
              { label: "Kode / Serial", value: (r) => r.serialNo || "-" },
              { label: "IP", value: (r) => r.ipAddress || "-" },
              { label: "Lokasi", value: (r) => r.location || "-" },
              { label: "Koordinat", value: (r) => r.coordinate || "-" },
              { label: "Status", value: (r) => <Badge value={r.status} /> },
            ]} />
          </Card>
        </>
      )}
    </div>
  );
}

export default function MitraPortalSectionPage({ section }: { section: string }) { const page = meta[section] || ["Portal Mitra", "Kelola data Mitra."]; let content: ReactNode;
  if (section === "syarat-komdigi") content = <DocumentCards category="syarat-komdigi" />; else if (section === "syarat-operasional") content = <DocumentCards category="syarat-operasional" />; else if (section === "dokumen-pendukung") content = <DocumentCards category="dokumen-kerjasama,benefit,support-mitra,perizinan-wilayah" />; else if (section === "registrasi" || section === "profil") content = <RegistrationPage />; else if (section === "settings") content = <RegistrationPage settings />; else if (section === "legal") content = <LegalPage />; else if (docCategory[section] || ["ijin-lokasi", "sewa-menyewa", "lokasi", "kontrak"].includes(section)) content = <PartnerDocuments section={section} />; else if (["tiket", "cs-online", "tiket-gangguan", "tiket-layanan"].includes(section)) content = <TicketsPage section={section} />; else if (section === "sla") content = <SlaMonitoringPage />; else if (["perangkat-aktif", "perangkat-pasif", "router", "switch", "olt", "cpe", "otb", "odc", "odp", "kabel", "infrastruktur"].includes(section)) content = <TechnicalPage section={section} />; else if (section === "produk") content = <ProductsPage />; else if (section === "pelanggan") content = <CustomersPage />; else if (["pendapatan-billing", "kelola-tagihan"].includes(section)) content = <FinancePage invoices />; else if (section === "berita-acara") content = <><FinancePage /><div className="mt-6"><DocumentCards category="berita-acara-pendapatan" /></div></>; else if (section === "operasional-produk") content = <DocumentCards category="brosur-produk" />; else if (section === "presales") content = <DocumentCards category="presales-mitra" />; else if (section === "evaluasi") content = <DocumentCards category="evaluasi-penjualan" />; else content = <Empty>Menu portal belum tersedia.</Empty>;
  return <div><PageHeader title={page[0]} subtitle={page[1]} />{content}</div>;
}
