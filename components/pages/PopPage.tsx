"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import api from "@/lib/api";
import { Badge, Card, DataTable, PageHeader, SelectInput, TableSkeleton, TextArea, TextInput } from "@/components/ui/AdminUI";
import { date } from "@/lib/format";
import { MapPin, Network, Router } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">{message}</div>;
}

export default function PopPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((item) => item.status === "active").length,
    cities: new Set(rows.map((item) => item.city).filter(Boolean)).size,
  }), [rows]);

  useEffect(() => {
    setLoading(true);
    api.get("/pops?limit=500")
      .then((res) => setRows(res.data.data || []))
      .catch(() => {
        setRows([]);
        setToast("Gagal memuat data POP. Pastikan backend aktif dan sesi login valid.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function remove(row: any) {
    try {
      await api.delete("/pops/" + row.id);
      setRows((current) => current.filter((item) => item.id !== row.id));
      setToast("POP berhasil dihapus.");
    } catch (err: any) {
      setToast(err.response?.data?.message || "Gagal menghapus POP.");
    }
  }

  return (
    <div>
      <PageHeader title="POP" subtitle="Kelola wilayah Point of Presence, area layanan, koordinat, dan status jaringan." actionHref="/users/pop/new" actionLabel="Tambah POP" />
      <Toast message={toast} />
      {loading ? null : (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <Network className="text-indigo-500" size={24} />
            <p className="mt-3 text-xs font-bold uppercase text-slate-400">Total POP</p>
            <p className="text-2xl font-black text-slate-950">{stats.total}</p>
          </Card>
          <Card className="p-5">
            <Router className="text-emerald-500" size={24} />
            <p className="mt-3 text-xs font-bold uppercase text-slate-400">POP Aktif</p>
            <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
          </Card>
          <Card className="p-5">
            <MapPin className="text-amber-500" size={24} />
            <p className="mt-3 text-xs font-bold uppercase text-slate-400">Kota Tercover</p>
            <p className="text-2xl font-black text-slate-950">{stats.cities}</p>
          </Card>
        </div>
      )}
      {loading ? <TableSkeleton columns={8} /> : (
        <DataTable
          data={rows}
          editBasePath="/users/pop"
          onDelete={remove}
          columns={[
            { key: "popCode", header: "ID POP", render: (row: any) => <span className="font-semibold text-indigo-600">{row.popCode || "-"}</span> },
            { key: "name", header: "Nama POP", render: (row: any) => <span className="font-semibold text-slate-900">{row.name}</span> },
            { key: "area", header: "Area / Wilayah", render: (row: any) => row.area || "-" },
            { key: "city", header: "Kota", render: (row: any) => row.city || "-" },
            { key: "coordinate", header: "Koordinat", render: (row: any) => row.coordinate || "-" },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status || "active"} /> },
            { key: "createdAt", header: "Dibuat", render: (row: any) => date(row.createdAt) },
          ]}
        />
      )}
    </div>
  );
}

export function PopFormPage({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    popCode: "",
    name: "",
    area: "",
    city: "",
    address: "",
    coordinate: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/pops/" + id)
      .then((res) => {
        const data = res.data.data;
        setForm({
          popCode: data.popCode || "",
          name: data.name || "",
          area: data.area || "",
          city: data.city || "",
          address: data.address || "",
          coordinate: data.coordinate || "",
          status: data.status || "active",
          notes: data.notes || "",
        });
      })
      .catch(() => setError("Gagal memuat data POP."));
  }, [edit, id]);

  async function submit() {
    setError("");
    try {
      if (edit) await api.put("/pops/" + id, form);
      else await api.post("/pops", form);
      router.push("/users/pop");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan POP.");
    }
  }

  return (
    <div>
      <PageHeader title={(edit ? "Edit" : "Tambah") + " POP"} subtitle="Lengkapi data wilayah POP, alamat, koordinat, dan status jaringan." />
      <Card className="p-6">
        {error ? <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <TextInput label="ID POP" value={form.popCode} onChange={(e) => setForm({ ...form, popCode: e.target.value })} placeholder="POP-001" />
            <TextInput label="Nama POP" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="POP Papringan" required />
            <TextInput label="Area / Wilayah" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Papringan" />
            <TextInput label="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Sleman" />
            <TextInput label="Koordinat" value={form.coordinate} onChange={(e) => setForm({ ...form, coordinate: e.target.value })} placeholder="-7.77720164, 110.3977788" />
            <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ label: "Aktif", value: "active" }, { label: "Nonaktif", value: "nonactive" }, { label: "Maintenance", value: "maintenance" }]} />
            <div className="lg:col-span-2">
              <TextInput label="Alamat POP" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lokasi POP" />
            </div>
            <div className="lg:col-span-2">
              <TextArea label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan perangkat, coverage, atau informasi operasional POP" />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => router.push("/users/pop")} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Batal</button>
            <button className="h-10 rounded-lg bg-[#6366F1] px-5 text-sm font-semibold text-white shadow-sm shadow-indigo-200">Simpan</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
