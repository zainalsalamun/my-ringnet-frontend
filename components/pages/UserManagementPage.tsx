"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { Badge, Card, DataTable, PageHeader, SelectInput, TableSkeleton, TextArea, TextInput } from "@/components/ui/AdminUI";
import { date } from "@/lib/format";
import { formatErrorMessage } from "@/lib/error";
import { adminService } from "@/services";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, KeyRound, Power, Save, ShieldAlert, ShieldCheck, UserCog, UserPlus, Users } from "lucide-react";

const panelRoleOptions = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Admin", value: "admin" },
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

const divisionOptions = [
  { label: "Management", value: "Management" },
  { label: "Operational", value: "Operational" },
  { label: "NOC / Teknis", value: "NOC / Teknis" },
  { label: "Billing / Keuangan", value: "Billing / Keuangan" },
  { label: "Customer Service", value: "Customer Service" },
  { label: "Legal", value: "Legal" },
  { label: "Sales / Marketing", value: "Sales / Marketing" },
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

function UserFormSection({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <section className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 rounded-t-2xl border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-black text-slate-950">{title}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

export function UserManagementPage() {
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === "admin";
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("panel");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    setToast("");

    adminService
      .getList()
      .then((data) => {
        const visibleRows = isAdmin
          ? data.filter((row: any) => row.id === currentUser?.id || row.email === currentUser?.email)
          : data;
        setRows(visibleRows);
      })
      .catch((err) => {
        setRows([]);
        setToast(formatErrorMessage(err, "Gagal memuat data administrator dari backend."));
      })
      .finally(() => setLoading(false));
  }, [currentUser?.email, currentUser?.id, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const active = rows.filter((row) => (row.status || "active") === "active").length;
    const superAdmins = rows.filter((row) => row.role === "super_admin" || String(row.role).toLowerCase().includes("super")).length;
    return { active, superAdmins };
  }, [rows]);

  async function handleDelete(row: any) {
    if (isAdmin) {
      setToast("Admin hanya dapat melihat dan mengubah profil sendiri.");
      return;
    }
    if (row.role === "super_admin") {
      setToast("Super admin tidak bisa dihapus.");
      return;
    }

    try {
      await adminService.deleteUser(row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast("Administrator berhasil dihapus.");
    } catch (error: any) {
      setToast(formatErrorMessage(error, "Gagal menghapus administrator."));
    }
  }

  async function handleToggleStatus(row: any) {
    try {
      await adminService.toggleStatus(row.id);
      setRows((current) =>
        current.map((item) =>
          item.id === row.id
            ? { ...item, status: item.status === "active" ? "nonactive" : "active" }
            : item
        )
      );
      setToast("Status administrator berhasil diperbarui.");
    } catch (err: any) {
      setToast(formatErrorMessage(err, "Gagal memperbarui status administrator."));
    }
  }

  return (
    <div>
      <PageHeader
        title="Pengguna Panel"
        subtitle={isAdmin ? "Kelola dan tinjau akun administrator Anda." : "Kelola akun pengguna internal, role super admin, admin operasional, dan status akses panel."}
        actionHref={isAdmin ? undefined : "/users/admin/create"}
        actionLabel={isAdmin ? undefined : "Tambah User"}
      />

      {toast ? (
        <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
          {toast}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Total Akun</p>
              <p className="text-2xl font-black text-slate-950">{rows.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Akun Aktif</p>
              <p className="text-2xl font-black text-slate-950">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <ShieldAlert size={22} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Super Admin</p>
              <p className="text-2xl font-black text-slate-950">{stats.superAdmins}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-48">
              <SelectInput
                label="Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={managementRoleOptions}
              />
            </div>
            <div className="w-40">
              <SelectInput
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={managementStatusOptions}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <TableSkeleton columns={7} />
        ) : (
          <DataTable
            data={rows}
            editBasePath="/users"
            onDelete={isAdmin ? undefined : handleDelete}
            columns={[
              {
                key: "name",
                header: "Nama Pengguna",
                render: (row) => (
                  <div>
                    <span className="font-bold text-slate-900">{row.name}</span>
                    <p className="text-xs text-slate-400">{row.email || row.username || "-"}</p>
                  </div>
                ),
              },
              { key: "username", header: "Username", render: (row) => row.username || "-" },
              {
                key: "role",
                header: "Role / Divisi",
                render: (row) => (
                  <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                    {roleLabel(row.role || row.position)}
                  </span>
                ),
              },
              { key: "division", header: "Divisi", render: (row) => row.division || "-" },
              { key: "lastLogin", header: "Terakhir Login", render: (row) => (row.lastLogin ? date(row.lastLogin) : "-") },
              { key: "status", header: "Status", render: (row) => <Badge value={row.status || "active"} /> },
            ]}
            extraActions={
              isAdmin
                ? undefined
                : (row) => (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(row)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      title="Ubah status akun"
                    >
                      <Power size={14} />
                    </button>
                  )
            }
          />
        )}
      </Card>
    </div>
  );
}

export function UserFormPage({
  edit = false,
  id,
  backHref: customBackHref,
  defaultRole,
}: {
  edit?: boolean;
  id?: string;
  backHref?: string;
  defaultRole?: string;
}) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === "admin";
  const backHref = customBackHref || (isAdmin ? "/users" : "/users/admin");

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(edit && id));
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    division: defaultRole === "super_admin" ? "Management" : "Operational",
    position: defaultRole || "admin",
    password: "",
    passwordConfirmation: "",
    role: defaultRole || "admin",
    status: "active",
  });

  useEffect(() => {
    if (!edit || !id) return;

    adminService
      .getDetail(id)
      .then((raw) => {
        if (!raw) return;
        const user = raw.data || raw;
        setForm({
          name: user.name || user.username || "",
          username: user.username || "",
          email: user.email || user.username || "",
          phone: user.phone || "",
          address: user.address || "",
          division: user.division || (user.super ? "Management" : "Operational"),
          position: user.position || (user.super ? "super_admin" : "admin"),
          password: "",
          passwordConfirmation: "",
          role: user.division || user.position || (user.super ? "super_admin" : "admin"),
          status: user.status === true || user.status === "active" ? "active" : "nonactive",
        });
      })
      .catch((err) => {
        setError(formatErrorMessage(err, "Gagal memuat data administrator dari backend."));
      })
      .finally(() => setLoading(false));
  }, [edit, id]);

  async function submit() {
    setError("");
    if (saving) return;
    if (!form.name || !form.username || !form.email) {
      setError("Nama, username, dan email wajib diisi.");
      return;
    }
    if (!edit && !form.password) {
      setError("Password wajib diisi untuk user baru.");
      return;
    }
    if (form.password && form.password !== form.passwordConfirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    const payload: any = {
      name: form.name,
      username: form.username,
      email: form.email,
      phone: form.phone || "-",
      address: form.address || "-",
      position: form.position || (form.role === "super_admin" ? "Super Admin" : "Administrator"),
      division: form.division || (form.role === "super_admin" ? "Management" : "Operational"),
      role: form.role,
      super: form.role === "super_admin",
      status: form.status === "active",
    };
    if (form.password) {
      payload.password = form.password;
    }

    try {
      setSaving(true);
      if (edit && id) {
        await adminService.update(id, payload);
      } else {
        await adminService.create(payload);
      }
      router.push(backHref);
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal menyimpan data administrator."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Card className="p-8 text-sm text-slate-500">Memuat data user...</Card>;
  }

  const isProtectedSuperAdmin = edit && form.role === "super_admin";
  const isAdminProfileForm = isAdmin && edit;

  return (
    <div>
      <PageHeader
        title={edit ? "Edit User" : "Tambah User"}
        subtitle={
          isAdminProfileForm
            ? "Admin hanya dapat memperbarui nama, email, dan password akun sendiri."
            : "Lengkapi identitas, akses login, divisi, dan status akun panel."
        }
        rightContent={
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              {edit ? <UserCog size={22} /> : <UserPlus size={22} />}
            </div>
            <div>
              <p className="text-lg font-black text-slate-950">{edit ? "Perbarui akun pengguna" : "Buat akun pengguna panel"}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Form ini dipakai untuk akun administrator internal. Data pelanggan, pelanggan bisnis, reseller/mitra, dan POP tetap dibuat melalui menu masing-masing.
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Hak Akses Role</p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {form.role === "super_admin" ? "Super Admin (Akses Penuh)" : "Admin Operasional"}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {form.role === "super_admin"
              ? "Dapat mengelola user panel, dokumen legalitas super, dan seluruh konfigurasi sistem."
              : "Dapat mengelola data operasional harian, pelanggan, faktur, dan tiket support."}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        {error ? (
          <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-6"
        >
          <UserFormSection icon={<UserCog size={20} />} title="Identitas Administrator" description="Nama lengkap dan kontak penanggung jawab akun.">
            <TextInput label="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama admin" required />
            <TextInput label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" required disabled={Boolean(isAdminProfileForm)} />
            <TextInput label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@domain.com" required />
            <TextInput label="Nomor Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
            <div className="lg:col-span-2">
              <TextArea label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap (opsional)" />
            </div>
          </UserFormSection>

          <UserFormSection icon={<KeyRound size={20} />} title="Kredensial Login" description={edit ? "Kosongkan jika tidak ingin mengubah kata sandi." : "Password awal untuk login ke panel."}>
            <TextInput label={edit ? "Password Baru (Opsional)" : "Password"} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required={!edit} />
            <TextInput label="Konfirmasi Password" type="password" value={form.passwordConfirmation} onChange={(e) => setForm({ ...form, passwordConfirmation: e.target.value })} placeholder="••••••••" required={Boolean(form.password)} />
          </UserFormSection>

          {!isAdminProfileForm ? (
            <UserFormSection icon={<BriefcaseBusiness size={20} />} title="Hak Akses & Penugasan" description="Tentukan role, divisi kerja, dan status aktif akun panel.">
              <SelectInput label="Role Akses" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={panelRoleOptions} disabled={isProtectedSuperAdmin} />
              <SelectInput label="Divisi" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} options={divisionOptions} />
              <SelectInput label="Status Akun" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={statusOptions} disabled={isProtectedSuperAdmin} />
            </UserFormSection>
          ) : null}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save size={16} /> {saving ? "Menyimpan..." : "Simpan Pengguna"}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default UserManagementPage;
