"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Activity, Clock3, DatabaseZap, Network, ShieldCheck, Wifi } from "lucide-react";
import { Card, DataTable, PageHeader, StatCard } from "@/components/ui/AdminUI";
import { radiusApi } from "@/src/features/radius/api";
import { useEffect, useState } from "react";

function RadiusStatus({ value }: { value: string }) {
  const normalized = String(value || "").toLowerCase();
  const className = normalized.includes("disabled") || normalized.includes("non")
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

export function RadiusNasRouterPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    radiusApi.getNasList().then((data) => setRows(data));
  }, []);

  const activeCount = rows.filter((r) => String(r.status).toLowerCase().includes("aktif")).length;

  return (
    <>
      <PageHeader title="NAS / Router" subtitle="Kelola router NAS, alamat IP, port CoA, dan status perangkat Radius." />
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
          { key: "targetPort", header: "Port Tujuan" },
          { key: "createdAt", header: "Tanggal Dibuat" },
        ]}
      />
    </>
  );
}

export function RadiusAuthenticationPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    radiusApi.getAuthentications().then((data) => setRows(data));
  }, []);

  const activeCount = rows.filter((r) => String(r.status).toLowerCase().includes("aktif") || String(r.connectivity).toLowerCase().includes("terhubung")).length;

  return (
    <>
      <PageHeader title="Autentikasi Radius" subtitle="Pantau akun pelanggan, konektivitas, POP, alamat IP, dan produk terkait." />
      <RadiusSummary active={String(rows.length)} secondary={String(activeCount)} label="Total Autentikasi" />
      <DataTable
        title="Daftar Autentikasi"
        data={rows}
        searchPlaceholder="Cari pelanggan, username, POP..."
        columns={[
          { key: "status", header: "Status", render: (row) => <RadiusStatus value={row.status} /> },
          { key: "id", header: "ID", render: (row) => <span className="font-semibold text-indigo-600">{String(row.id).replace("auth-", "")}</span> },
          { key: "customer", header: "Pelanggan", render: (row) => <span className="font-medium text-slate-800">{row.customer}</span> },
          { key: "username", header: "Nama Pengguna" },
          { key: "connectivity", header: "Konektivitas", render: (row) => <RadiusStatus value={row.connectivity} /> },
          { key: "pop", header: "POP / POO" },
          { key: "ip", header: "Alamat IP" },
          { key: "product", header: "Produk Terkait", render: (row) => <span className="font-medium text-indigo-600">{row.product}</span> },
        ]}
      />
    </>
  );
}

export function RadiusProfileGroupPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    radiusApi.getProfiles().then((data) => setRows(data));
  }, []);

  const activeCount = rows.filter((r) => String(r.status).toLowerCase().includes("aktif")).length;

  return (
    <>
      <PageHeader title="Grup Profil" subtitle="Kelola profil bandwidth, batas kecepatan, kuota, dan batas waktu Radius." />
      <RadiusSummary active={String(rows.length)} secondary={String(activeCount || rows.length)} label="Total Profil" />
      <DataTable
        title="Daftar Grup Profil"
        data={rows}
        searchPlaceholder="Cari nama profil, mikrotik, batas..."
        columns={[
          { key: "name", header: "Nama", render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
          { key: "mikrotik", header: "Mikrotik Profil", render: (row) => <span>{row.mikrotik || row.poolName || "rmnradius"}</span> },
          { key: "speedLimit", header: "Batas Kecepatan", render: (row) => <span className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-700 ring-1 ring-cyan-200">{row.speedLimit || row.rateLimit || "-"}</span> },
          { key: "downloadLimit", header: "Batas Unduh", render: (row) => <span>{row.downloadLimit || "∞"}</span> },
          { key: "uploadLimit", header: "Batas Unggah", render: (row) => <span>{row.uploadLimit || "∞"}</span> },
          { key: "timeLimit", header: "Batas Waktu", render: (row) => <span>{row.timeLimit || "∞"}</span> },
        ]}
      />
    </>
  );
}

export function RadiusUserSessionPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    radiusApi.getBroadbandStatus().then((res) => {
      if (res?.sessions && Array.isArray(res.sessions)) {
        setRows(res.sessions);
      }
    });
  }, []);

  return (
    <>
      <PageHeader title="Sesi Pengguna" subtitle="Pantau sesi online pelanggan, trafik, NAS, port, dan waktu mulai koneksi." />
      <RadiusSummary active={String(rows.length)} secondary={String(rows.length)} label="Sesi Online" />
      <DataTable
        title="Daftar Sesi Pengguna"
        data={rows}
        searchPlaceholder="Cari sesi, username, NAS..."
        columns={[
          { key: "status", header: "Status", render: (row) => <RadiusStatus value={row.status} /> },
          { key: "id", header: "ID Sesi", render: (row) => <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200">{row.id}</span> },
          { key: "name", header: "Nama", render: (row) => <span className="font-medium text-slate-800">{row.name}</span> },
          { key: "profile", header: "Profile" },
          { key: "ip", header: "Alamat IP" },
          { key: "download", header: "Unduh", render: (row) => <span className="font-semibold text-cyan-700">{row.download}</span> },
          { key: "upload", header: "Unggah", render: (row) => <span className="font-semibold text-amber-700">{row.upload}</span> },
          { key: "nas", header: "Nama NAS" },
          { key: "nasAddress", header: "Alamat NAS" },
          { key: "nasPort", header: "NAS Port ID" },
          { key: "startedAt", header: "Mulai" },
        ]}
      />
    </>
  );
}

export function RadiusHistoryPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    radiusApi.getBroadbandStatus().then((res) => {
      if (res?.logs && Array.isArray(res.logs)) {
        setRows(res.logs);
      }
    });
  }, []);

  return (
    <>
      <PageHeader title="Riwayat Radius" subtitle="Lihat log autentikasi, koneksi, dan kejadian Radius pelanggan." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard icon={<Clock3 size={21} />} label="Retensi Riwayat" value="30 hari" accent="indigo" />
        <StatCard icon={<DatabaseZap size={21} />} label="Total Log" value={String(rows.length)} accent="emerald" />
        <StatCard icon={<Wifi size={21} />} label="Status Monitor" value="Aktif" accent="amber" />
      </div>
      <Card className="mb-4 border-cyan-100 bg-cyan-50 px-4 py-3 text-center text-sm font-medium text-cyan-800">
        Riwayat akan terhapus otomatis setelah 30 hari
      </Card>
      <DataTable
        title="Daftar Riwayat"
        data={rows}
        searchPlaceholder="Cari topik, pelanggan, autentikasi..."
        columns={[
          { key: "topic", header: "Topik", render: (row) => <RadiusStatus value={row.topic} /> },
          { key: "time", header: "Waktu" },
          { key: "message", header: "Pesan" },
          { key: "customer", header: "Pelanggan", render: (row) => <span className="font-medium text-indigo-600">{row.customer}</span> },
          { key: "authentication", header: "Autentikasi", render: (row) => <span className="font-medium text-indigo-600">{row.authentication}</span> },
        ]}
      />
    </>
  );
}
