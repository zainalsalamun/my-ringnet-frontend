"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import { CheckCircle2, Globe, Link2, PauseCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Badge, Card, DataTable, ShimmerBlock } from "@/components/ui/AdminUI";
import { date } from "@/lib/format";
import api from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export function RadiusDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [statusCounts, setStatusCounts] = useState({
    online: 0,
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [rows, setRows] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [statusRes, listRes] = await Promise.allSettled([
        api.get("/broadband/list-status"),
        api.post("/broadband/list", {
          pageSize: 500,
          pageIndex: 0,
          sorting: [{ id: "created_at", desc: true }],
          columnFilters: [],
          globalFilter: "",
        }),
      ]);

      let listData: any[] = [];
      if (listRes.status === "fulfilled") {
        const raw = listRes.value.data?.data?.data || listRes.value.data?.data || listRes.value.data?.rows || [];
        if (Array.isArray(raw)) {
          listData = raw.map((item: any) => ({
            id: item.authentication_id || item.id || "-",
            status: item.status === true || item.status === "active" ? "active" : "inactive",
            created_at: item.created_at || item.createdAt || "-",
            username: item.username || item.service_username || "-",
            customerName: item.customer?.name || item.customer_name || item.name || "-",
            customerCode: item.customer?.customer_id || item.customer_id || item.customerCode || "-",
            isOnline: item.isOnline ?? item.is_online ?? (item.status === "active" || item.connectivity === "Terhubung"),
            profileName: item.profile?.name || item.profile_name || item.profile || "-",
            packageName: item.bind_product?.name || item.package_name || item.product || "-",
            popName: item.pop?.name || item.pop_name || item.pop || "POP Utama",
            lastAccounting: item.lastAccounting || item.updated_at || "-",
            last_login: item.last_login || item.lastLogin || item.startedAt || "-",
          }));
        }
      }
      setRows(listData);

      if (statusRes.status === "fulfilled" && statusRes.value.data) {
        const d = statusRes.value.data?.data || statusRes.value.data;
        setStatusCounts({
          online: Number(d.online ?? listData.filter((r) => r.isOnline).length),
          total: Number(d.total ?? listData.length),
          active: Number(d.active ?? listData.filter((r) => r.status === "active").length),
          inactive: Number(d.inactive ?? listData.filter((r) => r.status !== "active").length),
        });
      } else {
        setStatusCounts({
          online: listData.filter((r) => r.isOnline).length,
          total: listData.length,
          active: listData.filter((r) => r.status === "active").length,
          inactive: listData.filter((r) => r.status !== "active").length,
        });
      }

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

  return (
    <div className="space-y-6">
      {/* Top Status Bar & Refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Radius Engine Live • Terakhir diperbarui:{" "}
            <span className="font-semibold text-slate-800">{lastUpdated || "Menghubungkan..."}</span>
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-indigo-600" : "text-slate-500"} />
            {refreshing ? "Memperbarui..." : "Perbarui Data"}
          </button>
        </div>
      </div>

      {/* 4 Summary Top Cards matching apps.ring.net.id */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 2xl:gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="p-4">
              <ShimmerBlock className="h-8 w-16 mb-2" />
              <ShimmerBlock className="h-4 w-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 2xl:gap-6">
          {/* Card 1: Connected */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold tracking-tight text-slate-900">{statusCounts.online}</p>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <Link2 size={20} />
              </span>
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Connected</p>
          </div>

          {/* Card 2: Total */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold tracking-tight text-slate-900">{statusCounts.total}</p>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <Globe size={20} />
              </span>
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Total</p>
          </div>

          {/* Card 3: Active */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold tracking-tight text-slate-900">{statusCounts.active}</p>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
                <CheckCircle2 size={20} />
              </span>
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Active</p>
          </div>

          {/* Card 4: Inactive */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold tracking-tight text-slate-900">{statusCounts.inactive}</p>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-600">
                <PauseCircle size={20} />
              </span>
            </div>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Inactive</p>
          </div>
        </div>
      )}

      {/* Main Broadband Authentication & Sessions Table */}
      <Card className="p-5">
        <div className="mb-4">
          <h2 className="font-black text-slate-950">Daftar Akun Broadband & Radius</h2>
          <p className="text-xs text-slate-500">Monitoring akun pelanggan, status koneksi PPPoE, dan profil bandwidth.</p>
        </div>

        <DataTable
          title="Tabel Broadband"
          data={rows}
          searchPlaceholder="Cari username, nama pelanggan, profil, POP..."
          columns={[
            {
              key: "status",
              header: "Status",
              render: (r) => <Badge value={r.status} />,
            },
            {
              key: "created_at",
              header: "Tanggal",
              render: (r) => (r.created_at && r.created_at !== "-" ? date(r.created_at) : "-"),
            },
            {
              key: "username",
              header: "Username",
              render: (r) => <span className="font-semibold text-indigo-600">{r.username}</span>,
            },
            {
              key: "customer",
              header: "Pelanggan",
              render: (r) => (
                <div>
                  <span className="font-bold text-slate-900">{r.customerName}</span>
                  {r.customerCode && r.customerCode !== "-" ? (
                    <p className="text-[11px] text-slate-400">{r.customerCode}</p>
                  ) : null}
                </div>
              ),
            },
            {
              key: "isOnline",
              header: "Koneksi",
              render: (r) =>
                r.isOnline ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                    <Wifi size={13} /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                    <WifiOff size={13} /> Disconnected
                  </span>
                ),
            },
            {
              key: "profile",
              header: "Profil Bandwidth",
              render: (r) => (
                <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700">
                  {r.profileName}
                </span>
              ),
            },
            {
              key: "package",
              header: "Paket",
              render: (r) => <span className="text-slate-700">{r.packageName}</span>,
            },
            {
              key: "pop",
              header: "POP",
              render: (r) => <span className="text-slate-600">{r.popName}</span>,
            },
            {
              key: "last_login",
              header: "Terakhir Terkoneksi",
              render: (r) => (r.last_login && r.last_login !== "-" ? date(r.last_login) : "-"),
            },
          ]}
        />
      </Card>
    </div>
  );
}
