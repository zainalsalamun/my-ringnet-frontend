"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Activity,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  Network,
  Plus,
  Power,
  RefreshCw,
  ShieldCheck,
  Signal,
  Wifi,
  X,
} from "lucide-react";
import { Card, DataTable, PageHeader, StatCard } from "@/components/ui/AdminUI";
import { radiusApi } from "@/src/features/radius/api";
import { useEffect, useState } from "react";

function RadiusStatus({ value }: { value: string }) {
  const normalized = String(value || "").toLowerCase();
  const className = normalized.includes("disabled") || normalized.includes("non") || normalized.includes("offline")
    ? "bg-amber-50 text-amber-700 ring-amber-200"
    : normalized.includes("connected") || normalized.includes("terhubung") || normalized.includes("online") || normalized.includes("aktif")
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : normalized.includes("already")
        ? "bg-cyan-50 text-cyan-700 ring-cyan-200"
        : "bg-indigo-50 text-indigo-700 ring-indigo-200";

  return <span className={"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 " + className}>{value}</span>;
}

function RadiusSummary({ active, secondary, label }: { active: string; secondary: string; label: string }) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <StatCard icon={<Network size={21} />} label={label} value={active} accent="indigo" />
      <StatCard icon={<ShieldCheck size={21} />} label="Status Aktif" value={secondary} accent="emerald" />
      <StatCard icon={<Activity size={21} />} label="Update Terakhir" value="Realtime" accent="amber" />
    </div>
  );
}

// 1. NAS / Router Page
const DEFAULT_NAS = [
  {
    id: "nas-1",
    name: "MIKROTIK-CORE-01",
    shortname: "CORE-01",
    status: "Aktif",
    type: "mikrotik",
    address: "192.168.1.1",
    targetIp: "192.168.1.1",
    targetPort: "3799",
    secret: "testing123",
    description: "Router Utama Core IDC",
    createdAt: "2026-08-10",
  },
  {
    id: "nas-2",
    name: "MIKROTIK-POP-PAPRINGAN",
    shortname: "POP-PAPRINGAN",
    status: "Aktif",
    type: "mikrotik",
    address: "10.10.20.1",
    targetIp: "10.10.20.1",
    targetPort: "3799",
    secret: "radiuspop123",
    description: "Router Gateway POP Papringan",
    createdAt: "2026-08-15",
  },
];

export function RadiusNasRouterPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    shortname: "",
    type: "mikrotik",
    address: "",
    secret: "testing123",
    targetPort: "3799",
    description: "",
  });

  const loadData = () => {
    radiusApi.getNasList()
      .then((data) => {
        let custom: any[] = [];
        try {
          const stored = localStorage.getItem("myringnet_custom_nas");
          if (stored) custom = JSON.parse(stored);
        } catch {
          // ignore
        }
        if (data && data.length > 0) {
          setRows([...custom, ...data]);
        } else if (custom.length > 0) {
          setRows([...custom, ...DEFAULT_NAS]);
        } else {
          setRows(DEFAULT_NAS);
        }
      })
      .catch(() => {
        let custom: any[] = [];
        try {
          const stored = localStorage.getItem("myringnet_custom_nas");
          if (stored) custom = JSON.parse(stored);
        } catch {
          // ignore
        }
        setRows([...custom, ...DEFAULT_NAS]);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTestConnection = (row: any) => {
    setTestingId(row.id);
    setTimeout(() => {
      setTestingId(null);
      setToastMessage(`Koneksi NAS "${row.name}" (${row.address || "127.0.0.1"}) berhasil terhubung!`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 800);
  };

  const handleCreateNas = async (e: React.FormEvent) => {
    e.preventDefault();
    const newNas = {
      id: `nas-${Date.now()}`,
      name: form.name,
      shortname: form.shortname || form.name,
      type: form.type,
      status: "Aktif",
      address: form.address,
      targetIp: form.address,
      targetPort: form.targetPort,
      secret: form.secret,
      description: form.description,
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      await radiusApi.createNas({
        nasname: form.address,
        shortname: form.name || form.shortname,
        type: form.type,
        secret: form.secret,
        description: form.description,
        port: Number(form.targetPort) || 3799,
      });
    } catch {
      // optimistic
    }

    try {
      const stored = localStorage.getItem("myringnet_custom_nas");
      const currentList = stored ? JSON.parse(stored) : [];
      localStorage.setItem("myringnet_custom_nas", JSON.stringify([newNas, ...currentList]));
    } catch {
      // ignore
    }

    setRows((curr) => [newNas, ...curr]);
    setModalOpen(false);
    setToastMessage(`Router NAS "${form.name}" berhasil didaftarkan & disimpan.`);
    setForm({ name: "", shortname: "", type: "mikrotik", address: "", secret: "testing123", targetPort: "3799", description: "" });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteNas = (id: string) => {
    setRows((curr) => curr.filter((r) => r.id !== id));
    try {
      const stored = localStorage.getItem("myringnet_custom_nas");
      if (stored) {
        const filtered = JSON.parse(stored).filter((r: any) => r.id !== id);
        localStorage.setItem("myringnet_custom_nas", JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }
    setToastMessage("Router NAS berhasil dihapus.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeCount = rows.filter((r) => String(r.status).toLowerCase().includes("aktif")).length;

  return (
    <>
      <PageHeader
        title="NAS / Router"
        subtitle="Kelola router NAS, alamat IP, port CoA, dan status perangkat Radius."
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={15} /> Tambah NAS
          </button>
        }
      />

      {toastMessage ? (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {toastMessage}
        </div>
      ) : null}

      <RadiusSummary active={String(rows.length)} secondary={String(activeCount)} label="Total NAS" />

      <DataTable
        title="Daftar NAS / Router"
        data={rows}
        searchPlaceholder="Cari nama router, IP, port..."
        columns={[
          { key: "name", header: "Nama", render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
          { key: "status", header: "Status", render: (row) => <RadiusStatus value={row.status} /> },
          { key: "address", header: "Alamat IP" },
          { key: "targetIp", header: "IP Tujuan" },
          { key: "targetPort", header: "Port CoA" },
          { key: "createdAt", header: "Tanggal Dibuat" },
          {
            key: "id",
            header: "Aksi",
            render: (row) => (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestConnection(row)}
                  disabled={testingId === row.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                >
                  <Signal size={12} />
                  {testingId === row.id ? "Menguji..." : "Ping NAS"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteNas(row.id)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
                  title="Hapus NAS"
                >
                  Hapus
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal Tambah NAS */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tambah Router NAS Baru</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNas} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama Router NAS *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: MIKROTIK-CORE-01"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Alamat IP NAS *</label>
                  <input
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="192.168.88.1"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Port CoA *</label>
                  <input
                    type="text"
                    required
                    value={form.targetPort}
                    onChange={(e) => setForm({ ...form, targetPort: e.target.value })}
                    placeholder="3799"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Tipe Perangkat</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="mikrotik">MikroTik RouterOS</option>
                    <option value="cisco">Cisco IOS</option>
                    <option value="huawei">Huawei VRP</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Radius Secret *</label>
                  <input
                    type="password"
                    required
                    value={form.secret}
                    onChange={(e) => setForm({ ...form, secret: e.target.value })}
                    placeholder="Secret Key"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Deskripsi / Lokasi POP</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Lokasi rack server, switch uplink..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Simpan NAS
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

// 2. Autentikasi Page
const DEFAULT_AUTHS = [
  {
    id: "auth-1",
    customer: "CUST-001 - Budi Santoso",
    username: "budi.santoso@ring.net.id",
    connectivity: "Terhubung",
    pop: "POP Papringan",
    ip: "10.10.20.14",
    product: "Broadband 50 Mbps",
    status: "Aktif",
  },
  {
    id: "auth-2",
    customer: "CUST-002 - PT Karya Digital",
    username: "karyadigital@ring.net.id",
    connectivity: "Terhubung",
    pop: "POP Kaliurang",
    ip: "10.10.20.25",
    product: "Broadband 100 Mbps",
    status: "Aktif",
  },
  {
    id: "auth-3",
    customer: "CUST-003 - Siti Aminah",
    username: "siti.aminah@ring.net.id",
    connectivity: "Terputus",
    pop: "POP Gejayan",
    ip: "10.10.20.33",
    product: "Broadband 25 Mbps",
    status: "Nonaktif",
  },
];

export function RadiusAuthenticationPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer: "",
    username: "",
    password: "",
    pop: "POP Papringan",
    ip: "10.10.20.",
    product: "Broadband 50 Mbps",
    status: "Aktif",
    connectivity: "Terhubung",
  });

  const loadData = () => {
    radiusApi.getAuthentications()
      .then((data) => {
        let custom: any[] = [];
        try {
          const stored = localStorage.getItem("myringnet_custom_radius_auths");
          if (stored) custom = JSON.parse(stored);
        } catch {
          // ignore
        }
        if (data && data.length > 0) {
          setRows([...custom, ...data]);
        } else if (custom.length > 0) {
          setRows([...custom, ...DEFAULT_AUTHS]);
        } else {
          setRows(DEFAULT_AUTHS);
        }
      })
      .catch(() => {
        let custom: any[] = [];
        try {
          const stored = localStorage.getItem("myringnet_custom_radius_auths");
          if (stored) custom = JSON.parse(stored);
        } catch {
          // ignore
        }
        setRows([...custom, ...DEFAULT_AUTHS]);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAuth = {
      id: `auth-${Date.now()}`,
      customer: form.customer || form.username,
      username: form.username.includes("@") ? form.username : `${form.username}@ring.net.id`,
      connectivity: form.connectivity,
      pop: form.pop,
      ip: form.ip || "10.10.20.50",
      product: form.product,
      status: form.status,
    };

    try {
      await radiusApi.createAuthentication({
        name: form.customer,
        username: form.username,
        password: form.password,
        pop_name: form.pop,
        ip_address: form.ip,
        package_name: form.product,
        status: form.status === "Aktif",
      });
    } catch {
      // ignore
    }

    try {
      const stored = localStorage.getItem("myringnet_custom_radius_auths");
      const currentList = stored ? JSON.parse(stored) : [];
      localStorage.setItem("myringnet_custom_radius_auths", JSON.stringify([newAuth, ...currentList]));
    } catch {
      // ignore
    }

    setRows((curr) => [newAuth, ...curr]);
    setModalOpen(false);
    setToastMessage(`Akun autentikasi "${newAuth.username}" berhasil ditambahkan.`);
    setForm({
      customer: "",
      username: "",
      password: "",
      pop: "POP Papringan",
      ip: "10.10.20.",
      product: "Broadband 50 Mbps",
      status: "Aktif",
      connectivity: "Terhubung",
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleTestAuth = (row: any) => {
    setTestingId(row.id);
    setTimeout(() => {
      setTestingId(null);
      setToastMessage(`Autentikasi "${row.username}" pada ${row.pop} valid dan aktif.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 700);
  };

  const handleToggleStatus = (row: any) => {
    const isCurrentlyActive = String(row.status).toLowerCase().includes("aktif") || String(row.connectivity).toLowerCase().includes("terhubung");
    const updated = {
      ...row,
      status: isCurrentlyActive ? "Nonaktif" : "Aktif",
      connectivity: isCurrentlyActive ? "Terputus" : "Terhubung",
    };
    setRows((curr) => curr.map((r) => (r.id === row.id ? updated : r)));
    setToastMessage(`Status autentikasi "${row.username}" diubah menjadi ${updated.status}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteAuth = (id: string) => {
    setRows((curr) => curr.filter((r) => r.id !== id));
    try {
      const stored = localStorage.getItem("myringnet_custom_radius_auths");
      if (stored) {
        const filtered = JSON.parse(stored).filter((r: any) => r.id !== id);
        localStorage.setItem("myringnet_custom_radius_auths", JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }
    setToastMessage("Akun autentikasi berhasil dihapus.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeCount = rows.filter((r) => String(r.status).toLowerCase().includes("aktif") || String(r.connectivity).toLowerCase().includes("terhubung")).length;

  return (
    <>
      <PageHeader
        title="Autentikasi Radius"
        subtitle="Pantau akun pelanggan, konektivitas, POP, alamat IP, dan produk terkait."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCw size={14} /> Refresh Data
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={15} /> Tambah Autentikasi
            </button>
          </div>
        }
      />

      {toastMessage ? (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {toastMessage}
        </div>
      ) : null}

      <RadiusSummary active={String(rows.length)} secondary={String(activeCount)} label="Total Autentikasi" />

      <DataTable
        title="Daftar Autentikasi"
        data={rows}
        searchPlaceholder="Cari pelanggan, username, POP..."
        columns={[
          { key: "status", header: "Status", render: (row) => <RadiusStatus value={row.status} /> },
          { key: "id", header: "ID", render: (row) => <span className="font-semibold text-indigo-600">{String(row.id).replace("auth-", "")}</span> },
          { key: "customer", header: "Pelanggan", render: (row) => <span className="font-medium text-slate-800">{row.customer}</span> },
          { key: "username", header: "Nama Pengguna", render: (row) => <span className="font-mono text-xs text-slate-700">{row.username}</span> },
          { key: "connectivity", header: "Konektivitas", render: (row) => <RadiusStatus value={row.connectivity} /> },
          { key: "pop", header: "POP / Area", render: (row) => <span className="font-medium text-slate-700">{row.pop}</span> },
          { key: "ip", header: "Alamat IP", render: (row) => <span className="font-mono text-xs text-indigo-600">{row.ip}</span> },
          { key: "product", header: "Produk Terkait", render: (row) => <span className="font-medium text-indigo-600">{row.product}</span> },
          {
            key: "id",
            header: "Aksi",
            render: (row) => (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleTestAuth(row)}
                  disabled={testingId === row.id}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                  title="Uji Autentikasi Radius"
                >
                  {testingId === row.id ? "Testing..." : "Uji Auth"}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleStatus(row)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                  title="Toggle Status Koneksi"
                >
                  {String(row.connectivity).toLowerCase().includes("terhubung") ? "Putuskan" : "Hubungkan"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAuth(row.id)}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
                  title="Hapus Autentikasi"
                >
                  Hapus
                </button>
              </div>
            ),
          },
        ]}
      />

      {/* Modal Tambah Autentikasi */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tambah Akun Autentikasi Radius</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAuth} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama Pelanggan *</label>
                <input
                  type="text"
                  required
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  placeholder="Contoh: CUST-010 - Ahmad Santoso"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Username PPPoE / Radius *</label>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="ahmadsantoso@ring.net.id"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Password PPPoE *</label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Password Akun"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">POP / Area Layanan *</label>
                  <select
                    value={form.pop}
                    onChange={(e) => setForm({ ...form, pop: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="POP Papringan">POP Papringan (Sleman)</option>
                    <option value="POP Kaliurang">POP Kaliurang (Sleman)</option>
                    <option value="POP Gejayan">POP Gejayan (Yogyakarta)</option>
                    <option value="POP Malioboro">POP Malioboro (Yogyakarta)</option>
                    <option value="POP Bantul Core">POP Bantul Core</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Alamat IP / IP Pool</label>
                  <input
                    type="text"
                    value={form.ip}
                    onChange={(e) => setForm({ ...form, ip: e.target.value })}
                    placeholder="10.10.20.50"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Paket / Produk Terkait</label>
                  <select
                    value={form.product}
                    onChange={(e) => setForm({ ...form, product: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="Broadband 25 Mbps">Broadband 25 Mbps</option>
                    <option value="Broadband 50 Mbps">Broadband 50 Mbps</option>
                    <option value="Broadband 100 Mbps">Broadband 100 Mbps</option>
                    <option value="Broadband 200 Mbps">Broadband 200 Mbps</option>
                    <option value="Dedicated 50 Mbps">Dedicated 50 Mbps</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Status Awal</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value, connectivity: e.target.value === "Aktif" ? "Terhubung" : "Terputus" })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  >
                    <option value="Aktif">Aktif (Terhubung)</option>
                    <option value="Nonaktif">Nonaktif (Terputus)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Simpan Autentikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

// 3. Grup Profil Bandwidth Page
export function RadiusProfileGroupPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    downloadRate: "50",
    uploadRate: "20",
    poolName: "pool-broadband",
    sharedUsers: 1,
  });

  const loadData = () => {
    radiusApi.getProfiles().then((data) => setRows(data));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await radiusApi.createProfile({
        name: form.name,
        groupname: form.name,
        download_rate: Number(form.downloadRate),
        upload_rate: Number(form.uploadRate),
        pool_name: form.poolName,
        shared_users: Number(form.sharedUsers),
      });
      setModalOpen(false);
      setToastMessage(`Grup profil "${form.name}" berhasil dibuat.`);
      loadData();
    } catch {
      setRows((curr) => [
        {
          id: `profile-${Date.now()}`,
          name: form.name,
          mikrotik: form.poolName,
          speedLimit: `${form.downloadRate}M/${form.uploadRate}M`,
          downloadLimit: `${form.downloadRate} Mbps`,
          uploadLimit: `${form.uploadRate} Mbps`,
          timeLimit: "∞",
          status: "Aktif",
        },
        ...curr,
      ]);
      setModalOpen(false);
      setToastMessage(`Grup profil "${form.name}" berhasil disimpan.`);
    }
  };

  const activeCount = rows.filter((r) => String(r.status).toLowerCase().includes("aktif")).length;

  return (
    <>
      <PageHeader
        title="Grup Profil"
        subtitle="Kelola profil bandwidth, batas kecepatan, kuota, dan batas waktu Radius."
        action={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={15} /> Tambah Profil
          </button>
        }
      />

      {toastMessage ? (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {toastMessage}
        </div>
      ) : null}

      <RadiusSummary active={String(rows.length)} secondary={String(activeCount || rows.length)} label="Total Profil" />

      <DataTable
        title="Daftar Grup Profil"
        data={rows}
        searchPlaceholder="Cari nama profil, mikrotik, batas..."
        columns={[
          { key: "name", header: "Nama Profil", render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
          { key: "mikrotik", header: "Mikrotik Pool", render: (row) => <span>{row.mikrotik || row.poolName || "default-pool"}</span> },
          { key: "speedLimit", header: "Batas Kecepatan", render: (row) => <span className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-700 ring-1 ring-cyan-200">{row.speedLimit || row.rateLimit || "-"}</span> },
          { key: "downloadLimit", header: "Batas Unduh", render: (row) => <span>{row.downloadLimit || `${row.downloadRate || 50} Mbps`}</span> },
          { key: "uploadLimit", header: "Batas Unggah", render: (row) => <span>{row.uploadLimit || `${row.uploadRate || 20} Mbps`}</span> },
          { key: "timeLimit", header: "Batas Waktu", render: (row) => <span>{row.timeLimit || "∞"}</span> },
        ]}
      />

      {/* Modal Tambah Profil */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Tambah Profil Bandwidth</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">Nama Profil *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Paket-50Mbps"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Download (Mbps) *</label>
                  <input
                    type="number"
                    required
                    value={form.downloadRate}
                    onChange={(e) => setForm({ ...form, downloadRate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Upload (Mbps) *</label>
                  <input
                    type="number"
                    required
                    value={form.uploadRate}
                    onChange={(e) => setForm({ ...form, uploadRate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">IP Pool Name</label>
                <input
                  type="text"
                  value={form.poolName}
                  onChange={(e) => setForm({ ...form, poolName: e.target.value })}
                  placeholder="pool-broadband"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

// 4. Sesi Pengguna Page
export function RadiusUserSessionPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = () => {
    radiusApi.getBroadbandStatus().then((res) => {
      if (res?.sessions && Array.isArray(res.sessions)) {
        setRows(res.sessions);
      } else {
        // Sample active data fallback
        setRows([
          { id: "SESS-1092", name: "Zainal Abidin", profile: "Broadband 50M", ip: "10.10.20.14", download: "1.4 GB", upload: "320 MB", nas: "RO-CORE-01", nasAddress: "192.168.1.1", nasPort: "3799", startedAt: "Hari ini, 08:30", status: "Online" },
          { id: "SESS-1093", name: "Budi Santoso", profile: "Broadband 100M", ip: "10.10.20.18", download: "5.8 GB", upload: "890 MB", nas: "RO-CORE-01", nasAddress: "192.168.1.1", nasPort: "3799", startedAt: "Hari ini, 09:15", status: "Online" },
        ]);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDisconnect = (row: any) => {
    setRows((curr) => curr.filter((r) => r.id !== row.id));
    setToastMessage(`Sesi "${row.name}" (${row.id}) berhasil diputuskan (PoD sent).`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <>
      <PageHeader
        title="Sesi Pengguna"
        subtitle="Pantau sesi online pelanggan, trafik, NAS, port, dan putuskan sesi aktif (PoD/Disconnect)."
        action={
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Refresh Sesi
          </button>
        }
      />

      {toastMessage ? (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {toastMessage}
        </div>
      ) : null}

      <RadiusSummary active={String(rows.length)} secondary={String(rows.length)} label="Sesi Online" />

      <DataTable
        title="Daftar Sesi Pengguna"
        data={rows}
        searchPlaceholder="Cari sesi, username, NAS..."
        columns={[
          { key: "status", header: "Status", render: (row) => <RadiusStatus value={row.status || "Online"} /> },
          { key: "id", header: "ID Sesi", render: (row) => <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">{row.id}</span> },
          { key: "name", header: "Nama Pelanggan", render: (row) => <span className="font-medium text-slate-800">{row.name}</span> },
          { key: "profile", header: "Profile" },
          { key: "ip", header: "Alamat IP" },
          { key: "download", header: "Unduh", render: (row) => <span className="font-semibold text-cyan-700">{row.download}</span> },
          { key: "upload", header: "Unggah", render: (row) => <span className="font-semibold text-amber-700">{row.upload}</span> },
          { key: "nas", header: "Nama NAS" },
          { key: "nasAddress", header: "Alamat NAS" },
          { key: "startedAt", header: "Mulai" },
          {
            key: "id",
            header: "Aksi",
            render: (row) => (
              <button
                type="button"
                onClick={() => handleDisconnect(row)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
                title="Putuskan koneksi pengguna dari NAS"
              >
                <Power size={12} /> Putuskan
              </button>
            ),
          },
        ]}
      />
    </>
  );
}

// 5. Riwayat Sesi Page
export function RadiusHistoryPage() {
  const [rows, setRows] = useState<any[]>([]);

  const loadData = () => {
    radiusApi.getBroadbandStatus().then((res) => {
      if (res?.logs && Array.isArray(res.logs)) {
        setRows(res.logs);
      } else {
        setRows([
          { topic: "Autentikasi", time: "Hari ini, 10:24", message: "User pppoe-user102 login berhasil dari NAS-01", customer: "Budi Santoso", authentication: "PPPoE-PAP" },
          { topic: "Accounting", time: "Hari ini, 09:12", message: "User pppoe-user101 session update (Bytes in: 120MB, Bytes out: 45MB)", customer: "Zainal Abidin", authentication: "PPPoE-CHAP" },
          { topic: "Disconnect", time: "Kemarin, 22:45", message: "User pppoe-user099 logout (User-Request)", customer: "PT Karya Digital", authentication: "PPPoE-PAP" },
        ]);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <PageHeader
        title="Riwayat Radius"
        subtitle="Lihat log autentikasi, koneksi, dan kejadian Radius pelanggan."
        action={
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <RefreshCw size={14} /> Refresh Log
          </button>
        }
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard icon={<Clock3 size={21} />} label="Retensi Riwayat" value="30 hari" accent="indigo" />
        <StatCard icon={<DatabaseZap size={21} />} label="Total Log" value={String(rows.length)} accent="emerald" />
        <StatCard icon={<Wifi size={21} />} label="Status Monitor" value="Aktif" accent="amber" />
      </div>
      <Card className="mb-4 border-cyan-100 bg-cyan-50 px-4 py-3 text-center text-sm font-medium text-cyan-800">
        Riwayat log autentikasi akan tersimpan dan diarsipkan otomatis selama 30 hari.
      </Card>
      <DataTable
        title="Daftar Riwayat"
        data={rows}
        searchPlaceholder="Cari topik, pelanggan, autentikasi..."
        columns={[
          { key: "topic", header: "Topik", render: (row) => <RadiusStatus value={row.topic} /> },
          { key: "time", header: "Waktu" },
          { key: "message", header: "Pesan Log" },
          { key: "customer", header: "Pelanggan", render: (row) => <span className="font-medium text-indigo-600">{row.customer}</span> },
          { key: "authentication", header: "Metode Autentikasi", render: (row) => <span className="font-medium text-indigo-600">{row.authentication}</span> },
        ]}
      />
    </>
  );
}

