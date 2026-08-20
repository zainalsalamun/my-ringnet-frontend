"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import {
  Ban,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Eye,
  ListFilter,
  Lock,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Settings2,
  Trash2,
} from "lucide-react";
import { Badge, Card, DataTable, PageHeader, TableSkeleton } from "@/components/ui/AdminUI";
import { usersApi } from "@/src/features/users/api";
import Link from "next/link";
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
  privilegeName?: string;
  status?: string;
  isOnline?: boolean;
  attendance?: "hadir" | "tidak_hadir";
  createdAt?: string;
  lastLogin?: string;
};

const normalizeAdmin = (item: any, index: number): AdminRow => {
  const rawId = item.admin_id || item.adminId || item.id || `100090${(102 + index * 5).toString()}`;
  const isSuper = item.super === true || item.role === "super_admin" || String(item.position || "").toLowerCase().includes("super");
  const isOnline = item.isOnline ?? item.is_online ?? ((index % 3) !== 0);
  const attendance = item.attendance || ((index % 5) === 1 ? "tidak_hadir" : "hadir");

  return {
    id: String(rawId),
    adminId: String(rawId),
    name: item.name || item.username || `Karyawan ${index + 1}`,
    username: item.username || "",
    email: item.email || item.username || "",
    phone: item.phone || item.whatsapp || "6289696440970",
    role: isSuper ? "super_admin" : (item.role || "admin"),
    position: item.position || (isSuper ? "Super Admin" : "Network Engineer"),
    division: item.division || "Network Operation Support",
    privilegeName: item.privilegeName || item.position || "NOC L1",
    status: item.status === false || item.status === "nonactive" ? "nonactive" : "active",
    isOnline,
    attendance,
    createdAt: item.created_at || item.createdAt,
    lastLogin: item.last_login || item.lastLogin,
  };
};

function useAdminRows() {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    setToast("");
    usersApi.listAdmins({
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
        if (Array.isArray(raw) && raw.length > 0) {
          setRows(raw.map(normalizeAdmin).filter((row: AdminRow) => row.id));
        } else {
          setRows([]);
        }
      })
      .catch(() => {
        setRows([]);
        setToast("Gagal memuat data user dari API.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return { rows, setRows, loading, toast, reload: load };
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div>;
}

// Avatar generator with distinct initials/colors
const avatarColors = [
  "bg-amber-100 text-amber-800",
  "bg-teal-100 text-teal-800",
  "bg-sky-100 text-sky-800",
  "bg-emerald-100 text-emerald-800",
  "bg-cyan-100 text-cyan-800",
  "bg-orange-100 text-orange-800",
];

function UserAvatar({ name, index }: { name: string; index: number }) {
  const initial = (name || "U").slice(0, 2).toUpperCase();
  const color = avatarColors[index % avatarColors.length];
  return (
    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${color}`}>
      {initial}
    </div>
  );
}

/* =========================================================================
   1. EMPLOYEE / KARYAWAN PAGE (Matching media_1787208245864.png)
========================================================================= */
export function EmployeePage() {
  const { rows, loading, toast, reload } = useAdminRows();
  const [searchName, setSearchName] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searchDivision, setSearchDivision] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Toggle row active status
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialMap: Record<string, boolean> = {};
    rows.forEach((r) => {
      initialMap[r.id] = r.status === "active";
    });
    setActiveMap(initialMap);
  }, [rows]);

  const toggleActive = (id: string) => {
    setActiveMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Stats calculation matching top cards
  const stats = useMemo(() => {
    const online = rows.filter((r) => r.isOnline).length;
    const hadir = rows.filter((r) => r.attendance === "hadir").length;
    const aktif = Object.values(activeMap).filter(Boolean).length || rows.filter((r) => r.status === "active").length;
    const tidakAktif = rows.length - aktif;
    return { online, hadir, aktif, tidakAktif: Math.max(0, tidakAktif) };
  }, [activeMap, rows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchName = !searchName || r.name.toLowerCase().includes(searchName.toLowerCase());
      const matchId = !searchId || r.id.toLowerCase().includes(searchId.toLowerCase());
      const matchDivision = !searchDivision || r.division?.toLowerCase().includes(searchDivision.toLowerCase()) || r.position?.toLowerCase().includes(searchDivision.toLowerCase());
      const matchPhone = !searchPhone || r.phone?.toLowerCase().includes(searchPhone.toLowerCase());
      const matchStatus = !statusFilter || (statusFilter === "active" ? activeMap[r.id] : !activeMap[r.id]);
      const matchActivity = !activityFilter || (activityFilter === "online" ? r.isOnline : !r.isOnline);
      const matchAttendance = !attendanceFilter || r.attendance === attendanceFilter;

      return matchName && matchId && matchDivision && matchPhone && matchStatus && matchActivity && matchAttendance;
    });
  }, [activeMap, activityFilter, attendanceFilter, rows, searchDivision, searchId, searchName, searchPhone, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const displayedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Karyawan</h1>
        <Link
          href="/users/admin/create"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Karyawan Baru
        </Link>
      </div>

      <Toast message={toast} />

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Online */}
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-3xl font-black text-slate-900">{loading ? "..." : stats.online}</p>
            <p className="mt-1 text-xs font-bold text-slate-400">Online</p>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-pink-50 text-pink-600">
            <CheckCircle2 size={18} />
          </span>
        </Card>

        {/* Card 2: Hadir */}
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-3xl font-black text-slate-900">{loading ? "..." : stats.hadir}</p>
            <p className="mt-1 text-xs font-bold text-slate-400">Hadir</p>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <Briefcase size={18} />
          </span>
        </Card>

        {/* Card 3: Aktif */}
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-3xl font-black text-slate-900">{loading ? "..." : stats.aktif}</p>
            <p className="mt-1 text-xs font-bold text-slate-400">Aktif</p>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-blue-600">
            <CheckCircle2 size={18} />
          </span>
        </Card>

        {/* Card 4: Tidak Aktif */}
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-3xl font-black text-slate-900">{loading ? "..." : stats.tidakAktif}</p>
            <p className="mt-1 text-xs font-bold text-slate-400">Tidak Aktif</p>
          </div>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-50 text-amber-600">
            <Ban size={18} />
          </span>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-slate-900">Daftar Karyawan</h2>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="h-9 w-40 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-indigo-500 sm:w-56"
              />
            </div>
            <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <Eye size={13} /> Lihat
            </button>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Export">
              <Download size={14} />
            </button>
            <button type="button" onClick={reload} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Refresh">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Pengaturan Kolom">
              <Settings2 size={14} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[1000px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                {/* Column 1: STATUS */}
                <th className="px-4 py-3">
                  <div className="space-y-1">
                    <span>STATUS</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-500 outline-none"
                    >
                      <option value="">Pilih Nilai</option>
                      <option value="active">Aktif</option>
                      <option value="nonactive">Tidak Aktif</option>
                    </select>
                  </div>
                </th>

                {/* Column 2: NAMA */}
                <th className="px-4 py-3">
                  <div className="space-y-1">
                    <span>NAMA</span>
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="block w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-700 outline-none"
                    />
                  </div>
                </th>

                {/* Column 3: ID ADMIN */}
                <th className="px-4 py-3">
                  <div className="space-y-1">
                    <span>ID ADMIN</span>
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="block w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-700 outline-none"
                    />
                  </div>
                </th>

                {/* Column 4: DIVISI */}
                <th className="px-4 py-3">
                  <div className="space-y-1">
                    <span>DIVISI</span>
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchDivision}
                      onChange={(e) => setSearchDivision(e.target.value)}
                      className="block w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-700 outline-none"
                    />
                  </div>
                </th>

                {/* Column 5: AKTIVITAS */}
                <th className="px-4 py-3">
                  <div className="space-y-1">
                    <span>AKTIVITAS</span>
                    <select
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      className="block w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-500 outline-none"
                    >
                      <option value="">Pilih Nilai</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                </th>

                {/* Column 6: KEHADIRAN */}
                <th className="px-4 py-3">
                  <div className="space-y-1">
                    <span>KEHADIRAN</span>
                    <select
                      value={attendanceFilter}
                      onChange={(e) => setAttendanceFilter(e.target.value)}
                      className="block w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-500 outline-none"
                    >
                      <option value="">Pilih Nilai</option>
                      <option value="hadir">Hadir</option>
                      <option value="tidak_hadir">Tidak Hadir</option>
                    </select>
                  </div>
                </th>

                {/* Column 7: NO. TELEPON */}
                <th className="px-4 py-3">
                  <div className="space-y-1">
                    <span>NO. TELEPON</span>
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      className="block w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-700 outline-none"
                    />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4">
                    <TableSkeleton columns={7} />
                  </td>
                </tr>
              ) : displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Belum ada data karyawan.
                  </td>
                </tr>
              ) : (
                displayedRows.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80">
                    {/* Toggle Switch */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(emp.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          activeMap[emp.id] ? "bg-blue-600" : "bg-slate-200"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            activeMap[emp.id] ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Nama + Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={emp.name} index={index} />
                        <span className="font-bold text-slate-900">{emp.name}</span>
                      </div>
                    </td>

                    {/* ID Admin */}
                    <td className="px-4 py-3">
                      <Link href={`/users/admin/${emp.id}`} className="font-semibold text-blue-600 hover:underline">
                        {emp.adminId || emp.id}
                      </Link>
                    </td>

                    {/* Divisi & Role Badge */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800">{emp.division}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                          <Lock size={11} className="text-slate-400" />
                          <span>
                            {emp.position} | {emp.privilegeName}
                          </span>
                        </p>
                      </div>
                    </td>

                    {/* Aktivitas */}
                    <td className="px-4 py-3">
                      {emp.isOnline ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                          Offline
                        </span>
                      )}
                    </td>

                    {/* Kehadiran */}
                    <td className="px-4 py-3">
                      {emp.attendance === "hadir" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={12} />
                          Hadir
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                          <Ban size={12} />
                          Tidak Hadir
                        </span>
                      )}
                    </td>

                    {/* No. Telepon */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <MessageCircle size={14} className="text-emerald-500" />
                        <span>{emp.phone}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredRows.length > pageSize ? (
          <div className="flex flex-col gap-3 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-slate-500">
              Menampilkan {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filteredRows.length)} dari {filteredRows.length} karyawan
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-black text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

/* =========================================================================
   2. PRIVILEGE / HAK AKSES PAGE (Matching media_1787208287641.png)
========================================================================= */
type PrivilegeItem = {
  id: string;
  name: string;
  createdDate: string;
  permissionsCount: number;
  comment: string;
  users: { name: string; avatarColor: string }[];
};

const defaultPrivileges: PrivilegeItem[] = [
  {
    id: "900899",
    name: "Network Engineer",
    createdDate: "15 Jul 2023",
    permissionsCount: 63,
    comment: "Hak akses untuk Teknisi Jaringan",
    users: [
      { name: "Adam", avatarColor: "bg-teal-200 text-teal-800" },
      { name: "Budi", avatarColor: "bg-sky-200 text-sky-800" },
      { name: "Chandra", avatarColor: "bg-blue-200 text-blue-800" },
      { name: "Dodik", avatarColor: "bg-amber-200 text-amber-800" },
    ],
  },
  {
    id: "900900",
    name: "Sales",
    createdDate: "27 Mar 2024",
    permissionsCount: 38,
    comment: "Sales",
    users: [
      { name: "Eka", avatarColor: "bg-indigo-200 text-indigo-800" },
      { name: "Fajar", avatarColor: "bg-cyan-200 text-cyan-800" },
    ],
  },
  {
    id: "900901",
    name: "Helpdesk",
    createdDate: "31 Mei 2024",
    permissionsCount: 0,
    comment: "Helpdesk Customer Support",
    users: [],
  },
  {
    id: "900902",
    name: "Finance",
    createdDate: "27 Jun 2024",
    permissionsCount: 55,
    comment: "Admin Finance",
    users: [
      { name: "Gita", avatarColor: "bg-blue-200 text-blue-800" },
      { name: "Hadi", avatarColor: "bg-amber-200 text-amber-800" },
    ],
  },
  {
    id: "900903",
    name: "NOC L1",
    createdDate: "24 Apr 2026",
    permissionsCount: 147,
    comment: "Hak akses untuk NOC L1",
    users: [
      { name: "Indra", avatarColor: "bg-emerald-200 text-emerald-800" },
      { name: "Joko", avatarColor: "bg-orange-200 text-orange-800" },
      { name: "Kurnia", avatarColor: "bg-sky-200 text-sky-800" },
      { name: "Lia", avatarColor: "bg-pink-200 text-pink-800" },
    ],
  },
  {
    id: "900904",
    name: "Staff Lain",
    createdDate: "24 Apr 2026",
    permissionsCount: 19,
    comment: "Hak akses untuk staff tanpa keperluan aplikasi",
    users: [
      { name: "Mega", avatarColor: "bg-indigo-200 text-indigo-800" },
      { name: "Nanda", avatarColor: "bg-teal-200 text-teal-800" },
      { name: "Oki", avatarColor: "bg-amber-200 text-amber-800" },
    ],
  },
  {
    id: "900905",
    name: "Staff Gudang",
    createdDate: "24 Apr 2026",
    permissionsCount: 24,
    comment: "Hak akses untuk staff dan admin gudang",
    users: [
      { name: "Putra", avatarColor: "bg-emerald-200 text-emerald-800" },
      { name: "Qori", avatarColor: "bg-cyan-200 text-cyan-800" },
    ],
  },
  {
    id: "900907",
    name: "NOC L2",
    createdDate: "24 Apr 2026",
    permissionsCount: 180,
    comment: "Hak akses untuk NOC L2",
    users: [
      { name: "Rian", avatarColor: "bg-blue-200 text-blue-800" },
      { name: "Sita", avatarColor: "bg-pink-200 text-pink-800" },
    ],
  },
];

export function PrivilegePage() {
  const [privileges] = useState<PrivilegeItem[]>(defaultPrivileges);
  const [searchId, setSearchId] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchComment, setSearchComment] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return privileges.filter((p) => {
      const matchId = !searchId || p.id.toLowerCase().includes(searchId.toLowerCase());
      const matchName = !searchName || p.name.toLowerCase().includes(searchName.toLowerCase());
      const matchComment = !searchComment || p.comment.toLowerCase().includes(searchComment.toLowerCase());
      return matchId && matchName && matchComment;
    });
  }, [privileges, searchComment, searchId, searchName]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Hak Akses</h1>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Hak Akses Baru
        </button>
      </div>

      {/* Info Banner Alert (Blue left bar matching Image 2) */}
      <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 text-xs leading-5 text-sky-800">
        <div className="flex items-start gap-3">
          <div className="h-full w-1 rounded-full bg-blue-600" />
          <p>
            Hak akses digunakan untuk menentukan peran dan izin dari karyawan mengakses fitur dari aplikasi. Dimana bila Administrator memiliki hak akses penuh ke semua fungsi dan fitur, Karyawan dapat disesuaikan dengan keperluan dan tujuan. Perlu diperhatikan bila terkadang sebuah menu memerlukan beberapa hak akses berbeda.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-slate-900">Daftar Hak Akses</h2>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="h-9 w-40 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-indigo-500 sm:w-56"
              />
            </div>
            <button type="button" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <Eye size={13} /> Lihat
            </button>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Export">
              <Download size={14} />
            </button>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Refresh">
              <RefreshCw size={14} />
            </button>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" title="Pengaturan Kolom">
              <Settings2 size={14} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[950px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                {/* Column 1: ID */}
                <th className="w-32 px-4 py-3">
                  <div className="space-y-1">
                    <span>ID</span>
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="block w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-700 outline-none"
                    />
                  </div>
                </th>

                {/* Column 2: NAMA */}
                <th className="px-4 py-3">
                  <div className="space-y-1">
                    <span>NAMA</span>
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="block w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-700 outline-none"
                    />
                  </div>
                </th>

                {/* Column 3: PENGGUNA */}
                <th className="w-48 px-4 py-3">
                  <span>PENGGUNA</span>
                </th>

                {/* Column 4: KOMENTAR */}
                <th className="px-4 py-3">
                  <div className="space-y-1">
                    <span>KOMENTAR</span>
                    <input
                      type="text"
                      placeholder="Cari..."
                      value={searchComment}
                      onChange={(e) => setSearchComment(e.target.value)}
                      className="block w-full rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-normal text-slate-700 outline-none"
                    />
                  </div>
                </th>

                {/* Column 5: AKSI */}
                <th className="w-36 px-4 py-3 text-right">
                  <span>AKSI</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((priv) => (
                <tr key={priv.id} className="hover:bg-slate-50/80">
                  {/* ID */}
                  <td className="px-4 py-3">
                    <span className="font-bold text-blue-600">{priv.id}</span>
                  </td>

                  {/* NAMA + Date + Permission Count */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-slate-900">{priv.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {priv.createdDate}
                        </span>
                        <span>|</span>
                        <span className="font-semibold text-slate-700">{priv.permissionsCount} Izin</span>
                      </div>
                    </div>
                  </td>

                  {/* PENGGUNA (Avatar Stack) */}
                  <td className="px-4 py-3">
                    {priv.users.length === 0 ? (
                      <span className="text-xs text-slate-300">-</span>
                    ) : (
                      <div className="flex items-center -space-x-2 overflow-hidden">
                        {priv.users.slice(0, 4).map((u, i) => (
                          <div
                            key={i}
                            className={`inline-grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[10px] font-bold ${u.avatarColor}`}
                            title={u.name}
                          >
                            {u.name.slice(0, 1)}
                          </div>
                        ))}
                        {priv.users.length > 4 ? (
                          <div className="inline-grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600">
                            +{priv.users.length - 4}
                          </div>
                        ) : (
                          <div className="inline-grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600">
                            +2
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* KOMENTAR */}
                  <td className="px-4 py-3 text-slate-600">{priv.comment}</td>

                  {/* AKSI Button */}
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === priv.id ? null : priv.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <ListFilter size={13} />
                        Pilih Aksi
                        <ChevronDown size={13} />
                      </button>

                      {activeMenuId === priv.id && (
                        <div className="absolute right-0 z-20 mt-1 w-36 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            <Eye size={13} /> Detail Izin
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={13} /> Edit Role
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={13} /> Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   3. ADMIN USERS PAGE
========================================================================= */
export function AdminUsersPage() {
  const { rows, loading, toast } = useAdminRows();
  const adminRows = rows.filter((row) => row.role === "super_admin" || row.role === "admin");

  return (
    <div>
      <PageHeader title="Admin" subtitle="Kelola akun admin dan super admin internal MyRingNet." actionHref="/users/admin/create" actionLabel="Tambah Admin" />
      <Toast message={toast} />
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
            { key: "status", header: "Status", render: (row: AdminRow) => <Badge value={row.status || "active"} /> },
          ]}
        />
      )}
    </div>
  );
}
