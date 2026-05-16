"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import api from "@/lib/api";
import { Badge, Card, DataTable, PageHeader, TableSkeleton } from "@/components/ui/AdminUI";
import { currency, date, monthName } from "@/lib/format";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText, Filter, MinusCircle, PlusCircle, Power, RefreshCw, Search } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { Fragment, useEffect, useMemo, useState } from "react";

function useRows<T>(endpoint: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    setToast("");
    api.get(endpoint)
      .then((res) => setRows(res.data.data))
      .catch(() => {
        setRows([]);
        setToast("Gagal memuat data. Pastikan backend aktif dan sesi login valid.");
      })
      .finally(() => setLoading(false));
  }, [endpoint]);
  return { rows, setRows, toast, setToast, loading };
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div>;
}

async function deleteRow(endpoint: string, row: any, setRows: Dispatch<SetStateAction<any[]>>, setToast: (message: string) => void, successMessage: string) {
  try {
    await api.delete(endpoint + "/" + row.id);
    setRows((current) => current.filter((item) => item.id !== row.id));
    setToast(successMessage);
  } catch (err: any) {
    setToast(err.response?.data?.message || "Gagal menghapus data.");
  }
}

export function UsersPage({ role, title }: { role: string; title: string }) {
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/users?role=" + role);
  const basePath = role === "admin" ? "/users" : "/users/" + (role === "pelanggan" ? "pelanggan" : role);
  const createPath = role === "admin" ? "/users/admin/create" : basePath + "/new";
  return (
    <div>
      <PageHeader title={title} subtitle={"Kelola akun " + title.toLowerCase() + " MyRingNet."} actionHref={createPath} actionLabel={"Tambah " + title} />
      <Toast message={toast} />
      {loading ? <TableSkeleton columns={6} /> :
      <DataTable data={rows as any[]} editBasePath={basePath} onDelete={(row) => deleteRow("/users", row, setRows as any, setToast, "User berhasil dihapus.")}
        columns={[
          { key: "name", header: "Nama", render: (row: any) => <span className="font-semibold text-slate-900">{row.name}</span> },
          { key: "email", header: "Email" },
          { key: "role", header: "Role", render: (row: any) => <Badge value={row.role} /> },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status || "active"} /> },
          { key: "createdAt", header: "Dibuat", render: (row: any) => date(row.createdAt) },
        ]}
      />
      }
    </div>
  );
}

export function CustomersPage() {
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/customers?limit=2000");
  return (
    <div>
      <PageHeader title="Pelanggan" subtitle="Data pelanggan individu beserta paket dan status layanan." actionHref="/users/pelanggan/new" actionLabel="Tambah Pelanggan" />
      <Toast message={toast} />
      {loading ? <TableSkeleton columns={8} /> :
      <DataTable data={rows as any[]} editBasePath="/users/pelanggan" onDelete={(row) => deleteRow("/customers", row, setRows as any, setToast, "Pelanggan berhasil dihapus.")}
        columns={[
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
          { key: "customerCode", header: "ID Pelanggan", render: (row: any) => <Link href={`/users/pelanggan/${row.id}`} className="font-semibold text-indigo-600 hover:underline">{row.customerCode || row.id.slice(0, 8)}</Link> },
          { key: "name", header: "Nama", render: (row: any) => <span className="font-semibold text-slate-800">{row.name}</span> },
          { key: "phone", header: "Nomor Telepon", render: (row: any) => row.phone || "-" },
          { key: "area", header: "Area", render: (row: any) => row.area || "-" },
          { key: "city", header: "Kota", render: (row: any) => row.city || "-" },
          { key: "customerType", header: "Jenis Pelanggan", render: (row: any) => row.customerType || "-" },
          { key: "lastActivity", header: "Aktivitas", render: (row: any) => row.lastActivity ? date(row.lastActivity) : "-" },
        ]}
      />
      }
    </div>
  );
}

export function CompaniesPage() {
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/companies");
  return (
    <div>
      <PageHeader title="Bisnis / Perusahaan" subtitle="Kelola data PT, CV, instansi, kantor, dan pelanggan enterprise." actionHref="/users/bisnis/new" actionLabel="Tambah Bisnis" />
      <Toast message={toast} />
      {loading ? <TableSkeleton columns={6} /> :
      <DataTable data={rows as any[]} editBasePath="/users/bisnis" onDelete={(row) => deleteRow("/companies", row, setRows as any, setToast, "Bisnis berhasil dihapus.")}
        columns={[
          { key: "companyCode", header: "ID Mitra", render: (row: any) => <Link href={`/users/bisnis/${row.id}`} className="font-semibold text-indigo-600 hover:underline">{row.companyCode || "-"}</Link> },
          { key: "name", header: "Nama Perusahaan / Instansi", render: (row: any) => <span className="font-semibold text-slate-900">{row.name}</span> },
          { key: "email", header: "Email" },
          { key: "phone", header: "Kontak" },
          { key: "area", header: "Area" },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status || "active"} /> },
        ]}
      />
      }
    </div>
  );
}

export function PartnersPage() {
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/partners");
  return (
    <div>
      <PageHeader title="Mitra Bisnis" subtitle="Kelola mitra perseorangan atau individual sebagai channel penjualan MyRingNet." actionHref="/users/mitra/new" actionLabel="Tambah Mitra" />
      <Toast message={toast} />
      {loading ? <TableSkeleton columns={6} /> :
      <DataTable data={rows as any[]} editBasePath="/users/mitra" onDelete={(row) => deleteRow("/partners", row, setRows as any, setToast, "Mitra berhasil dihapus.")}
        columns={[
          { key: "partnerCode", header: "ID Mitra", render: (row: any) => <Link href={`/users/mitra/${row.id}`} className="font-semibold text-indigo-600 hover:underline">{row.partnerCode || "-"}</Link> },
          { key: "name", header: "Nama Mitra", render: (row: any) => <span className="font-semibold text-slate-900">{row.name}</span> },
          { key: "phone", header: "Kontak" },
          { key: "email", header: "Email", render: (row: any) => row.email || "-" },
          { key: "area", header: "Area" },
          { key: "city", header: "Kota" },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
        ]}
      />
      }
    </div>
  );
}

export function LeadsPage() {
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/marketing");
  return (
    <div>
      <PageHeader title="Leads" subtitle="Pipeline marketing dari prospect sampai deal/lost." actionHref="/marketing/leads/new" actionLabel="Tambah Lead" />
      <Toast message={toast} />
      {loading ? <TableSkeleton columns={6} /> :
      <DataTable data={rows as any[]} editBasePath="/marketing/leads" onDelete={(row) => deleteRow("/marketing", row, setRows as any, setToast, "Lead berhasil dihapus.")}
        columns={[
          { key: "customerName", header: "Nama Lead", render: (row: any) => <span className="font-semibold text-slate-900">{row.customerName || row.name}</span> },
          { key: "partner", header: "Mitra", render: (row: any) => row.partner?.name || row.partnerName || "-" },
          { key: "phone", header: "Kontak" },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
          { key: "createdAt", header: "Dibuat", render: (row: any) => date(row.createdAt) },
        ]}
      />
      }
    </div>
  );
}

function invoiceStatus(row: any, now: Date | null) {
  const status = String(row.status || "").toUpperCase();
  if (status === "PAID") return { label: "Lunas", className: "bg-emerald-500 text-white" };
  if (!now || !row.dueDate) return { label: "Belum Lunas", className: "bg-amber-500 text-white" };

  const dueDate = new Date(row.dueDate);
  if (Number.isNaN(dueDate.getTime())) return { label: "Belum Lunas", className: "bg-amber-500 text-white" };

  const dayDiff = Math.ceil((dueDate.getTime() - now.getTime()) / 86_400_000);
  if (dayDiff >= 0) return { label: `Dalam ${Math.max(dayDiff, 1)} Hari`, className: "bg-amber-500 text-white" };

  const lateDays = Math.abs(dayDiff);
  if (lateDays >= 30) return { label: `${Math.max(1, Math.floor(lateDays / 30))} Bulan Yang Lalu`, className: "bg-rose-500 text-white" };
  return { label: `${lateDays} Hari Yang Lalu`, className: "bg-rose-500 text-white" };
}

function invoicePurpose(row: any) {
  const code = row.customer?.customerCode;
  const name = row.customer?.name || row.customerName;
  return code ? `${code} - ${name}` : name || "-";
}

function invoiceName(row: any) {
  if (row.invoiceName) return row.invoiceName;
  if (row.periodMonth && row.periodYear) return `Periode ${monthName(row.periodMonth)} ${row.periodYear}`;
  return row.serviceType || "-";
}

function AddInvoiceMenu() {
  const [open, setOpen] = useState(false);
  const items = [
    { label: "Faktur Pelanggan", href: "/internet-services/new?type=pelanggan", icon: FileText },
    { label: "Faktur Umum", href: "/internet-services/new?type=umum", icon: FileText },
    { label: "Faktur Mitra & Bisnis", href: "/internet-services/new?type=mitra-bisnis", icon: FileText },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-500"
      >
        <PlusCircle size={18} /> Tambah
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/10">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function filterInvoices(rows: any[], search: string) {
  const keyword = search.trim().toLowerCase();
  if (!keyword) return rows;
  return rows.filter((row) => [
    row.noFaktur,
    row.noInvoice,
    row.customerName,
    row.serviceType,
    row.customer?.customerCode,
    row.customer?.name,
  ].some((value) => String(value || "").toLowerCase().includes(keyword)));
}

function pageNumbers(page: number, totalPages: number) {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function InternetServicesPage() {
  const pageSize = 10;
  const { rows, toast, loading } = useRows<any>("/internet-services?limit=500");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => filterInvoices(rows, search), [rows, search]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const showingStart = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd = Math.min(page * pageSize, filteredRows.length);

  useEffect(() => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [search]);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500">Dashboard / Keuangan / Faktur & Tagihan</div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Faktur & Tagihan</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola faktur pelanggan, faktur umum, dan faktur mitra bisnis.</p>
        </div>
        <AddInvoiceMenu />
      </div>
      <Toast message={toast} />
      {loading ? (
        <TableSkeleton columns={7} />
      ) : (
        <Card className="overflow-visible">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Menampilkan {showingStart} - {showingEnd} dari {filteredRows.length} data
              </p>
              <p className="mt-1 text-xs text-slate-400">10 faktur per halaman</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari faktur, tujuan, layanan..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-80"
                />
              </label>
              <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600" type="button" title="Filter">
                <Filter size={16} /> Filter
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600" type="button" title="Refresh">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto bg-white">
            <table className="w-full min-w-[1180px] border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-slate-500">
                  {["Status", "Nomor Faktur", "Jenis", "Tujuan", "Total Tagihan", "Nama Faktur", "Dukungan Pembayaran"].map((header) => (
                    <th key={header} className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {visibleRows.map((row: any) => {
                  const expanded = expandedId === row.id;
                  const status = invoiceStatus(row, now);
                  return (
                    <Fragment key={row.id}>
                      <tr className={expanded ? "bg-indigo-50" : "hover:bg-slate-50"}>
                        <td className="border-b border-slate-100 px-4 py-4">
                          <button type="button" onClick={() => setExpandedId(expanded ? null : row.id)} className="inline-flex items-center gap-2">
                            {expanded ? <MinusCircle size={19} className="text-rose-500" /> : <PlusCircle size={19} className="text-indigo-600" />}
                            <span className={"rounded-full px-2.5 py-1 text-xs font-bold " + status.className}>{status.label}</span>
                          </button>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4 font-bold">
                          <Link className="text-indigo-600 hover:underline" href={"/internet-services/" + row.id}>{row.noFaktur || row.noInvoice}</Link>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4">
                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">{row.invoiceType || "Pelanggan"}</span>
                        </td>
                        <td className="border-b border-slate-100 px-4 py-4 font-semibold">{invoicePurpose(row)}</td>
                        <td className="border-b border-slate-100 px-4 py-4 font-semibold">{currency(row.amount)}</td>
                        <td className="border-b border-slate-100 px-4 py-4">{invoiceName(row)}</td>
                        <td className="border-b border-slate-100 px-4 py-4">{row.customer?.supportPayment || row.supportPayment || "-"}</td>
                      </tr>
                      {expanded ? (
                        <tr key={`${row.id}-detail`}>
                          <td colSpan={7} className="border-b border-slate-200 bg-indigo-50/50 px-6 py-5 text-slate-700">
                            <div className="grid gap-4 md:grid-cols-4">
                              <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Autentikasi</div>
                                <div className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600">
                                  {row.customer?.email || row.customer?.username || row.customerName || "-"}
                                  <Power size={16} className="text-rose-500" />
                                </div>
                              </div>
                              <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Tanggal</div>
                                <div className="mt-1 text-sm font-semibold text-slate-700">{date(row.createdAt)}</div>
                              </div>
                              <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Jatuh Tempo</div>
                                <div className="mt-1 text-sm font-semibold text-slate-700">{date(row.dueDate)}</div>
                              </div>
                              <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Pengingat</div>
                                <div className="mt-1 text-sm font-semibold text-slate-700">0 Pesan Terkirim</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
            {filteredRows.length === 0 ? (
              <div className="py-16 text-center text-sm font-semibold text-slate-500">Data faktur belum tersedia.</div>
            ) : null}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="font-medium text-slate-500">Halaman {page} dari {totalPages}</div>
              <div className="flex items-center gap-2">
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <ChevronLeft size={17} />
                </button>
                {pageNumbers(page, totalPages).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={"h-9 min-w-9 rounded-lg px-3 text-sm font-bold transition " + (pageNumber === page ? "bg-[#6366F1] text-white shadow-sm shadow-indigo-200" : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600")}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
