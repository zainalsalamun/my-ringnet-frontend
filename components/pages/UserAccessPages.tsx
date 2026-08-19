"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import api from "@/lib/api";
import { Badge, Card, DataTable, PageHeader, StatSkeleton, TableSkeleton } from "@/components/ui/AdminUI";
import { date } from "@/lib/format";
import { BriefcaseBusiness, KeyRound, ShieldCheck, ShieldQuestion, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AdminRow = {
  id: string;
  adminId?: string;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  position?: string;
  division?: string;
  status?: string;
  createdAt?: string;
  lastLogin?: string;
};

const roleLabel = (role?: string) => {
  const key = String(role || "").toLowerCase();
  if (key === "super_admin" || key.includes("super")) return "Super Admin";
  if (key === "admin") return "Admin";
  return role || "Admin";
};

const normalizeAdmin = (item: any): AdminRow => {
  const isSuper = item.super === true || item.role === "super_admin" || String(item.position || "").toLowerCase().includes("super");
  return {
    id: String(item.admin_id || item.adminId || item.id || item._id || ""),
    adminId: item.admin_id || item.adminId,
    name: item.name || item.username || "-",
    username: item.username || "",
    email: item.email || item.username || "",
    phone: item.phone || "",
    role: isSuper ? "super_admin" : (item.role || "admin"),
    position: item.position || (isSuper ? "Super Admin" : "Administrator"),
    division: item.division || (isSuper ? "Management" : "Operational"),
    status: item.status === true || item.status === "active" ? "active" : "nonactive",
    createdAt: item.created_at || item.createdAt,
    lastLogin: item.last_login || item.lastLogin,
  };
};

function useAdminRows() {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setLoading(true);
    setToast("");
    api.post("/admin/list", {
      pageSize: 500,
      pageIndex: 0,
      sorting: [],
      columnFilters: [],
      globalFilter: "",
      columnVisibility: {
        admin_id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        status: true,
        division: true,
        position: true,
        last_login: true,
      },
      withDeleted: false,
    })
      .then((res) => {
        const raw = res.data?.data?.data || res.data?.data || res.data?.rows || res.data?.list || [];
        setRows(raw.map(normalizeAdmin).filter((row: AdminRow) => row.id));
      })
      .catch(() => {
        setRows([]);
        setToast("Gagal memuat data user dari API.");
      })
      .finally(() => setLoading(false));
  }, []);

  return { rows, loading, toast };
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div>;
}

function AccessSummary({ rows }: { rows: AdminRow[] }) {
  const stats = useMemo(() => {
    const active = rows.filter((row) => row.status === "active").length;
    const superAdmins = rows.filter((row) => row.role === "super_admin").length;
    const employees = rows.filter((row) => row.role !== "super_admin").length;
    return { active, superAdmins, employees };
  }, [rows]);

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 text-white"><Users size={20} /></div>
          <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total User Panel</p><p className="text-2xl font-black">{rows.length}</p></div>
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 text-white"><ShieldCheck size={20} /></div>
          <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Aktif</p><p className="text-2xl font-black">{stats.active}</p></div>
        </div>
      </Card>
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500 text-white"><BriefcaseBusiness size={20} /></div>
          <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Employee</p><p className="text-2xl font-black">{stats.employees}</p></div>
        </div>
      </Card>
    </div>
  );
}

export function AdminUsersPage() {
  const { rows, loading, toast } = useAdminRows();
  const adminRows = rows.filter((row) => row.role === "super_admin" || row.role === "admin");

  return (
    <div>
      <PageHeader title="Admin" subtitle="Kelola akun admin dan super admin seperti struktur apps.ring." actionHref="/users/admin/create" actionLabel="Tambah Admin" />
      <Toast message={toast} />
      {loading ? <StatSkeleton count={3} /> : <AccessSummary rows={adminRows} />}
      {loading ? <TableSkeleton columns={7} /> : (
        <DataTable
          title="Daftar Admin"
          data={adminRows}
          editBasePath="/users"
          searchPlaceholder="Cari nama, username, email, divisi..."
          columns={[
            { key: "adminId", header: "ID Admin", render: (row: AdminRow) => <span className="font-bold text-indigo-600">{row.adminId || row.id}</span> },
            { key: "name", header: "Nama", render: (row: AdminRow) => <span className="font-semibold text-slate-900">{row.name}</span> },
            { key: "email", header: "Email" },
            { key: "division", header: "Divisi" },
            { key: "position", header: "Jabatan" },
            { key: "role", header: "Privilege", render: (row: AdminRow) => <Badge value={roleLabel(row.role)} /> },
            { key: "status", header: "Status", render: (row: AdminRow) => <Badge value={row.status || "active"} /> },
          ]}
        />
      )}
    </div>
  );
}

export function EmployeePage() {
  const { rows, loading, toast } = useAdminRows();
  const employees = rows.filter((row) => row.role !== "super_admin");

  return (
    <div>
      <PageHeader title="Employee" subtitle="Daftar karyawan/staff internal yang memiliki akses operasional panel." actionHref="/users/new" actionLabel="Tambah Employee" />
      <Toast message={toast} />
      {loading ? <StatSkeleton count={3} /> : <AccessSummary rows={employees} />}
      {loading ? <TableSkeleton columns={7} /> : (
        <DataTable
          title="Daftar Employee"
          data={employees}
          editBasePath="/users"
          searchPlaceholder="Cari employee, divisi, jabatan..."
          columns={[
            { key: "name", header: "Nama", render: (row: AdminRow) => <span className="font-semibold text-slate-900">{row.name}</span> },
            { key: "username", header: "Username" },
            { key: "email", header: "Email" },
            { key: "phone", header: "No. Telepon" },
            { key: "division", header: "Divisi" },
            { key: "position", header: "Jabatan" },
            { key: "status", header: "Status", render: (row: AdminRow) => <Badge value={row.status || "active"} /> },
            { key: "lastLogin", header: "Login Terakhir", render: (row: AdminRow) => row.lastLogin ? date(row.lastLogin) : "-" },
          ]}
        />
      )}
    </div>
  );
}

const privilegeRows = [
  { id: "super_admin", role: "Super Admin", description: "Akses penuh seluruh modul aplikasi.", users: "super_admin", access: ["Pengguna", "Keuangan", "Legal", "Data Teknis", "Operasional", "Pengaturan"] },
  { id: "admin", role: "Admin", description: "Akses operasional sesuai divisi dan penugasan.", users: "admin", access: ["Pelanggan", "Tiket", "Dokumen", "Radius", "Dashboard"] },
  { id: "mitra", role: "Reseller / Mitra", description: "Akses portal mitra untuk pelaporan, dokumen, pelanggan, dan tiket.", users: "mitra", access: ["Dashboard Mitra", "Dokumen", "Pelanggan Mitra", "Tiket", "Produk"] },
];

export function PrivilegePage() {
  return (
    <div>
      <PageHeader title="Privilege" subtitle="Ringkasan role dan hak akses modul. Detail permission menunggu endpoint privilege dari API jika nanti tersedia." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 text-white"><KeyRound size={20} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Role Terdaftar</p><p className="text-2xl font-black">{privilegeRows.length}</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 text-white"><ShieldCheck size={20} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Panel Internal</p><p className="text-2xl font-black">2</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500 text-white"><ShieldQuestion size={20} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Portal Mitra</p><p className="text-2xl font-black">1</p></div>
          </div>
        </Card>
      </div>
      <DataTable
        title="Daftar Privilege"
        data={privilegeRows}
        searchPlaceholder="Cari privilege..."
        columns={[
          { key: "role", header: "Privilege", render: (row: any) => <span className="font-black text-slate-950">{row.role}</span> },
          { key: "description", header: "Keterangan" },
          { key: "users", header: "Role Sistem", render: (row: any) => <Badge value={row.users} /> },
          { key: "access", header: "Akses Modul", render: (row: any) => <div className="flex max-w-xl flex-wrap gap-2">{row.access.map((item: string) => <span key={item} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{item}</span>)}</div> },
        ]}
      />
    </div>
  );
}
