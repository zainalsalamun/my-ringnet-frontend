"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { Activity, ArrowUpRight, CheckCircle2, Database, Network, Plus, Radio, RefreshCw, Router, Server, ShieldCheck, Users, Wifi } from "lucide-react";
import { Badge, Card, DataTable, ShimmerBlock, StatCard } from "@/components/ui/AdminUI";
import { radiusApi } from "@/src/features/radius/api";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export function RadiusDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [nasList, setNasList] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [authentications, setAuthentications] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [nasRes, profRes, authRes, statusRes] = await Promise.allSettled([
        radiusApi.getNasList(),
        radiusApi.getProfiles(),
        radiusApi.getAuthentications(),
        radiusApi.getBroadbandStatus(),
      ]);

      const nas = nasRes.status === "fulfilled" ? nasRes.value : [];
      const prof = profRes.status === "fulfilled" ? profRes.value : [];
      const auth = authRes.status === "fulfilled" ? authRes.value : [];
      const status = statusRes.status === "fulfilled" ? statusRes.value : null;

      setNasList(nas);
      setProfiles(prof);
      setAuthentications(auth);
      setSessions(status?.sessions && Array.isArray(status.sessions) ? status.sessions : []);
      setLastUpdated(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleRefresh() {
    setRefreshing(true);
    loadData();
  }

  const activeNasCount = useMemo(() => {
    return nasList.filter((n) => String(n.status).toLowerCase().includes("aktif")).length;
  }, [nasList]);

  const activeSessionsCount = useMemo(() => {
    return sessions.length || authentications.filter((a) => a.connectivity === "Terhubung" || a.status === "Aktif").length;
  }, [authentications, sessions]);

  // Combined live session rows for the real-time table
  const displaySessions = useMemo(() => {
    if (sessions.length > 0) return sessions;
    return authentications.map((a, idx) => ({
      id: a.id || `SES-${idx + 1}`,
      status: a.connectivity === "Terhubung" ? "Online" : "Offline",
      name: a.username || a.customer || `user-${idx + 1}`,
      profile: a.product || a.profileName || "Broadband",
      ip: a.ip || a.ipAddress || "-",
      download: "0 MB",
      upload: "0 MB",
      nas: a.pop || "RO.RINGNET-GATEWAY",
      nasAddress: "10.10.1.1",
      nasPort: "vlan-inet",
      startedAt: "Aktif",
    }));
  }, [authentications, sessions]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Live Badge */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Radius Engine Live • Terakhir diperbarui: <span className="text-slate-800 font-semibold">{lastUpdated || "Menghubungkan..."}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-indigo-600" : "text-slate-500"} />
            {refreshing ? "Memperbarui..." : "Perbarui Data"}
          </button>
          <Link
            href="/radius/nas-router/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={14} />
            Tambah NAS
          </Link>
          <Link
            href="/radius/grup-profil/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
          >
            <Plus size={14} />
            Tambah Profil
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-5">
              <div className="flex items-center gap-4">
                <ShimmerBlock className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <ShimmerBlock className="h-3 w-28" />
                  <ShimmerBlock className="h-8 w-36" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Router size={22} />}
            label="Total NAS Router"
            value={String(nasList.length)}
            trend={`${activeNasCount} router aktif`}
            accent="indigo"
          />
          <StatCard
            icon={<Wifi size={22} />}
            label="Sesi Pengguna Online"
            value={String(activeSessionsCount)}
            trend="PPPoE / Hotspot aktif"
            accent="emerald"
          />
          <StatCard
            icon={<Network size={22} />}
            label="Grup Profil Bandwidth"
            value={String(profiles.length)}
            trend="Paket kecepatan aktif"
            accent="amber"
          />
          <StatCard
            icon={<Users size={22} />}
            label="Autentikasi Terdaftar"
            value={String(authentications.length)}
            trend="Akun pelanggan radius"
            accent="rose"
          />
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "NAS / Router Gateway", href: "/radius/nas-router", icon: <Server size={18} />, count: `${nasList.length} Unit`, desc: "MikroTik & CoA 3799" },
          { label: "Grup Profil Bandwidth", href: "/radius/grup-profil", icon: <Activity size={18} />, count: `${profiles.length} Profil`, desc: "Rate Limit & Pool IP" },
          { label: "Autentikasi Pelanggan", href: "/radius/autentikasi", icon: <ShieldCheck size={18} />, count: `${authentications.length} Akun`, desc: "PPPoE & Static Binding" },
          { label: "Riwayat & Log Radius", href: "/radius/riwayat", icon: <Database size={18} />, count: "Audit Log", desc: "Retensi log 30 hari" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="p-4 transition hover:border-indigo-400 hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  {item.icon}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-700">
                  {item.count}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  {item.label}
                  <ArrowUpRight size={14} className="text-slate-400" />
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Two Column Section: NAS Routers & Bandwidth Profiles */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* NAS Routers Table */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950 flex items-center gap-2">
                <Router size={18} className="text-indigo-600" />
                Daftar Router NAS Terpasang
              </h2>
              <p className="text-xs text-slate-500">Router gateway yang terhubung ke server autentikasi Radius.</p>
            </div>
            <Link href="/radius/nas-router" className="text-xs font-bold text-indigo-600 hover:underline">
              Lihat Semua
            </Link>
          </div>

          {loading ? (
            <ShimmerBlock className="h-48" />
          ) : nasList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Belum ada router NAS terdaftar.{" "}
              <Link href="/radius/nas-router/new" className="font-bold text-indigo-600 hover:underline">
                Tambah sekarang
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5 font-bold">Nama Router</th>
                    <th className="px-3 py-2.5 font-bold">IP Address</th>
                    <th className="px-3 py-2.5 font-bold">Port</th>
                    <th className="px-3 py-2.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nasList.slice(0, 5).map((nas) => (
                    <tr key={nas.id} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2.5 font-bold text-slate-800">{nas.name}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-600">{nas.address || nas.targetIp || "-"}</td>
                      <td className="px-3 py-2.5 text-slate-500">{nas.targetPort || "3799"}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                          <CheckCircle2 size={10} /> Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Profiles Distribution */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-950 flex items-center gap-2">
                <Activity size={18} className="text-amber-500" />
                Grup Profil Bandwidth
              </h2>
              <p className="text-xs text-slate-500">Paket kecepatan broadband dan konfigurasi rate limit.</p>
            </div>
            <Link href="/radius/grup-profil" className="text-xs font-bold text-indigo-600 hover:underline">
              Lihat Semua
            </Link>
          </div>

          {loading ? (
            <ShimmerBlock className="h-48" />
          ) : profiles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Belum ada profil bandwidth.{" "}
              <Link href="/radius/grup-profil/new" className="font-bold text-indigo-600 hover:underline">
                Tambah profil baru
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.slice(0, 5).map((prof) => (
                <div key={prof.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{prof.name}</p>
                    <p className="text-xs text-slate-500">Pool: {prof.poolName || "default-pool"}</p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-black text-indigo-700 ring-1 ring-indigo-200">
                      {prof.rateLimit || `${prof.downloadRate || 0}M/${prof.uploadRate || 0}M`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Live User Sessions Table */}
      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-950 flex items-center gap-2">
              <Radio size={18} className="text-emerald-500" />
              Sesi Pengguna Online Real-Time
            </h2>
            <p className="text-xs text-slate-500">Daftar koneksi PPPoE dan IP pelanggan yang aktif di router NAS.</p>
          </div>
          <Link href="/radius/sesi-pengguna" className="text-xs font-bold text-indigo-600 hover:underline">
            Buka Halaman Penuh Sesi Pengguna →
          </Link>
        </div>

        <DataTable
          title="Daftar Sesi Aktif"
          data={displaySessions}
          searchPlaceholder="Cari username, IP address, router NAS..."
          columns={[
            { key: "status", header: "Status", render: (r) => <Badge value={r.status || "active"} /> },
            { key: "id", header: "ID Sesi", render: (r) => <span className="font-mono text-xs font-bold text-indigo-600">{r.id}</span> },
            { key: "name", header: "Username / Pelanggan", render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
            { key: "profile", header: "Profil Paket", render: (r) => <span className="text-slate-600">{r.profile}</span> },
            { key: "ip", header: "IP Address", render: (r) => <span className="font-mono text-slate-700">{r.ip}</span> },
            { key: "nas", header: "Router NAS", render: (r) => <span className="text-slate-700">{r.nas}</span> },
            { key: "download", header: "Traffic", render: (r) => <span className="text-xs font-bold text-cyan-700">↓ {r.download || "0 MB"} / ↑ {r.upload || "0 MB"}</span> },
            { key: "startedAt", header: "Koneksi", render: (r) => <span className="text-xs text-slate-500">{r.startedAt}</span> },
          ]}
        />
      </Card>
    </div>
  );
}
