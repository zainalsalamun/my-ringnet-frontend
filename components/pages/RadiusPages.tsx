"use client";

import { Activity, Clock3, DatabaseZap, Network, RadioTower, ShieldCheck, Wifi } from "lucide-react";
import { Badge, Card, DataTable, PageHeader, StatCard } from "@/components/ui/AdminUI";

type RadiusRow = { id: string; [key: string]: string };

const nasRouters: RadiusRow[] = [
  { id: "nas-1", name: "RO-BASABASI-UMY", status: "Aktif", address: "10.107.11.12", targetIp: "10.107.11.12", targetPort: "3799", createdAt: "25 Oktober 2023" },
  { id: "nas-2", name: "RO-MATO-SELOKAN", status: "Aktif", address: "10.107.11.13", targetIp: "10.107.11.13", targetPort: "3799", createdAt: "25 Oktober 2023" },
  { id: "nas-3", name: "RO-DSB-PAPRINGAN", status: "Aktif", address: "103.162.62.7", targetIp: "103.162.62.7", targetPort: "3799", createdAt: "13 Juli 2023" },
  { id: "nas-4", name: "RO-MATO3-PAMELA", status: "Aktif", address: "10.107.11.11", targetIp: "10.107.11.11", targetPort: "3799", createdAt: "25 Oktober 2023" },
  { id: "nas-5", name: "RO-DSB-WIYORO", status: "Aktif", address: "103.162.62.16", targetIp: "103.162.62.16", targetPort: "3799", createdAt: "14 Juli 2023" },
  { id: "nas-6", name: "RO-DSB-KBL", status: "Aktif", address: "103.162.62.21", targetIp: "103.162.62.21", targetPort: "3799", createdAt: "13 Juli 2023" },
  { id: "nas-7", name: "RO-DSB-SCH", status: "Aktif", address: "103.162.62.32", targetIp: "103.162.62.32", targetPort: "3799", createdAt: "06 Juli 2023" },
  { id: "nas-8", name: "RO-TEST", status: "Aktif", address: "10.107.11.10", targetIp: "10.107.11.10", targetPort: "3799", createdAt: "16 Oktober 2023" },
];

const authentications: RadiusRow[] = [
  { id: "auth-14446", status: "Aktif", customer: "100091433 - Taufik Hidayat", username: "91433taufik@ring.net.id", connectivity: "Terhubung", pop: "Banyumili Ponjong", ip: "192.168.83.15", product: "RIMAX 1" },
  { id: "auth-14445", status: "Aktif", customer: "100091432 - Tri Juantoro", username: "100091432tri@ring.net.id", connectivity: "Terhubung", pop: "HUNTAP PAGERJURANG", ip: "192.168.84.37", product: "BROADBAND FIBER BRONZE 25" },
  { id: "auth-14444", status: "Aktif", customer: "100091431 - Dhias Wicaksono", username: "91431dhias@ring.net.id", connectivity: "Terhubung", pop: "HUNTAP PAGERJURANG", ip: "192.168.84.36", product: "BROADBAND FIBER BRONZE 25" },
  { id: "auth-14443", status: "Aktif", customer: "100091430 - Megia Lista 2", username: "91430megia2@ring.net.id", connectivity: "Terhubung", pop: "HUNTAP PAGERJURANG", ip: "192.168.84.35", product: "BROADBAND FIBER BRONZE 25" },
  { id: "auth-14442", status: "Aktif", customer: "100091428 - Kantor Kelurahan Umbul Harjo", username: "91428kelumbul@ring.net.id", connectivity: "Terhubung", pop: "HUNTAP PAGERJURANG", ip: "192.168.84.34", product: "BROADBAND FIBER SILVER 35" },
  { id: "auth-14441", status: "Aktif", customer: "100091427 - Ida Bagus Nugroho", username: "91427ida@ring.net.id", connectivity: "Terhubung", pop: "HUNTAP PAGERJURANG", ip: "192.168.84.33", product: "BROADBAND FIBER BRONZE 25" },
  { id: "auth-14440", status: "Aktif", customer: "100091426 - Danang/Sri Wahyuni Jetis", username: "91426danang@ring.net.id", connectivity: "Terhubung", pop: "HUNTAP PAGERJURANG", ip: "192.168.84.32", product: "BROADBAND FIBER SILVER 35" },
  { id: "auth-14439", status: "Aktif", customer: "100091425 - Dwi Santoso Huntap", username: "100091425santoso@ring.net.id", connectivity: "Terhubung", pop: "HUNTAP PAGERJURANG", ip: "192.168.85.13", product: "BROADBAND FIBER BRONZE 25" },
];

const profileGroups: RadiusRow[] = [
  { id: "profile-1", name: "Broadband UpTo 15Mbps", mikrotik: "rmnradius", speedLimit: "12000K/15000K", downloadLimit: "∞", uploadLimit: "∞", timeLimit: "∞" },
  { id: "profile-2", name: "Broadband UpTo 40Mbps", mikrotik: "rmnradius", speedLimit: "20000K/40000K", downloadLimit: "∞", uploadLimit: "∞", timeLimit: "∞" },
  { id: "profile-3", name: "Broadband LITE UpTo 10Mbps", mikrotik: "rmnradius", speedLimit: "10000K/10000K", downloadLimit: "∞", uploadLimit: "∞", timeLimit: "∞" },
  { id: "profile-4", name: "Broadband GOLD UpTo 50Mbps", mikrotik: "rmnradius", speedLimit: "40000K/50000K", downloadLimit: "∞", uploadLimit: "∞", timeLimit: "∞" },
  { id: "profile-5", name: "Broadband UpTo 20Mbps", mikrotik: "rmnradius", speedLimit: "10000K/20000K", downloadLimit: "∞", uploadLimit: "∞", timeLimit: "∞" },
  { id: "profile-6", name: "Broadband UpTo 5Mbps", mikrotik: "rmnradius", speedLimit: "5000K/5000K", downloadLimit: "∞", uploadLimit: "∞", timeLimit: "∞" },
  { id: "profile-7", name: "PAPRINGAN BROADBAND 7MB", mikrotik: "rmnradius", speedLimit: "7000K/7000K", downloadLimit: "∞", uploadLimit: "∞", timeLimit: "∞" },
  { id: "profile-8", name: "HUNTAP BROADBAND 5M", mikrotik: "rmnradius", speedLimit: "6000K/6000K", downloadLimit: "∞", uploadLimit: "∞", timeLimit: "∞" },
];

const sessions: RadiusRow[] = [
  { id: "81401493", status: "Online", name: "91138agusbayen@ring.net.id", profile: "Broadband BRONZE UpTo 25 Mbps", ip: "192.168.78.51", download: "1.08 GB", upload: "2.69 GB", nas: "RO.RINGNET-GPA", nasAddress: "103.162.62.30", nasPort: "vlan210-INET OLT", startedAt: "11 Mei 2026, 12:11" },
  { id: "8140148c", status: "Online", name: "100090782budi@ring.net.id", profile: "Broadband LITE UpTo 10Mbps", ip: "192.168.78.38", download: "629.7 MB", upload: "4.07 GB", nas: "RO.RINGNET-GPA", nasAddress: "103.162.62.30", nasPort: "vlan210-INET OLT", startedAt: "11 Mei 2026, 12:11" },
  { id: "814014c3", status: "Online", name: "mbaklia@ring.net.id", profile: "Broadband UpTo 100Mbps", ip: "192.168.78.251", download: "1.12 GB", upload: "1.46 GB", nas: "RO.RINGNET-GPA", nasAddress: "103.162.62.30", nasPort: "vlan210-INET OLT", startedAt: "22 Agustus 2025, 06:00" },
  { id: "8140149e", status: "Online", name: "10009049kostaka@ring.net.id", profile: "BROADBAND BUSINESS 100", ip: "192.168.78.47", download: "2.96 GB", upload: "347.13 MB", nas: "RO.RINGNET-GPA", nasAddress: "103.162.62.30", nasPort: "vlan210-INET OLT", startedAt: "11 Mei 2026, 12:11" },
  { id: "814013e9", status: "Online", name: "100090883budigts@ring.net.id", profile: "Broadband BRONZE UpTo 25 Mbps", ip: "192.168.78.44", download: "860.64 MB", upload: "92.68 MB", nas: "RO.RINGNET-GPA", nasAddress: "103.162.62.30", nasPort: "vlan210-INET OLT", startedAt: "11 Mei 2026, 12:11" },
  { id: "814014b8", status: "Online", name: "balairwgts@ring.net.id", profile: "Broadband LITE UpTo 10Mbps", ip: "192.168.78.31", download: "1.79 GB", upload: "1.92 GB", nas: "RO.RINGNET-GPA", nasAddress: "103.162.62.30", nasPort: "vlan210-INET OLT", startedAt: "11 Mei 2026, 12:11" },
];

const histories: RadiusRow[] = [
  { id: "history-1", topic: "AUTHENTICATION DISABLED", time: "11 Mei 2026, 12:11:36", message: "Authentication Status Is Not Active", customer: "100091085 - Pak Boim Banteng", authentication: "100091085boim@ring.net.id" },
  { id: "history-2", topic: "AUTHENTICATION DISABLED", time: "11 Mei 2026, 12:11:20", message: "Authentication Status Is Not Active", customer: "100091085 - Pak Boim Banteng", authentication: "100091085boim@ring.net.id" },
  { id: "history-3", topic: "CONNECTED", time: "11 Mei 2026, 12:10:45", message: "100090964pujiwidodo@Ring-Net.Id Connected", customer: "100090964 - Sih Puji Widodo", authentication: "100090964pujiwidodo@ring.net.id" },
  { id: "history-4", topic: "ALREADY ONLINE", time: "11 Mei 2026, 12:10:42", message: "Only 1 Active Session Is Allowed, Replace Active Session", customer: "100090964 - Sih Puji Widodo", authentication: "100090964pujiwidodo@ring.net.id" },
  { id: "history-5", topic: "AUTHENTICATION DISABLED", time: "11 Mei 2026, 12:10:33", message: "Authentication Status Is Not Active", customer: "100091085 - Pak Boim Banteng", authentication: "100091085boim@ring.net.id" },
  { id: "history-6", topic: "CONNECTED", time: "11 Mei 2026, 12:10:03", message: "91397kopigodean@Ring-Net.Id Connected", customer: "100091397 - Toleransi Kopi Godean", authentication: "91397kopigodean@ring.net.id" },
];

function RadiusStatus({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const className = normalized.includes("disabled")
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
      <StatCard icon={<Network size={21} />} label={label} value={active} trend="Data radius terpantau" accent="indigo" />
      <StatCard icon={<ShieldCheck size={21} />} label="Status Aktif" value={secondary} trend="Siap melayani autentikasi" accent="emerald" />
      <StatCard icon={<Activity size={21} />} label="Update Terakhir" value="Realtime" trend="Sinkronisasi operasional" accent="amber" />
    </div>
  );
}

export function RadiusNasRouterPage() {
  return (
    <>
      <PageHeader title="NAS / Router" subtitle="Kelola router NAS, alamat IP, port CoA, dan status perangkat Radius." />
      <RadiusSummary active={String(nasRouters.length)} secondary="8" label="Total NAS" />
      <DataTable
        title="Daftar NAS / Router"
        data={nasRouters}
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
  return (
    <>
      <PageHeader title="Autentikasi Radius" subtitle="Pantau akun pelanggan, konektivitas, POP, alamat IP, dan produk terkait." />
      <RadiusSummary active={String(authentications.length)} secondary="8" label="Total Autentikasi" />
      <DataTable
        title="Daftar Autentikasi"
        data={authentications}
        searchPlaceholder="Cari pelanggan, username, POP..."
        columns={[
          { key: "status", header: "Status", render: (row) => <RadiusStatus value={row.status} /> },
          { key: "id", header: "ID", render: (row) => <span className="font-semibold text-indigo-600">{row.id.replace("auth-", "")}</span> },
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
  return (
    <>
      <PageHeader title="Grup Profil" subtitle="Kelola profil bandwidth, batas kecepatan, kuota, dan batas waktu Radius." />
      <RadiusSummary active={String(profileGroups.length)} secondary="8" label="Total Profil" />
      <DataTable
        title="Daftar Grup Profil"
        data={profileGroups}
        searchPlaceholder="Cari nama profil, mikrotik, batas..."
        columns={[
          { key: "name", header: "Nama", render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
          { key: "mikrotik", header: "Mikrotik Profil" },
          { key: "speedLimit", header: "Batas Kecepatan", render: (row) => <span className="rounded-md bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-700 ring-1 ring-cyan-200">{row.speedLimit}</span> },
          { key: "downloadLimit", header: "Batas Unduh" },
          { key: "uploadLimit", header: "Batas Unggah" },
          { key: "timeLimit", header: "Batas Waktu" },
        ]}
      />
    </>
  );
}

export function RadiusUserSessionPage() {
  return (
    <>
      <PageHeader title="Sesi Pengguna" subtitle="Pantau sesi online pelanggan, trafik, NAS, port, dan waktu mulai koneksi." />
      <RadiusSummary active={String(sessions.length)} secondary="6" label="Sesi Online" />
      <DataTable
        title="Daftar Sesi Pengguna"
        data={sessions}
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
  return (
    <>
      <PageHeader title="Riwayat Radius" subtitle="Lihat log autentikasi, koneksi, dan kejadian Radius pelanggan." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard icon={<Clock3 size={21} />} label="Retensi Riwayat" value="30 hari" trend="Log lama dibersihkan otomatis" accent="indigo" />
        <StatCard icon={<DatabaseZap size={21} />} label="Total Log" value={String(histories.length)} trend="Data contoh operasional" accent="emerald" />
        <StatCard icon={<Wifi size={21} />} label="Status Monitor" value="Aktif" trend="Siap menerima event Radius" accent="amber" />
      </div>
      <Card className="mb-4 border-cyan-100 bg-cyan-50 px-4 py-3 text-center text-sm font-medium text-cyan-800">
        Riwayat akan terhapus otomatis setelah 30 hari
      </Card>
      <DataTable
        title="Daftar Riwayat"
        data={histories}
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
