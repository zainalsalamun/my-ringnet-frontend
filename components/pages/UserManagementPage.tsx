"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import api from "@/lib/api";
import { Badge, Card, DataTable, PageHeader, SelectInput, StatSkeleton, TableSkeleton, TextInput } from "@/components/ui/AdminUI";
import { date } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldAlert, ShieldCheck, UserCog, Users } from "lucide-react";

const roleOptions = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Admin", value: "admin" },
  { label: "Pelanggan", value: "pelanggan" },
  { label: "Bisnis", value: "bisnis" },
  { label: "Mitra", value: "mitra" },
];

const statusOptions = [
  { label: "Aktif", value: "active" },
  { label: "Nonaktif", value: "nonactive" },
];

const managementRoleOptions = [
  { label: "Akun akses panel", value: "panel" },
  { label: "Semua role", value: "all" },
  { label: "Super Admin", value: "super_admin" },
  { label: "Admin", value: "admin" },
  { label: "Bisnis", value: "bisnis" },
  { label: "Mitra", value: "mitra" },
  { label: "Pelanggan", value: "pelanggan" },
];

const managementStatusOptions = [
  { label: "Semua status", value: "all" },
  ...statusOptions,
];

const roleLabel = (role?: string) => {
  const labels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    pelanggan: "Pelanggan",
    bisnis: "Bisnis",
    mitra: "Mitra",
  };
  return labels[String(role)] || role || "-";
};

export function UserManagementPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("panel");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    setToast("");
    const params = new URLSearchParams({ limit: "100" });
    if (roleFilter === "panel") params.set("excludeRole", "pelanggan");
    else if (roleFilter !== "all") params.set("role", roleFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);

    api.get("/users?" + params.toString())
      .then((res) => setRows(res.data.data))
      .catch(() => {
        setRows([]);
        setToast("Gagal memuat data user. Pastikan backend aktif dan sesi login valid.");
      })
      .finally(() => setLoading(false));
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const active = rows.filter((row) => (row.status || "active") === "active").length;
    const superAdmins = rows.filter((row) => row.role === "super_admin").length;
    return { active, superAdmins };
  }, [rows]);

  async function handleDelete(row: any) {
    if (row.role === "super_admin") {
      setToast("Super admin tidak bisa dihapus.");
      return;
    }

    try {
      await api.delete("/users/" + row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast("User berhasil dihapus.");
    } catch (error: any) {
      setToast(error.response?.data?.message || "Gagal menghapus user.");
    }
  }

  return (
    <div>
      <PageHeader title="User Management" subtitle="Kelola pendaftaran akun, role, status, dan akses panel admin." actionHref="/users/new" actionLabel="Tambah User" />

      {toast ? (
        <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
          {toast}
        </div>
      ) : null}

      <Card className="mb-6 p-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_260px_220px] xl:items-end">
          <div>
            <p className="text-sm font-bold text-slate-900">Filter akun</p>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Default halaman ini menampilkan akun yang relevan untuk akses panel. Data pelanggan massal tetap lebih rapi dikelola di menu Pelanggan.
            </p>
          </div>
          <SelectInput label="Role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} options={managementRoleOptions} />
          <SelectInput label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} options={managementStatusOptions} />
        </div>
      </Card>

      {loading ? <StatSkeleton count={3} /> : <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 text-white"><Users size={20} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Akun Ditampilkan</p><p className="text-2xl font-black">{rows.length}</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 text-white"><ShieldCheck size={20} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">User Aktif</p><p className="text-2xl font-black">{stats.active}</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-500 text-white"><ShieldAlert size={20} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Super Admin</p><p className="text-2xl font-black">{stats.superAdmins}</p></div>
          </div>
        </Card>
      </div>}

      {loading ? <TableSkeleton columns={7} /> :
      <DataTable
        data={rows}
        editBasePath="/users"
        onDelete={handleDelete}
        canDelete={(row: any) => row.role !== "super_admin"}
        searchPlaceholder="Cari nama, email, role..."
        columns={[
          { key: "name", header: "Nama", render: (row: any) => <span className="font-semibold text-slate-900">{row.name}</span> },
          { key: "email", header: "Email" },
          { key: "role", header: "Role", render: (row: any) => <Badge value={roleLabel(row.role)} /> },
          { key: "status", header: "Status", render: (row: any) => <Badge value={row.status || "active"} /> },
          { key: "createdAt", header: "Dibuat", render: (row: any) => date(row.createdAt) },
          { key: "guard", header: "Proteksi", render: (row: any) => row.role === "super_admin" ? <span className="text-xs font-bold text-rose-600">Tidak bisa dihapus</span> : <span className="text-xs text-slate-400">Standar</span> },
        ]}
      />
      }
    </div>
  );
}

export function UserFormPage({ edit = false, id, backHref = "/users", defaultRole = "admin" }: { edit?: boolean; id?: string; backHref?: string; defaultRole?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(edit);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: defaultRole,
    status: "active",
  });

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/users/" + id)
      .then((res) => {
        const user = res.data.data;
        setForm({
          name: user.name || "",
          email: user.email || "",
          password: "",
          role: user.role || "admin",
          status: user.status || "active",
        });
      })
      .catch(() => {
        setError("Gagal memuat data user dari database.");
      })
      .finally(() => setLoading(false));
  }, [edit, id]);

  async function submit() {
    setError("");
    if (!form.name || !form.email) {
      setError("Nama dan email wajib diisi.");
      return;
    }
    if (!edit && !form.password) {
      setError("Password wajib diisi untuk user baru.");
      return;
    }

    const payload = { ...form };
    if (edit && !payload.password) delete (payload as any).password;

    try {
      if (edit) await api.put("/users/" + id, payload);
      else await api.post("/users", payload);
      router.push(backHref);
    } catch (error: any) {
      setError(error.response?.data?.message || "Gagal menyimpan user.");
    }
  }

  if (loading) {
    return <Card className="p-8 text-sm text-slate-500">Memuat data user...</Card>;
  }

  const isProtectedSuperAdmin = edit && form.role === "super_admin";

  return (
    <div>
      <PageHeader title={edit ? "Edit User" : "Tambah User"} subtitle="Atur identitas akun, role, password, dan status akses." />
      <Card className="p-6">
        {error ? <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        {isProtectedSuperAdmin ? (
          <div className="mb-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 shrink-0" size={18} />
            <p><strong>Super admin dilindungi.</strong> Role tidak bisa diturunkan dan akun ini tidak bisa dihapus.</p>
          </div>
        ) : null}
        <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <TextInput label="Nama Lengkap" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Admin Operasional" />
            <TextInput label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="admin@ringnet.com" />
            <SelectInput label="Role" value={form.role} disabled={isProtectedSuperAdmin} onChange={(event) => setForm({ ...form, role: event.target.value })} options={roleOptions} />
            <SelectInput label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} options={statusOptions} />
            <TextInput label={edit ? "Password Baru (opsional)" : "Password"} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={edit ? "Kosongkan jika tidak diubah" : "Masukkan password"} />
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => router.push(backHref)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Batal</button>
            <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6366F1] px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-200"><UserCog size={16} /> Simpan User</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
