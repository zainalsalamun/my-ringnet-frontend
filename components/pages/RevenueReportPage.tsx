"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { Card, PageHeader, SelectInput, StatSkeleton, TableSkeleton } from "@/components/ui/AdminUI";
import { currency, date, extractArrayData, monthName } from "@/lib/format";
import { downloadExcelFile } from "@/lib/excel-export";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { resourcesApi } from "@/src/features/resources/api";
import { settingsApi } from "@/src/features/settings/api";
import {
  ArrowDownToLine,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Filter,
  Layers,
  Percent,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const MONTH_OPTIONS = [
  { label: "Semua Bulan", value: "all" },
  { label: "Januari", value: "1" },
  { label: "Februari", value: "2" },
  { label: "Maret", value: "3" },
  { label: "April", value: "4" },
  { label: "Mei", value: "5" },
  { label: "Juni", value: "6" },
  { label: "Juli", value: "7" },
  { label: "Agustus", value: "8" },
  { label: "September", value: "9" },
  { label: "Oktober", value: "10" },
  { label: "November", value: "11" },
  { label: "Desember", value: "12" },
];

const YEAR_OPTIONS = [
  { label: "Semua Tahun", value: "all" },
  { label: "2024", value: "2024" },
  { label: "2025", value: "2025" },
  { label: "2026", value: "2026" },
  { label: "2027", value: "2027" },
];

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

function getInvoiceMonth(row: any): number | null {
  if (row.periodMonth) return Number(row.periodMonth);
  if (row.period_month) return Number(row.period_month);
  const text = String([row.invoiceName, row.noFaktur, row.noInvoice].filter(Boolean).join(" ")).toLowerCase();
  const found = Object.entries(invoiceMonthMap).find(([name]) => text.includes(name));
  if (found) return found[1];
  const numMatch = String(row.noFaktur || row.noInvoice || "").match(/\/(0?[1-9]|1[0-2])\/(20\d{2})/);
  if (numMatch) return Number(numMatch[1]);
  if (row.createdAt) {
    const d = new Date(row.createdAt);
    if (!isNaN(d.getTime())) return d.getMonth() + 1;
  }
  return null;
}

function getInvoiceYear(row: any): number | null {
  if (row.periodYear) return Number(row.periodYear);
  if (row.period_year) return Number(row.period_year);
  const text = String([row.invoiceName, row.noFaktur, row.noInvoice].filter(Boolean).join(" "));
  const yearMatch = text.match(/20\d{2}/);
  if (yearMatch) return Number(yearMatch[0]);
  if (row.createdAt) {
    const d = new Date(row.createdAt);
    if (!isNaN(d.getTime())) return d.getFullYear();
  }
  return null;
}

function getCustomerCategory(row: any): "pelanggan" | "bisnis" {
  const type = String(row.invoiceType || row.type || row.customer?.type || row.customerType || row.customer_type || "").toLowerCase();
  if (type.includes("bisnis") || type.includes("mitra") || type.includes("corporate") || type.includes("company") || type.includes("business") || type.includes("partner") || type.includes("reseller")) return "bisnis";
  if (row.customer?.companyName || row.companyName || row.company || row.partner_id || row.partnerId || row.partnerCode || row.partner) return "bisnis";
  const service = String(row.serviceType || row.packageName || row.package_name || "").toLowerCase();
  if (service.includes("corporate") || service.includes("dedicated") || service.includes("bisnis") || service.includes("business")) return "bisnis";
  return "pelanggan";
}

function safeText(value: any, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "object") return String(value.name || value.customer_id || value._id || value.id || fallback);
  return String(value);
}

function getCustomerCode(row: any) {
  if (row.customer?.customerCode && !/^[0-9a-fA-F]{24}$/.test(String(row.customer.customerCode))) return String(row.customer.customerCode);
  if (row.customer?.customer_id && !/^[0-9a-fA-F]{24}$/.test(String(row.customer.customer_id))) return String(row.customer.customer_id);
  if (row.customerId && !/^[0-9a-fA-F]{24}$/.test(String(row.customerId))) return String(row.customerId);
  if (row.customer_id && !/^[0-9a-fA-F]{24}$/.test(String(row.customer_id))) return String(row.customer_id);
  if (row.noFaktur && String(row.noFaktur).includes("/")) {
    const parts = String(row.noFaktur).split("/");
    const last = parts[parts.length - 1];
    if (last && last !== "AUTO" && !/^[0-9a-fA-F]{24}$/.test(last)) return last;
  }
  return row.id ? `CUST-${String(row.id).slice(-4).toUpperCase()}` : "-";
}

function getCustomerName(row: any) {
  return safeText(row.customer?.name || row.customerName || row.customer?.companyName || row.customer?.username);
}

function getPackageName(row: any) {
  if (row.serviceType) return String(row.serviceType);
  if (row.packageName) return String(row.packageName);
  if (row.customer?.package?.name) return String(row.customer.package.name);
  if (row.invoiceName) return String(row.invoiceName);
  return "Paket Internet";
}

function pageNumbers(page: number, totalPages: number) {
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function RevenueReportPage() {
  const pageSize = 10;
  const [rows, setRows] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Optional checkbox filters for customer types (unchecked by default: shows all)
  const [includeRetail, setIncludeRetail] = useState(false); // Pelanggan
  const [includeBusiness, setIncludeBusiness] = useState(false); // Pelanggan Bisnis

  // Period filters
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const [printingId, setPrintingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      resourcesApi.list("/internet-services?limit=5000&sort=latest"),
      settingsApi.list().catch(() => ({ data: { data: [] } })),
    ])
      .then(([invoiceRes, settingsRes]) => {
        setRows(extractArrayData<any>(invoiceRes?.data));
        setSettings(extractArrayData<any>(settingsRes?.data));
      })
      .catch(() => {
        setRows([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const safeRows = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);

  // Compute revenue items with tax breakdowns
  const processedRows = useMemo(() => {
    return safeRows.map((row) => {
      const totalTagihan = Number(row.amount || 0);
      const dpp = Math.round(totalTagihan / 1.11);
      const ppn11 = Math.round(dpp * 0.11);
      const bhp = Math.round(dpp * 0.005); // 0.5%
      const uso = Math.round(dpp * 0.0125); // 1.25%

      const customerCategory = getCustomerCategory(row);
      const invoiceMonth = getInvoiceMonth(row);
      const invoiceYear = getInvoiceYear(row);

      return {
        ...row,
        customerCode: getCustomerCode(row),
        customerNameClean: getCustomerName(row),
        packageNameClean: getPackageName(row),
        dpp,
        ppn11,
        bhp,
        uso,
        totalTagihan,
        customerCategory,
        invoiceMonth,
        invoiceYear,
      };
    });
  }, [safeRows]);

  // Filtered dataset
  const filteredRows = useMemo(() => {
    // Checkbox is an optional filter:
    // If only Pelanggan is checked -> show only Pelanggan
    // If only Pelanggan Bisnis is checked -> show only Pelanggan Bisnis
    // If both or neither is checked -> show BOTH (do not filter out)
    const filterRetailOnly = includeRetail && !includeBusiness;
    const filterBusinessOnly = !includeRetail && includeBusiness;

    return processedRows.filter((item) => {
      // Customer type filter
      if (filterRetailOnly && item.customerCategory !== "pelanggan") return false;
      if (filterBusinessOnly && item.customerCategory !== "bisnis") return false;

      // Month filter
      if (monthFilter !== "all" && item.invoiceMonth !== Number(monthFilter)) return false;

      // Year filter
      if (yearFilter !== "all" && item.invoiceYear !== Number(yearFilter)) return false;

      // Search keyword
      if (search.trim()) {
        const keyword = search.trim().toLowerCase();
        const matches = [
          item.customerCode,
          item.customerNameClean,
          item.packageNameClean,
          item.noFaktur,
          item.noInvoice,
        ].some((val) => String(val || "").toLowerCase().includes(keyword));
        if (!matches) return false;
      }

      return true;
    });
  }, [processedRows, includeRetail, includeBusiness, monthFilter, yearFilter, search]);

  // Summary Totals
  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, item) => {
        acc.dpp += item.dpp;
        acc.ppn11 += item.ppn11;
        acc.bhp += item.bhp;
        acc.uso += item.uso;
        acc.totalTagihan += item.totalTagihan;
        return acc;
      },
      { dpp: 0, ppn11: 0, bhp: 0, uso: 0, totalTagihan: 0 }
    );
  }, [filteredRows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);
  const showingStart = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd = Math.min(page * pageSize, filteredRows.length);

  useEffect(() => {
    setPage(1);
  }, [search, monthFilter, yearFilter, includeRetail, includeBusiness]);

  const handleReset = () => {
    setSearch("");
    setIncludeRetail(false);
    setIncludeBusiness(false);
    setMonthFilter("all");
    setYearFilter("all");
    setPage(1);
  };

  const handleDownloadExcel = () => {
    const periodTitle = [
      monthFilter !== "all" ? monthName(Number(monthFilter)) : "",
      yearFilter !== "all" ? yearFilter : "",
    ]
      .filter(Boolean)
      .join(" ");

    const filterDescription = [
      includeRetail && !includeBusiness
        ? "Hanya Pelanggan"
        : !includeRetail && includeBusiness
        ? "Hanya Pelanggan Bisnis"
        : "Pelanggan & Pelanggan Bisnis",
      periodTitle || "Semua Periode",
      search.trim() ? `Cari: ${search.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    downloadExcelFile({
      title: `LAPORAN PENDAPATAN & PAJAK ISP (${filterDescription})`,
      filename: `Laporan_Pendapatan_${(periodTitle || "Semua_Periode").replace(/\s+/g, "_")}_${new Date().getTime()}`,
      sheetName: "Laporan Pendapatan",
      columns: [
        { header: "ID Pelanggan", key: "customerCode", type: "string", width: 110 },
        { header: "Nama Pelanggan", key: "customerNameClean", type: "string", width: 180 },
        { header: "Kategori", key: "categoryLabel", type: "string", width: 110 },
        { header: "Paket", key: "packageNameClean", type: "string", width: 140 },
        { header: "DPP", key: "dpp", type: "currency", width: 120 },
        { header: "PPN 11%", key: "ppn11", type: "currency", width: 110 },
        { header: "BHP (0.5%)", key: "bhp", type: "currency", width: 110 },
        { header: "USO (1.25%)", key: "uso", type: "currency", width: 110 },
        { header: "Total Tagihan", key: "totalTagihan", type: "currency", width: 130 },
      ],
      data: filteredRows.map((row) => ({
        ...row,
        categoryLabel: row.customerCategory === "bisnis" ? "Bisnis" : "Pelanggan",
      })),
      includeSummaryRow: true,
    });
  };

  const handlePrint = async (row: any) => {
    try {
      setPrintingId(row.id);
      await downloadInvoicePdf(
        {
          id: row.id,
          noInvoice: row.noFaktur || row.noInvoice,
          customerName: row.customerNameClean,
          serviceType: row.packageNameClean,
          periodMonth: row.invoiceMonth || undefined,
          periodYear: row.invoiceYear || undefined,
          amount: row.totalTagihan,
          status: row.status,
          dueDate: row.dueDate,
          createdAt: row.createdAt,
        },
        settings
      );
    } catch {
      alert("Gagal mencetak dokumen faktur.");
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Laporan Pendapatan"
        subtitle="Rekapitulasi pendapatan, rincian Dasar Pengenaan Pajak (DPP), PPN 11%, BHP, USO, dan ekspor data keuangan."
      />

      {/* Stats Cards */}
      {loading ? (
        <StatSkeleton count={4} />
      ) : (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5 border-l-4 border-l-indigo-600">
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
                <Wallet size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Pendapatan</p>
                <p className="mt-1 text-xl font-black text-slate-950 truncate">{currency(totals.totalTagihan)}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-indigo-600">{filteredRows.length} tagihan terhitung</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-emerald-600">
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-100">
                <Layers size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total DPP</p>
                <p className="mt-1 text-xl font-black text-slate-950 truncate">{currency(totals.dpp)}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">Dasar Pengenaan Pajak</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-cyan-600">
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-600 text-white shadow-md shadow-cyan-100">
                <Percent size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">PPN 11%</p>
                <p className="mt-1 text-xl font-black text-slate-950 truncate">{currency(totals.ppn11)}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-cyan-600">Pajak Pertambahan Nilai</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-amber-600">
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-600 text-white shadow-md shadow-amber-100">
                <ShieldCheck size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">BHP & USO</p>
                <p className="mt-1 text-xl font-black text-slate-950 truncate">{currency(totals.bhp + totals.uso)}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-amber-600">BHP: {currency(totals.bhp)} | USO: {currency(totals.uso)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Control Box */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Customer Type Checkboxes */}
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Tipe Pelanggan:</span>
              <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeRetail}
                  onChange={(e) => setIncludeRetail(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Pelanggan
              </label>

              <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={includeBusiness}
                  onChange={(e) => setIncludeBusiness(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Pelanggan Bisnis
              </label>
            </div>

            {/* Month Filter */}
            <div className="w-40 min-w-[145px]">
              <SelectInput
                options={MONTH_OPTIONS}
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              />
            </div>

            {/* Year Filter */}
            <div className="w-40 min-w-[145px]">
              <SelectInput
                options={YEAR_OPTIONS}
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              />
            </div>

            {/* Search Input */}
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID, pelanggan, paket..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-56"
              />
            </label>
          </div>

          {/* Right: Actions (Reset & Download Excel) */}
          <div className="flex items-center gap-2.5 self-end lg:self-center">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              title="Reset Filter"
            >
              <RotateCcw size={15} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={filteredRows.length === 0}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              title="Download Data Excel"
            >
              <FileSpreadsheet size={16} />
              Download Excel
            </button>
          </div>
        </div>

        {/* Active Filter Indicator Bar */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs">
          <span className="font-semibold text-slate-500">Filter Aktif:</span>
          {includeRetail && !includeBusiness ? (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 font-bold text-blue-700 ring-1 ring-blue-200">
              Kategori: Pelanggan
            </span>
          ) : !includeRetail && includeBusiness ? (
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-1 font-bold text-purple-700 ring-1 ring-purple-200">
              Kategori: Pelanggan Bisnis
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
              Semua Kategori (Pelanggan & Bisnis)
            </span>
          )}

          {monthFilter !== "all" ? (
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
              Bulan: {monthName(Number(monthFilter))}
            </span>
          ) : null}

          {yearFilter !== "all" ? (
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
              Tahun: {yearFilter}
            </span>
          ) : null}

          {search ? (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 ring-1 ring-amber-200">
              Kata Kunci: &quot;{search}&quot;
            </span>
          ) : null}
        </div>
      </Card>

      {/* Main Table */}
      {loading ? (
        <TableSkeleton columns={10} />
      ) : (
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-2 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">Rincian Laporan Pendapatan</h2>
              <p className="text-xs text-slate-500">
                Menampilkan {showingStart} - {showingEnd} dari {filteredRows.length} baris data pendapatan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                10 data per halaman
              </span>
              <button
                type="button"
                onClick={loadData}
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white">
            <table className="w-full min-w-[1180px] border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-slate-50">
                <tr className="text-slate-500">
                  <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide">
                    ID Pelanggan
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide">
                    Nama Pelanggan
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide">
                    Kategori
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-xs font-bold uppercase tracking-wide">
                    Paket
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide">
                    DPP
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide">
                    PPN 11%
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide">
                    BHP (0.5%)
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide">
                    USO (1.25%)
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide">
                    Total Tagihan
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {visibleRows.map((row: any, idx: number) => {
                  const isPrinting = printingId === row.id;
                  const isBisnis = row.customerCategory === "bisnis";
                  return (
                    <tr key={row.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-indigo-600 whitespace-nowrap">
                        {row.customerCode}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        {row.customerNameClean}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={
                            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 " +
                            (isBisnis
                              ? "bg-purple-50 text-purple-700 ring-purple-200"
                              : "bg-blue-50 text-blue-700 ring-blue-200")
                          }
                        >
                          {isBisnis ? "Pelanggan Bisnis" : "Pelanggan"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{row.packageNameClean}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-800">{currency(row.dpp)}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-800">{currency(row.ppn11)}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-800">{currency(row.bhp)}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-800">{currency(row.uso)}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-950">
                        {currency(row.totalTagihan)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handlePrint(row)}
                          disabled={isPrinting}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50"
                          title="Cetak Faktur"
                        >
                          <Printer size={14} />
                          <span>{isPrinting ? "Mencetak..." : "Cetak"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-sm font-semibold text-slate-500">
                      Tidak ada data pendapatan yang cocok dengan filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>

              {/* Summary Totals Footer Row */}
              {filteredRows.length > 0 ? (
                <tfoot className="border-t-2 border-slate-300 bg-slate-100/90 font-bold text-slate-950">
                  <tr>
                    <td colSpan={4} className="px-4 py-3.5 text-right uppercase tracking-wider text-xs font-black">
                      Total ({filteredRows.length} Tagihan)
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm text-indigo-900">{currency(totals.dpp)}</td>
                    <td className="px-4 py-3.5 text-right text-sm text-cyan-900">{currency(totals.ppn11)}</td>
                    <td className="px-4 py-3.5 text-right text-sm text-amber-900">{currency(totals.bhp)}</td>
                    <td className="px-4 py-3.5 text-right text-sm text-amber-900">{currency(totals.uso)}</td>
                    <td className="px-4 py-3.5 text-right text-sm font-black text-emerald-900">
                      {currency(totals.totalTagihan)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Akumulasi</span>
                    </td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="font-medium text-slate-500">
              Halaman {page} dari {totalPages}
            </div>
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
                  className={
                    "h-9 min-w-9 rounded-lg px-3 text-sm font-bold transition " +
                    (pageNumber === page
                      ? "bg-[#6366F1] text-white shadow-sm shadow-indigo-200"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600")
                  }
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
        </Card>
      )}
    </div>
  );
}
