"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Edit, Plus, Search, Trash2, X } from "lucide-react";

type Column<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, actionHref, actionLabel }: { title: string; subtitle: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs font-medium text-slate-500">Dashboard / {title}</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#6366F1] px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-500">
          <Plus size={16} /> {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={"rounded-xl border border-slate-200 bg-white shadow-sm " + className}>{children}</div>;
}

export function ShimmerBlock({ className = "" }: { className?: string }) {
  return <div className={"shimmer rounded-lg " + className} />;
}

export function StatSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-5">
          <div className="flex items-center gap-3">
            <ShimmerBlock className="h-11 w-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <ShimmerBlock className="h-3 w-24" />
              <ShimmerBlock className="h-7 w-32" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({ columns = 6, rows = 6, showHeader = true }: { columns?: number; rows?: number; showHeader?: boolean }) {
  return (
    <Card className="overflow-hidden">
      {showHeader ? (
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <ShimmerBlock className="h-4 w-40" />
            <ShimmerBlock className="h-3 w-28" />
          </div>
          <ShimmerBlock className="h-10 w-full lg:w-80" />
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-4 py-3">
                  <ShimmerBlock className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((__, colIndex) => (
                  <td key={colIndex} className="px-4 py-4">
                    <ShimmerBlock className={colIndex === 0 ? "h-4 w-24" : "h-4 w-32"} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
        <ShimmerBlock className="h-4 w-28" />
        <div className="flex gap-2">
          <ShimmerBlock className="h-9 w-9" />
          <ShimmerBlock className="h-9 w-9" />
        </div>
      </div>
    </Card>
  );
}

export function StatCard({ icon, label, value, trend, accent = "indigo" }: { icon: ReactNode; label: string; value: string; trend: string; accent?: "indigo" | "emerald" | "amber" | "rose" }) {
  const colors = {
    indigo: "bg-indigo-500 text-white",
    emerald: "bg-emerald-500 text-white",
    amber: "bg-amber-500 text-white",
    rose: "bg-rose-500 text-white",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div className={"grid h-12 w-12 place-items-center rounded-xl " + colors[accent]}>{icon}</div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
          <p className="mt-1 text-xs font-medium text-emerald-600">{trend}</p>
        </div>
      </div>
    </Card>
  );
}

export function Badge({ value }: { value?: string }) {
  const key = String(value || "").toLowerCase();
  const cls = key.includes("paid") && !key.includes("unpaid")
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
    : key.includes("unpaid") || key.includes("belum") || key.includes("prospect")
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : key.includes("lost") || key.includes("overdue") || key.includes("non")
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-indigo-50 text-indigo-700 ring-indigo-200";
  return <span className={"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 " + cls}>{value || "-"}</span>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, className = "", ...rest } = props;
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span> : null}
      <input {...rest} value={rest.value ?? ""} className={"h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 " + className} />
    </label>
  );
}

type SelectInputProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  label?: string;
  options: { label: string; value: string }[];
  onChange?: (event: { target: { value: string } }) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
};

export function SelectInput(props: SelectInputProps) {
  const { label, options, className = "", value, defaultValue, onChange, disabled, searchable = false, searchPlaceholder = "Cari data...", ...rest } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedValue = String(value ?? defaultValue ?? "");
  const selected = options.find((item) => item.value === selectedValue) || options[0];
  const visibleOptions = searchable && query.trim()
    ? options.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  function choose(nextValue: string) {
    onChange?.({ target: { value: nextValue } });
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    function closeOnOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, [open]);

  return (
    <div ref={rootRef} className={"relative " + className}>
      {label ? <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span> : null}
      <select
        {...rest}
        value={selectedValue}
        disabled={disabled}
        onChange={(event) => onChange?.({ target: { value: event.target.value } })}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        {options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={"flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 text-left text-sm text-slate-900 shadow-sm transition " + (open ? "border-indigo-500 ring-4 ring-indigo-100" : "border-slate-200 hover:border-slate-300") + (disabled ? " cursor-not-allowed bg-slate-50 text-slate-400" : "")}
      >
        <span className="truncate">{selected?.label || "Pilih opsi"}</span>
        <ChevronDown size={17} className={"ml-3 shrink-0 text-slate-400 transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && !disabled ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/12">
          {searchable ? (
            <div className="relative mb-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          ) : null}
          <div className="max-h-64 overflow-y-auto">
            {visibleOptions.length ? visibleOptions.map((item) => {
              const active = item.value === selectedValue;
              return (
                <button
                  key={item.value}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(item.value)}
                  className={"flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition " + (active ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50 hover:text-slate-950")}
                >
                  <span>{item.label}</span>
                  {active ? <Check size={16} className="text-indigo-600" /> : null}
                </button>
              );
            }) : (
              <div className="px-3 py-6 text-center text-sm font-semibold text-slate-400">Data tidak ditemukan</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  const { label, className = "", ...rest } = props;
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span> : null}
      <textarea {...rest} value={rest.value ?? ""} className={"min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 " + className} />
    </label>
  );
}

export function DataTable<T extends { id: string }>({ title, data, columns, searchPlaceholder = "Cari data...", editBasePath, onDelete, canDelete, extraActions }: { title?: string; data: T[]; columns: Column<T>[]; searchPlaceholder?: string; editBasePath?: string; onDelete?: (row: T) => void; canDelete?: (row: T) => boolean; extraActions?: (row: T) => ReactNode }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<T | null>(null);
  const pageSize = 8;
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [data, query]);
  const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {title ? <h2 className="text-base font-bold text-slate-950">{title}</h2> : null}
          <p className="text-sm text-slate-500">Menampilkan {rows.length} dari {filtered.length} data</p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={searchPlaceholder} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">No</th>
              {columns.map((column) => <th key={String(column.key)} className={"px-4 py-3 " + (column.className || "")}>{column.header}</th>)}
              {(editBasePath || onDelete) ? <th className="px-4 py-3 text-right">Aksi</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 text-slate-500">{(page - 1) * pageSize + index + 1}</td>
                {columns.map((column) => <td key={String(column.key)} className={"px-4 py-3 text-slate-700 " + (column.className || "")}>{column.render ? column.render(row) : String((row as any)[column.key] ?? "-")}</td>)}
                {(editBasePath || onDelete || extraActions) ? (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {extraActions ? extraActions(row) : null}
                      {editBasePath ? <Link href={editBasePath + "/" + row.id + "/edit"} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600" title="Edit"><Edit size={15} /></Link> : null}
                      {onDelete && (canDelete ? canDelete(row) : true) ? <button onClick={() => setConfirm(row)} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-rose-500 hover:border-rose-200 hover:bg-rose-50" title="Hapus"><Trash2 size={15} /></button> : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-16 text-center">
                  <div className="mx-auto max-w-sm">
                    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400"><Search size={20} /></div>
                    <p className="font-semibold text-slate-800">Data belum tersedia</p>
                    <p className="mt-1 text-sm text-slate-500">Coba ubah pencarian atau tambahkan data baru.</p>
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
        <p className="text-sm text-slate-500">Halaman {page} dari {maxPage}</p>
        <div className="flex gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40" disabled={page === 1}><ChevronLeft size={16} /></button>
          <button onClick={() => setPage(Math.min(maxPage, page + 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40" disabled={page === maxPage}><ChevronRight size={16} /></button>
        </div>
      </div>
      {confirm ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-950">Hapus data?</h3>
              <button onClick={() => setConfirm(null)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <p className="text-sm text-slate-600">Data ini akan dihapus dari daftar. Pastikan tidak sedang dipakai pada transaksi aktif.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setConfirm(null)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Batal</button>
              <button onClick={() => { onDelete?.(confirm); setConfirm(null); }} className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white">Hapus</button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export function FormShell({ title, subtitle, children, onSubmit, backHref = ".." }: { title: string; subtitle: string; children: ReactNode; onSubmit?: () => void; backHref?: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="p-6">
        <form onSubmit={(event) => { event.preventDefault(); onSubmit?.(); }} className="space-y-6">
          {children}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <Link href={backHref} className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Batal</Link>
            <button className="h-10 rounded-lg bg-[#6366F1] px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-200">Simpan</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
