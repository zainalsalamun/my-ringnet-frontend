"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { Badge, Card, DataTable, PageHeader, SelectInput, StatSkeleton, TableSkeleton, TextArea, TextInput } from "@/components/ui/AdminUI";
import { date } from "@/lib/format";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, KeyRound, Mail, Phone, Power, Save, ShieldAlert, ShieldCheck, UserCog, UserPlus, Users } from "lucide-react";
import { usersApi } from "@/src/features/users/api";

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

    // Try DEKASIMAL API POST /admin/list first, fallback to GET /users
    usersApi.listAdmins({
      pageSize: 100,
      pageIndex: 0,
      sorting: [],
      columnFilters: [],
      globalFilter: "",
      columnVisibility: {
        select: true,
        admin_id: true,
        name: true,
        status: true,
        division: true,
        position: true,
        last_login: true,
      },
    })
      .then((res) => {
        const rawData = res.data?.data?.data || res.data?.data || res.data?.rows || res.data?.list || [];
        const normalized = rawData.map((item: any) => ({
          id: item.admin_id || item.id,
          adminId: item.admin_id || item.adminId,
          name: item.name || item.username,
          email: item.email || item.username,
          username: item.username,
          role: item.division || item.position || (item.super ? "super_admin" : "admin"),
          position: item.position || "-",
          division: item.division || "-",
          status: item.status === true || item.status === "active" ? "active" : "nonactive",
          createdAt: item.created_at || item.createdAt || new Date().toISOString(),
          lastLogin: item.last_login || "-",
        }));
        setRows(normalized);
      })
      .catch(() => {
        // Fallback to legacy GET /users
        const params = new URLSearchParams({ limit: "100" });
        if (!isAdmin) {
          if (roleFilter === "panel") params.set("excludeRole", "pelanggan");
          else if (roleFilter !== "all") params.set("role", roleFilter);
          if (statusFilter !== "all") params.set("status", statusFilter);
        }

        usersApi.list(params)
          .then((res) => {
            const data = Array.isArray(res.data.data) ? res.data.data : [];
            const visibleRows = isAdmin
              ? data.filter((row: any) => row.id === currentUser?.id || row.email === currentUser?.email)
              : data;
            setRows(visibleRows);
          })
          .catch(() => {
            setRows([]);
            setToast("Gagal memuat data administrator dari backend.");
          });
      })
      .finally(() => setLoading(false));
  }, [currentUser?.email, currentUser?.id, isAdmin, roleFilter, statusFilter]);

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
      try {
        await usersApi.rawDelete(row.id);
      } catch {
        await usersApi.remove(row.id);
      }
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast("Administrator berhasil dihapus.");
    } catch (error: any) {
      setToast(error.response?.data?.message || "Gagal menghapus administrator.");
    }
  }

  async function handleToggleStatus(row: any) {
    try {
      await usersApi.changeStatus(row.id);
      setRows((current) =>
        current.map((item) =>
          item.id === row.id
            ? { ...item, status: item.status === "active" ? "nonactive" : "active" }
            : item
        )
      );
      setToast("Status administrator berhasil diperbarui.");
    } catch {
      setToast("Gagal memperbarui status administrator.");
    }
  }


  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={isAdmin ? "Profil akun admin yang sedang login." : "Kelola pendaftaran akun, role, status, dan akses panel admin."}
        actionHref={isAdmin ? undefined : "/users/new"}
        actionLabel={isAdmin ? undefined : "Tambah User"}
      />

      {toast ? (
        <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
          {toast}
        </div>
      ) : null}

      {!isAdmin ? <Card className="mb-6 p-4">
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
      </Card> : null}

      {loading ? <StatSkeleton count={isAdmin ? 2 : 3} /> : <div className={"mb-6 grid gap-4 " + (isAdmin ? "md:grid-cols-2" : "md:grid-cols-3")}>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 text-white"><Users size={20} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{isAdmin ? "Profil Ditampilkan" : "Akun Ditampilkan"}</p><p className="text-2xl font-black">{rows.length}</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 text-white"><ShieldCheck size={20} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">User Aktif</p><p className="text-2xl font-black">{stats.active}</p></div>
          </div>
        </Card>
        {!isAdmin ? <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-500 text-white"><ShieldAlert size={20} /></div>
            <div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Super Admin</p><p className="text-2xl font-black">{stats.superAdmins}</p></div>
          </div>
        </Card> : null}
      </div>}

      {loading ? <TableSkeleton columns={7} /> :
      <DataTable
        data={rows}
        editBasePath="/users"
        onDelete={handleDelete}
        canDelete={(row: any) => !isAdmin && row.role !== "super_admin"}
        extraActions={(row: any) => !isAdmin && row.role !== "super_admin" ? (
          <button
            type="button"
            onClick={() => handleToggleStatus(row)}
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
            title={row.status === "active" ? "Nonaktifkan user" : "Aktifkan user"}
          >
            <Power size={15} />
          </button>
        ) : null}
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
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === "admin";
  const [loading, setLoading] = useState(edit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    division: defaultRole === "super_admin" ? "Management" : "Operational",
    position: "",
    password: "",
    passwordConfirmation: "",
    role: defaultRole,
    status: "active",
  });

  useEffect(() => {
    if (!edit || !id) return;
    
    // Try GET /admin/read/{id} first, fallback to /users/{id}
    usersApi.rawDetail(id)
      .then((res) => {
        const user = res.data.data;
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
      .catch(() => {
        usersApi.detail(id)
          .then((res) => {
            const user = res.data.data;
            setForm({
              name: user.name || "",
              username: user.username || user.email?.split("@")[0] || "",
              email: user.email || "",
              phone: user.phone || "",
              address: user.address || "",
              division: user.division || "Operational",
              position: user.position || user.role || "admin",
              password: "",
              passwordConfirmation: "",
              role: user.role || "admin",
              status: user.status || "active",
            });
          })
          .catch(() => {
            setError("Gagal memuat data administrator dari backend.");
          });
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
      if (edit) {
        if (!id) throw new Error("ID user tidak ditemukan.");
        try {
          await usersApi.rawUpdate({ selectedAdminId: id, ...payload });
        } catch {
          await usersApi.update(id, { ...form });
        }
      } else {
        try {
          await usersApi.rawCreate(payload);
        } catch {
          const legacyPayload = {
            name: form.name,
            username: form.username,
            email: form.email,
            phone: form.phone,
            address: form.address,
            division: form.division,
            position: form.position,
            password: form.password,
            role: form.role,
            status: form.status,
          };
          await usersApi.createAdmin(legacyPayload);
        }
      }
      router.push(backHref);
    } catch (error: any) {
      setError(error.response?.data?.message || "Gagal menyimpan data administrator.");
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
        subtitle={isAdminProfileForm ? "Admin hanya dapat memperbarui nama, email, dan password akun sendiri." : "Lengkapi identitas, akses login, divisi, dan status akun panel."}
        rightContent={(
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
        )}
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
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Status Form</p>
          <div className="mt-3 flex items-center gap-3">
            <Badge value={edit ? "Edit Data" : "User Baru"} />
            <Badge value={form.status === "active" ? "Aktif" : "Nonaktif"} />
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Password hanya dikirim saat diisi. Untuk edit user, kosongkan password jika tidak ingin mengganti.</p>
        </Card>
      </div>

      <div>
        {error ? <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        {isProtectedSuperAdmin ? (
          <div className="mb-5 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 shrink-0" size={18} />
            <p><strong>Super admin dilindungi.</strong> Role tidak bisa diturunkan dan akun ini tidak bisa dihapus.</p>
          </div>
        ) : null}

        <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="space-y-5">
          <UserFormSection
            icon={<UserCog size={20} />}
            title="Informasi Pengguna"
            description="Data utama yang tampil di tabel user management."
          >
            <TextInput label="Nama Lengkap" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Admin Operasional" />
            <TextInput label="Email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value, username: form.username || event.target.value.split("@")[0] })} placeholder="admin@ringnet.com" />
            <TextInput label="No. Telepon" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="08xxxxxxxxxx" />
            <TextInput label="Username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Contoh: admin.operasional" />
            <div className="lg:col-span-2">
              <TextArea label="Alamat" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="Alamat domisili atau kantor user" />
            </div>
          </UserFormSection>

          <UserFormSection
            icon={<BriefcaseBusiness size={20} />}
            title="Divisi & Hak Akses"
            description="Atur divisi kerja, jabatan, role akses, dan status akun."
          >
            <SelectInput label="Divisi" value={form.division} disabled={isAdminProfileForm} onChange={(event) => setForm({ ...form, division: event.target.value })} options={divisionOptions} />
            <TextInput label="Posisi / Jabatan" value={form.position} disabled={isAdminProfileForm} onChange={(event) => setForm({ ...form, position: event.target.value })} placeholder="Contoh: Staff NOC" />
            <SelectInput label="Role Akses Panel" value={form.role} disabled={isProtectedSuperAdmin || isAdminProfileForm} onChange={(event) => setForm({ ...form, role: event.target.value, division: event.target.value === "super_admin" ? "Management" : form.division })} options={panelRoleOptions} />
            <SelectInput label="Status Akun" value={form.status} disabled={isAdminProfileForm} onChange={(event) => setForm({ ...form, status: event.target.value })} options={statusOptions} />
          </UserFormSection>

          <UserFormSection
            icon={<KeyRound size={20} />}
            title="Keamanan Login"
            description="Gunakan password kuat untuk akun baru atau saat mengganti password."
          >
            <TextInput label={edit ? "Password Baru (opsional)" : "Password"} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder={edit ? "Kosongkan jika tidak diubah" : "Masukkan password"} />
            <TextInput label="Konfirmasi Password" type="password" value={form.passwordConfirmation} onChange={(event) => setForm({ ...form, passwordConfirmation: event.target.value })} placeholder={edit ? "Isi jika mengubah password" : "Ulangi password"} />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:col-span-2">
              <p className="font-bold text-slate-900">Ringkasan akun</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <span className="inline-flex items-center gap-2"><Mail size={16} className="text-slate-400" /> {form.email || "Email belum diisi"}</span>
                <span className="inline-flex items-center gap-2"><Phone size={16} className="text-slate-400" /> {form.phone || "Telepon belum diisi"}</span>
              </div>
            </div>
          </UserFormSection>

          <div className="sticky bottom-0 z-10 -mx-1 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-900/8 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Pastikan email dan username unik agar tidak ditolak oleh API saat disimpan.
              </p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => router.push(backHref)} className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">Batal</button>
                <button disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-6 text-sm font-bold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
                  <Save size={16} /> {saving ? "Menyimpan..." : isAdminProfileForm ? "Simpan Profil" : "Simpan User"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
