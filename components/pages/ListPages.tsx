"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import api from "@/lib/api";
import { Badge, DataTable, PageHeader, TableSkeleton } from "@/components/ui/AdminUI";
import { currency, date, monthName } from "@/lib/format";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import Link from "next/link";
import { Download } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

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
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/customers");
  return (
    <div>
      <PageHeader title="Pelanggan" subtitle="Data pelanggan individu beserta paket dan status layanan." actionHref="/users/pelanggan/new" actionLabel="Tambah Pelanggan" />
      <Toast message={toast} />
      {loading ? <TableSkeleton columns={6} /> :
      <DataTable data={rows as any[]} editBasePath="/users/pelanggan" onDelete={(row) => deleteRow("/customers", row, setRows as any, setToast, "Pelanggan berhasil dihapus.")}
        columns={[
          { key: "name", header: "Nama", render: (row: any) => <Link href={`/users/pelanggan/${row.id}`} className="font-semibold text-indigo-600 hover:underline">{row.name}</Link> },
          { key: "area", header: "Area" },
          { key: "packageName", header: "Paket", render: (row: any) => row.packageName || "-" },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
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

export function InternetServicesPage() {
  const { rows, setRows, toast, setToast, loading } = useRows<any>("/internet-services");

  async function download(row: any) {
    try {
      const settings = await api.get("/settings?limit=100&search=company_").then((res) => res.data.data).catch(() => []);
      await downloadInvoicePdf(row, settings);
      setToast("PDF invoice berhasil diunduh.");
    } catch {
      setToast("Gagal mengunduh PDF invoice.");
    }
  }

  return (
    <div>
      <PageHeader title="Layanan Internet" subtitle="Kelola tagihan bulanan, status invoice, dan periode layanan." actionHref="/internet-services/new" actionLabel="Tambah Layanan" />
      <Toast message={toast} />
      {loading ? <TableSkeleton columns={8} /> :
      <DataTable data={rows as any[]} editBasePath="/internet-services" onDelete={(row) => deleteRow("/internet-services", row, setRows as any, setToast, "Invoice berhasil dihapus.")}
        extraActions={(row) => (
          <button
            type="button"
            onClick={() => download(row)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
            title="Unduh PDF"
          >
            <Download size={15} />
          </button>
        )}
        columns={[
          { key: "noInvoice", header: "No Invoice", render: (row: any) => <Link className="font-semibold text-indigo-600 hover:underline" href={"/internet-services/" + row.id}>{row.noInvoice}</Link> },
          { key: "customerName", header: "Pelanggan" },
          { key: "serviceType", header: "Paket" },
          { key: "periodMonth", header: "Periode", render: (row: any) => monthName(row.periodMonth) + " " + row.periodYear },
          { key: "amount", header: "Tagihan", render: (row: any) => currency(row.amount) },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status} /> },
          { key: "dueDate", header: "Jatuh Tempo", render: (row: any) => date(row.dueDate) },
        ]}
      />
      }
    </div>
  );
}
