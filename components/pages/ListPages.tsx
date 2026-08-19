"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import api from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuth";
import { Badge, Card, DataTable, PageHeader, TableSkeleton } from "@/components/ui/AdminUI";
import { currency, date, monthName } from "@/lib/format";
import Link from "next/link";
import { ArrowDownUp, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, FileText, Filter, Grid3X3, List, ListFilter, MinusCircle, Phone, PlusCircle, Power, RefreshCw, Search, Store, Trash2, Upload, UserPlus } from "lucide-react";
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
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const load = () => {
    setLoading(true);
    setToast("");

    // Call DEKASIMAL API POST /api/v1/customer/list
    api.post("/customer/list", {
      pageSize: 500,
      pageIndex: 0,
      sorting: [],
      columnFilters: [],
      globalFilter: "",
      columnVisibility: {
        customer_id: true,
        name: true,
        area: true,
        type: true,
        address: true,
        phone: true,
        status: true,
        package_name: true,
        created_at: true,
        updated_at: true,
      },
      withDeleted: false,
    })
      .then((res) => {
        const raw = res.data?.data?.data || res.data?.data || res.data?.rows || [];
        const normalized = raw.map((item: any) => ({
          id: item.id || item.customer_id,
          customerCode: item.customer_id || item.customerCode || String(item.id || "").slice(0, 8),
          name: item.name || item.username || "-",
          phone: item.phone || "-",
          area: item.area || "-",
          city: item.city || item.address || "-",
          address: item.address || "-",
          packageName: item.package_name || item.packageName || item.product || item.product_name || "-",
          packagePrice: item.package_price || item.price || item.monthly_fee || null,
          customerType: item.type || item.customerType || "home",
          status: item.status === false ? "nonactive" : (item.status === true || item.status === "active" ? "active" : item.status || "active"),
          lastActivity: item.updated_at || item.created_at || item.createdAt || null,
        }));
        setRows(normalized);
      })
      .catch(() => {
        // Fallback to legacy GET /customers
        api.get("/customers?limit=5000")
          .then((res) => setRows(res.data?.data || []))
          .catch(() => {
            setRows([]);
            setToast("Gagal memuat data pelanggan dari server.");
          });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchQuery = !q || [
        row.customerCode,
        row.name,
        row.phone,
        row.area,
        row.city,
        row.address,
        row.packageName,
        row.customerType,
      ].some((value) => String(value || "").toLowerCase().includes(q));
      const matchStatus = statusFilter === "all" || String(row.status || "").toLowerCase() === statusFilter;
      const matchType = typeFilter === "all" || String(row.customerType || "").toLowerCase().includes(typeFilter);
      return matchQuery && matchStatus && matchType;
    });
  }, [rows, query, statusFilter, typeFilter]);

  const maxPage = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => filteredRows.slice((page - 1) * pageSize, page * pageSize), [filteredRows, page]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, typeFilter, viewMode]);

  useEffect(() => {
    if (page <= maxPage) return;
    setPage(maxPage);
  }, [maxPage, page]);

  const stats = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const createdThisMonth = rows.filter((row) => {
      const created = new Date(row.lastActivity || row.createdAt || "");
      return Number.isFinite(created.getTime()) && created.getMonth() === month && created.getFullYear() === year;
    }).length;
    const active = rows.filter((row) => String(row.status || "").toLowerCase() === "active").length;
    return {
      newCustomers: createdThisMonth,
      activity: rows.filter((row) => row.lastActivity).length,
      active,
      inactive: Math.max(0, rows.length - active),
    };
  }, [rows]);

  async function handleDelete(row: any) {
    try {
      try {
        await api.delete(`/customer/delete/${row.id}`);
      } catch {
        await api.delete(`/customers/${row.id}`);
      }
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast("Pelanggan berhasil dihapus.");
    } catch (err: any) {
      setToast(err.response?.data?.message || "Gagal menghapus pelanggan.");
    }
  }

  async function handleToggleStatus(row: any) {
    const nextActive = String(row.status || "").toLowerCase() !== "active";
    const nextStatus = nextActive ? "active" : "nonactive";
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: nextStatus } : item));
    try {
      await api.patch("/customer/update", { selectedCustomerId: row.id, status: nextActive });
      setToast(`Status pelanggan ${row.name} berhasil diubah.`);
    } catch (err: any) {
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: row.status } : item));
      setToast(err.response?.data?.message || "Gagal mengubah status pelanggan.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pelanggan"
        subtitle="Data pelanggan individu beserta paket, status layanan, dan aktivitas."
        rightContent={
          <Link href="/users/pelanggan/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-500">
            <PlusCircle size={18} /> Pelanggan Baru
          </Link>
        }
      />
      <Toast message={toast} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CustomerMetricCard icon={<UserPlus size={22} />} label="Pelanggan Baru" value={String(stats.newCustomers)} accent="text-fuchsia-600" />
        <CustomerMetricCard icon={<ArrowDownUp size={22} />} label="Aktifivitas" value={String(stats.activity)} accent="text-emerald-600" />
        <CustomerMetricCard icon={<CheckCircle2 size={22} />} label="Aktif" value={String(stats.active)} accent="text-blue-600" />
        <CustomerMetricCard icon={<MinusCircle size={22} />} label="Tidak Aktif" value={String(stats.inactive)} accent="text-amber-600" />
      </div>

      <section>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Daftar Pelanggan</h2>
            <p className="mt-1 text-sm text-slate-500">Menampilkan {paginatedRows.length} dari {filteredRows.length} pelanggan.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari..." className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="nonactive">Tidak Aktif</option>
            </select>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
              <option value="all">Semua Jenis</option>
              <option value="home">Perumahan</option>
              <option value="business">Bisnis</option>
            </select>
            <button type="button" onClick={load} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" title="Refresh">
              <RefreshCw size={18} />
            </button>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" title="Export">
              <Upload size={18} />
            </button>
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button type="button" onClick={() => setViewMode("list")} className={"grid h-9 w-10 place-items-center rounded-lg " + (viewMode === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")} title="Tampilan list"><List size={18} /></button>
              <button type="button" onClick={() => setViewMode("grid")} className={"grid h-9 w-10 place-items-center rounded-lg " + (viewMode === "grid" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")} title="Tampilan grid"><Grid3X3 size={18} /></button>
            </div>
          </div>
        </div>

        {loading ? <TableSkeleton columns={8} /> : viewMode === "list" ? (
          <Card className="overflow-visible">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-700">
                  <tr>
                    <CustomerTh>Status</CustomerTh>
                    <CustomerTh>Pelanggan</CustomerTh>
                    <CustomerTh>Nama</CustomerTh>
                    <CustomerTh>No. Telepon</CustomerTh>
                    <CustomerTh>Produk</CustomerTh>
                    <CustomerTh>Jenis</CustomerTh>
                    <CustomerTh>Aktifivitas</CustomerTh>
                    <CustomerTh className="text-right">Aksi</CustomerTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.map((row) => (
                    <tr key={row.id} className="bg-white hover:bg-slate-50/80">
                      <td className="px-4 py-5">
                        <button type="button" onClick={() => handleToggleStatus(row)} className={"relative h-7 w-14 rounded-full transition " + (String(row.status).toLowerCase() === "active" ? "bg-blue-600" : "bg-slate-300")} title="Ubah status">
                          <span className={"absolute top-1 h-5 w-5 rounded-full bg-white shadow transition " + (String(row.status).toLowerCase() === "active" ? "left-8" : "left-1")} />
                        </button>
                      </td>
                      <td className="px-4 py-5">
                        <Link href={`/users/pelanggan/${row.id}`} className="font-bold text-indigo-600 hover:underline">{row.customerCode || row.id.slice(0, 8)}</Link>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar name={row.name} code={row.customerCode} />
                          <div>
                            <Link href={`/users/pelanggan/${row.id}`} className="font-bold text-indigo-600 hover:underline">{row.name}</Link>
                            <p className="mt-1 text-xs font-semibold text-slate-500">{[row.area, row.city].filter(Boolean).join("  |  ") || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <PhonePill phone={row.phone} />
                      </td>
                      <td className="px-4 py-5">
                        <ProductPill name={row.packageName} price={row.packagePrice} />
                      </td>
                      <td className="px-4 py-5">
                        <TypePill type={row.customerType} />
                      </td>
                      <td className="px-4 py-5">
                        <div className="font-bold text-slate-800">{row.lastActivity ? date(row.lastActivity) : "-"}</div>
                      </td>
                      <td className="relative px-4 py-5 text-right">
                        <button type="button" onClick={() => setOpenActionId(openActionId === row.id ? null : row.id)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                          <ListFilter size={17} /> Pilih Aksi <ChevronDown size={15} />
                        </button>
                        {openActionId === row.id ? (
                          <CustomerActionMenu row={row} onClose={() => setOpenActionId(null)} onDelete={handleDelete} />
                        ) : null}
                      </td>
                    </tr>
                  ))}
                  {!paginatedRows.length ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-16 text-center text-sm font-semibold text-slate-500">Data pelanggan tidak ditemukan.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            <CustomerPagination page={page} maxPage={maxPage} total={filteredRows.length} pageSize={pageSize} onPageChange={setPage} />
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedRows.map((row) => (
              <Card key={row.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CustomerAvatar name={row.name} code={row.customerCode} />
                    <div>
                      <Link href={`/users/pelanggan/${row.id}`} className="font-black text-indigo-600 hover:underline">{row.name}</Link>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{row.customerCode}</p>
                    </div>
                  </div>
                  <Badge value={row.status} />
                </div>
                <div className="mt-4 space-y-3">
                  <PhonePill phone={row.phone} />
                  <ProductPill name={row.packageName} price={row.packagePrice} />
                  <TypePill type={row.customerType} />
                </div>
                <div className="mt-5 flex gap-2">
                  <Link href={`/users/pelanggan/${row.id}`} className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-bold text-white">Detail</Link>
                  <Link href={`/users/pelanggan/${row.id}/edit`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700">Edit</Link>
                </div>
              </Card>
            ))}
            <div className="md:col-span-2 xl:col-span-3">
              <CustomerPagination page={page} maxPage={maxPage} total={filteredRows.length} pageSize={pageSize} onPageChange={setPage} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function CustomerMetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <Card className="bg-slate-100/80 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-3xl font-black tracking-tight text-slate-900">{value}</p>
          <p className="mt-3 text-sm font-semibold text-slate-600">{label}</p>
        </div>
        <div className={accent}>{icon}</div>
      </div>
    </Card>
  );
}

function CustomerTh({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={"whitespace-nowrap px-4 py-4 align-top font-black " + className}>
      <div className="flex items-center gap-2">
        <span>{children}</span>
        <ArrowDownUp size={14} className="text-slate-400" />
      </div>
    </th>
  );
}

function CustomerAvatar({ name, code }: { name?: string; code?: string }) {
  const colors = ["bg-cyan-100 text-cyan-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700", "bg-indigo-100 text-indigo-700"];
  const seed = String(code || name || "P").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const initials = String(name || "P").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "P";
  return <div className={"grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-black " + colors[seed % colors.length]}>{initials}</div>;
}

function PhonePill({ phone }: { phone?: string }) {
  const normalized = String(phone || "").replace(/\D/g, "");
  if (!normalized) return <span className="text-slate-400">-</span>;
  const whatsapp = normalized.startsWith("62") ? normalized : normalized.startsWith("0") ? `62${normalized.slice(1)}` : normalized;
  return (
    <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1 text-sm font-bold text-slate-900 hover:bg-emerald-50 hover:text-emerald-700">
      <Phone size={14} className="text-emerald-500" /> {phone}
    </a>
  );
}

function ProductPill({ name, price }: { name?: string; price?: number | string | null }) {
  const text = [name && name !== "-" ? name : "Produk belum diisi", price ? currency(price) : ""].filter(Boolean).join(" : ");
  const premium = /rimax1|bronze|125/i.test(text);
  return (
    <span className={"inline-flex max-w-[260px] rounded-lg px-2.5 py-1 text-xs font-bold leading-5 " + (premium ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-700")}>
      <span className="truncate">{text}</span>
    </span>
  );
}

function TypePill({ type }: { type?: string }) {
  const label = String(type || "Perumahan/Apartemen/Kos").replace(/^home$/i, "Perumahan/Apartemen/Kos").replace(/^business$/i, "Bisnis/Enterprise");
  return (
    <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">
      <Store size={15} /> {label}
    </span>
  );
}

function CustomerActionMenu({ row, onClose, onDelete }: { row: any; onClose: () => void; onDelete: (row: any) => void }) {
  return (
    <div className="absolute right-4 top-16 z-20 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl">
      <Link onClick={onClose} href={`/users/pelanggan/${row.id}`} className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Detail Pelanggan</Link>
      <Link onClick={onClose} href={`/users/pelanggan/${row.id}/edit`} className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit Profil</Link>
      <Link onClick={onClose} href={`/internet-services?customerId=${encodeURIComponent(row.id)}`} className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Faktur & Tagihan</Link>
      <Link onClick={onClose} href={`/radius/autentikasi?customerId=${encodeURIComponent(row.id)}`} className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Autentikasi PPPoE</Link>
      <Link onClick={onClose} href={`/dokumen/nik-npwp?customerId=${encodeURIComponent(row.id)}`} className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Dokumen</Link>
      <button type="button" onClick={() => { onClose(); onDelete(row); }} className="block w-full px-4 py-3 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50">Hapus Pelanggan</button>
    </div>
  );
}

function CustomerPagination({ page, maxPage, total, pageSize, onPageChange }: { page: number; maxPage: number; total: number; pageSize: number; onPageChange: Dispatch<SetStateAction<number>> }) {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(total, page * pageSize);
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-500">Menampilkan {start}-{end} dari {total} data</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPageChange(1)} disabled={page === 1} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">Awal</button>
        <button type="button" onClick={() => onPageChange((current) => Math.max(1, current - 1))} disabled={page === 1} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button>
        <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">{page} / {maxPage}</span>
        <button type="button" onClick={() => onPageChange((current) => Math.min(maxPage, current + 1))} disabled={page === maxPage} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button>
        <button type="button" onClick={() => onPageChange(maxPage)} disabled={page === maxPage} className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">Akhir</button>
      </div>
    </div>
  );
}


export function CompaniesPage() {
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/companies?limit=5000");
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
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/partners?limit=5000");
  return (
    <div>
      <PageHeader title="Reseller & Mitra" subtitle="Kelola akun reseller atau mitra sebagai channel penjualan MyRingNet." actionHref="/users/mitra/new" actionLabel="Tambah Reseller / Mitra" />
      <Toast message={toast} />
      {loading ? <TableSkeleton columns={6} /> :
      <DataTable data={rows as any[]} editBasePath="/users/mitra" onDelete={(row) => deleteRow("/partners", row, setRows as any, setToast, "Mitra berhasil dihapus.")}
        columns={[
          { key: "partnerCode", header: "ID Mitra", render: (row: any) => <Link href={`/users/mitra/${row.id}`} className="font-semibold text-indigo-600 hover:underline">{row.partnerCode || "-"}</Link> },
          { key: "partnerType", header: "Jenis", render: (row: any) => <Badge value={row.partnerType === "reseller" ? "Reseller" : "Mitra"} /> },
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
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/marketing?limit=5000");
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

const invoiceMonthMap: Record<string, number> = {
  januari: 1,
  februari: 2,
  maret: 3,
  april: 4,
  mei: 5,
  juni: 6,
  juli: 7,
  agustus: 8,
  september: 9,
  oktober: 10,
  november: 11,
  desember: 12,
};

function invoicePeriodValue(row: any) {
  const text = String([row.invoiceName, row.noFaktur, row.noInvoice].filter(Boolean).join(" "));
  const textLower = text.toLowerCase();
  const textYear = Number(text.match(/20\d{2}/)?.[0] || 0);
  const textMonth = Object.entries(invoiceMonthMap).find(([name]) => textLower.includes(name))?.[1] || 0;
  if (textYear && textMonth) return textYear * 100 + textMonth;

  const invoiceNumberPeriod = String(row.noFaktur || row.noInvoice || "").match(/\/(0?[1-9]|1[0-2])\/(20\d{2})/);
  if (invoiceNumberPeriod) return Number(invoiceNumberPeriod[2]) * 100 + Number(invoiceNumberPeriod[1]);

  const fieldYear = Number(row.periodYear || row.period_year || 0);
  const fieldMonth = Number(row.periodMonth || row.period_month || 0);
  if (fieldYear && fieldMonth) return fieldYear * 100 + fieldMonth;

  return 0;
}

function sortInvoicesByLatest(rows: any[]) {
  return [...rows].sort((a, b) => {
    const periodDiff = invoicePeriodValue(b) - invoicePeriodValue(a);
    if (periodDiff !== 0) return periodDiff;
    const createdDiff = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (createdDiff !== 0) return createdDiff;
    return String(b.noFaktur || b.noInvoice || "").localeCompare(String(a.noFaktur || a.noInvoice || ""));
  });
}

function pageNumbers(page: number, totalPages: number) {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function InternetServicesPage() {
  const pageSize = 10;
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/internet-services?limit=5000&sort=latest");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const user = useAuthStore((state) => state.user);
  const canDeleteInvoice = user?.role === "super_admin";

  const filteredRows = useMemo(() => sortInvoicesByLatest(filterInvoices(rows, search)), [rows, search]);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const showingStart = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd = Math.min(page * pageSize, filteredRows.length);
  const tableHeaders = canDeleteInvoice ? ["Status", "Nomor Faktur", "Jenis", "Tujuan", "Total Tagihan", "Nama Faktur", "Dukungan Pembayaran", "Aksi"] : ["Status", "Nomor Faktur", "Jenis", "Tujuan", "Total Tagihan", "Nama Faktur", "Dukungan Pembayaran"];
  const detailColSpan = tableHeaders.length;

  useEffect(() => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [search, rows]);

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
      {deleteConfirm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20">
            <h2 className="text-lg font-bold text-slate-950">Hapus faktur?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Faktur <span className="font-bold text-slate-800">{deleteConfirm.noFaktur || deleteConfirm.noInvoice}</span> akan dihapus permanen. Aksi ini hanya tersedia untuk superadmin.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">Batal</button>
              <button
                type="button"
                onClick={async () => {
                  const target = deleteConfirm;
                  setDeleteConfirm(null);
                  await deleteRow("/internet-services", target, setRows as any, setToast, "Faktur berhasil dihapus.");
                }}
                className="h-10 rounded-lg bg-rose-500 px-4 text-sm font-bold text-white shadow-sm shadow-rose-100 hover:bg-rose-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {loading ? (
        <TableSkeleton columns={canDeleteInvoice ? 8 : 7} />
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
                  {tableHeaders.map((header) => (
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
                        {canDeleteInvoice ? (
                          <td className="border-b border-slate-100 px-4 py-4">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(row)}
                              className="grid h-9 w-9 place-items-center rounded-lg border border-rose-100 text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
                              title="Hapus faktur"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        ) : null}
                      </tr>
                      {expanded ? (
                        <tr key={`${row.id}-detail`}>
                          <td colSpan={detailColSpan} className="border-b border-slate-200 bg-indigo-50/50 px-6 py-5 text-slate-700">
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
