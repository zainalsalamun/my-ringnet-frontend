"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { CheckCircle2, Pause, Play, RefreshCw, Server, Trash2, Users, XCircle } from "lucide-react";
import { Card, SelectInput } from "@/components/ui/AdminUI";
import { radiusApi } from "@/src/features/radius/api";
import api from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";

// Generate 12-hour slots for timeline
function generateTimeSlots() {
  const slots: string[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 30 * 60 * 1000);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes() < 30 ? "05" : "35");
    slots.push(`${hours}:${minutes}`);
  }
  return slots;
}

export function RadiusDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [servers, setServers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogPaused, setIsLogPaused] = useState(false);

  // Filter logs
  const [logFilter, setLogFilter] = useState({
    berhasil: true,
    gagal: true,
    sesi: true,
    sistem: true,
  });

  // Search in active sessions
  const [sessionSearch, setSessionSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    try {
      const [broadbandRes, nasRes, statusRes] = await Promise.allSettled([
        api.post("/broadband/list", {
          pageSize: 500,
          pageIndex: 0,
          sorting: [],
          columnFilters: [],
          globalFilter: "",
        }),
        radiusApi.getNasList(),
        api.get("/broadband/list-status"),
      ]);

      let sessionList: any[] = [];
      if (broadbandRes.status === "fulfilled") {
        const raw = broadbandRes.value.data?.data?.data || broadbandRes.value.data?.data || broadbandRes.value.data?.rows || [];
        if (Array.isArray(raw)) {
          sessionList = raw.map((item: any, idx: number) => {
            const rawId = String(item.authentication_id || item.id || `8160${idx.toString(16).padStart(4, "0")}`);
            const shortId = rawId.length > 8 ? rawId.slice(-8) : rawId;
            const isOnline = item.isOnline ?? item.is_online ?? (item.status === "active" || item.connectivity === "Terhubung");
            const customerCode = item.customer?.customer_id || item.customer_id || item.customerCode || "";
            const customerName = item.customer?.name || item.customer_name || item.name || "";
            const customerDisplay = customerCode && customerName ? `${customerCode} - ${customerName}` : customerName || customerCode || "-";

            return {
              id: shortId,
              status: isOnline ? "Online" : "Offline",
              username: item.username || item.service_username || `user${idx + 1}@ring.net.id`,
              customer: customerDisplay,
              profile: item.profile?.name || item.profile_name || item.profile || item.bind_product?.name || "Broadband",
              connectedAt: item.last_login || item.startedAt || item.created_at || "14 Mei 2026, 00:00",
              ip: item.ip_address || item.ip || "-",
            };
          });
        }
      }
      setSessions(sessionList);

      if (nasRes.status === "fulfilled") {
        setServers(nasRes.value);
      }

      if (statusRes.status === "fulfilled" && statusRes.value.data) {
        const d = statusRes.value.data?.data || statusRes.value.data;
        if (Array.isArray(d?.logs)) {
          setLogs(d.logs);
        }
      }
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

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Stats calculation
  const activeSessionsCount = useMemo(() => {
    return sessions.filter((s) => s.status === "Online").length || sessions.length;
  }, [sessions]);

  const connectedServersCount = useMemo(() => {
    return servers.filter((s) => String(s.status).toLowerCase().includes("aktif")).length;
  }, [servers]);

  // Filtered session list
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchSearch =
        !sessionSearch ||
        s.username.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.customer.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.profile.toLowerCase().includes(sessionSearch.toLowerCase());
      const matchStatus = !statusFilter || s.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [sessionSearch, sessions, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const currentPage = Math.max(0, Math.min(pageIndex, totalPages - 1));
  const displayedSessions = filteredSessions.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // Color generator for pills
  const getPillColor = (index: number) => {
    const colors = [
      "border-sky-300 text-sky-700 bg-sky-50/50",
      "border-pink-300 text-pink-700 bg-pink-50/50",
      "border-emerald-300 text-emerald-700 bg-emerald-50/50",
      "border-amber-300 text-amber-700 bg-amber-50/50",
      "border-indigo-300 text-indigo-700 bg-indigo-50/50",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Radius Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Pemantauan sesi, server, dan aktivitas autentikasi RADIUS secara real-time.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-indigo-600" : "text-slate-500"} />
            {refreshing ? "Memperbarui..." : "Perbarui Data"}
          </button>
        </div>
      </div>

      {/* 2. Top 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: SESI AKTIF */}
        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-100/70 text-sky-600">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SESI AKTIF</p>
            <p className="text-2xl font-black text-slate-900">{loading ? "..." : activeSessionsCount}</p>
          </div>
        </Card>

        {/* Card 2: SERVER TERHUBUNG */}
        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-pink-100/70 text-pink-600">
            <Server size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">SERVER TERHUBUNG</p>
            <p className="text-2xl font-black text-slate-900">{loading ? "..." : connectedServersCount}</p>
          </div>
        </Card>

        {/* Card 3: BERHASIL (12J) */}
        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100/70 text-emerald-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">BERHASIL (12J)</p>
            <p className="text-2xl font-black text-slate-900">0</p>
          </div>
        </Card>

        {/* Card 4: GAGAL (12J) */}
        <Card className="flex items-center gap-4 p-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100/70 text-rose-500">
            <XCircle size={22} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">GAGAL (12J)</p>
            <p className="text-2xl font-black text-slate-900">0</p>
          </div>
        </Card>
      </div>

      {/* 3. Aktivitas Autentikasi (12 jam terakhir) Chart Card */}
      <Card className="p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-bold text-slate-900">Aktivitas Autentikasi (12 jam terakhir)</h2>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Berhasil
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              Gagal
            </span>
          </div>
        </div>

        {/* Chart Canvas / SVG Timeline */}
        <div className="relative pt-4">
          <div className="flex h-44 w-full flex-col justify-between border-b border-orange-500/80">
            <div className="flex items-center gap-3 border-b border-dashed border-slate-100 text-xs text-slate-400">
              <span className="w-4 text-right">2</span>
              <div className="h-px flex-1" />
            </div>
            <div className="flex items-center gap-3 border-b border-dashed border-slate-100 text-xs text-slate-400">
              <span className="w-4 text-right">1</span>
              <div className="h-px flex-1" />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="w-4 text-right">0</span>
              <div className="h-px flex-1" />
            </div>
          </div>

          {/* Time Labels */}
          <div className="mt-2 flex justify-between overflow-x-auto text-[10px] text-slate-400">
            {timeSlots.map((slot, index) => (
              <span key={index} className="shrink-0 px-1">
                {slot}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* 4. Radius Server Card */}
      <Card className="p-5">
        <h2 className="font-bold text-slate-900">Radius Server</h2>
        {servers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">Belum ada radiusd yang terhubung.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {servers.map((srv) => (
              <div key={srv.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{srv.name}</p>
                  <p className="font-mono text-xs text-slate-500">{srv.address || srv.targetIp}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                  Aktif
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 5. Live Logs & Aktivitas Pengguna (2 Columns) */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: Live Logs */}
        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900">Live Logs</h2>
              <button
                type="button"
                onClick={() => setIsLogPaused(!isLogPaused)}
                className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
                title={isLogPaused ? "Lanjutkan" : "Jeda"}
              >
                {isLogPaused ? <Play size={12} /> : <Pause size={12} />}
              </button>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
                title="Hapus log"
              >
                <Trash2 size={12} />
              </button>
            </div>

            {/* Checkbox Filters */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logFilter.berhasil}
                  onChange={(e) => setLogFilter({ ...logFilter, berhasil: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-700">Berhasil</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logFilter.gagal}
                  onChange={(e) => setLogFilter({ ...logFilter, gagal: e.target.checked })}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-slate-700">Gagal</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logFilter.sesi}
                  onChange={(e) => setLogFilter({ ...logFilter, sesi: e.target.checked })}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700">Sesi</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logFilter.sistem}
                  onChange={(e) => setLogFilter({ ...logFilter, sistem: e.target.checked })}
                  className="rounded border-slate-300 text-fuchsia-600 focus:ring-fuchsia-500"
                />
                <span className="text-slate-700">Sistem</span>
              </label>
            </div>
          </div>

          {/* Log Console Box */}
          <div className="min-h-[220px] rounded-xl bg-slate-50/70 p-4 font-mono text-xs text-slate-400">
            {logs.length === 0 ? (
              <p>Belum ada log...</p>
            ) : (
              <div className="space-y-1 text-slate-700">
                {logs.map((lg, i) => (
                  <div key={i}>{lg.message || JSON.stringify(lg)}</div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Right: Aktivitas Pengguna */}
        <Card className="p-5">
          <h2 className="mb-4 font-bold text-slate-900">Aktivitas Pengguna</h2>
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">TERHUBUNG (0)</p>
              <p className="mt-2 text-xs text-slate-400">Belum ada koneksi berhasil</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-500">GAGAL TERHUBUNG (0)</p>
              <p className="mt-2 text-xs text-slate-400">Belum ada percobaan gagal</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 6. Sesi Aktif Table (Mirrored from Image 3) */}
      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-black text-slate-900">Sesi Aktif</h2>

          {/* Search bar & tool buttons */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari..."
                value={sessionSearch}
                onChange={(e) => {
                  setSessionSearch(e.target.value);
                  setPageIndex(0);
                }}
                className="h-9 w-48 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:w-64"
              />
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[950px] text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-4 py-3 min-w-[120px]">
                  <div className="flex flex-col gap-1">
                    <span>STATUS</span>
                    <SelectInput
                      size="sm"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPageIndex(0);
                      }}
                      options={[
                        { label: "Pilih Nilai", value: "" },
                        { label: "Online", value: "Online" },
                        { label: "Offline", value: "Offline" },
                      ]}
                    />
                  </div>
                </th>
                <th className="px-4 py-3">ID SESI</th>
                <th className="px-4 py-3">NAMA PENGGUNA</th>
                <th className="px-4 py-3">PELANGGAN</th>
                <th className="px-4 py-3">PROFIL</th>
                <th className="px-4 py-3">WAKTU TERKONEKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {displayedSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Belum ada sesi aktif.
                  </td>
                </tr>
              ) : (
                displayedSessions.map((session, index) => (
                  <tr key={session.id || index} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Online
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{session.id}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 font-semibold ${getPillColor(
                          index
                        )}`}
                      >
                        {session.username}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 font-semibold ${getPillColor(
                          index + 1
                        )}`}
                      >
                        {session.customer}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full border border-sky-300 bg-sky-50/50 px-3 py-1 font-bold text-sky-700">
                        {session.profile}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{session.connectedAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSessions.length > pageSize ? (
          <div className="flex flex-col gap-3 pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-slate-500">
              Menampilkan {currentPage * pageSize + 1} -{" "}
              {Math.min((currentPage + 1) * pageSize, filteredSessions.length)} dari {filteredSessions.length} sesi
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-black text-slate-700">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setPageIndex((prev) => Math.min(totalPages - 1, prev + 1))}
                className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
