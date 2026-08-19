"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

import api from "@/lib/api";
import { Badge, Card, DataTable, PageHeader, SelectInput, TableSkeleton, TextArea, TextInput } from "@/components/ui/AdminUI";
import CoordinatePicker from "@/components/ui/CoordinatePicker";
import { MapPin, Network, Router, FileText, Eye, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    setToast("");

    // Call DEKASIMAL API POST /api/v1/location-point/list with columnFilters
    api.post("/location-point/list", {
      pageSize: 500,
      pageIndex: 0,
      sorting: [],
      columnFilters: [{ id: "type", value: "pop" }],
      globalFilter: "",
    })
      .then((res) => {
        const raw = res.data?.data?.data || res.data?.data || res.data?.rows || (Array.isArray(res.data) ? res.data : []);
        const normalized = raw.map((item: any) => ({
          id: item.maps_id || item._id || item.id,
          popCode: item.maps_id || item.code || item.popCode || "-",
          name: item.name || item.title || "-",
          area: item.group || item.area || "-",
          city: item.location?.city || item.city || item.address || "-",
          coordinate: item.coordinate || (item.location?.coordinates ? `${item.location.coordinates[1]}, ${item.location.coordinates[0]}` : "-"),
          picName: item.picName || item.pic_name || item.pic?.name || "-",
          picPhone: item.picPhone || item.pic_phone || item.pic_contact || item.pic?.phone || "-",
          status: item.status || "active",
        }));
        setRows(normalized);
      })
      .catch(() => {
        // Fallback to legacy GET /pops
        api.get("/pops")
          .then((res) => setRows(res.data?.data || []))
          .catch(() => {
            setRows([]);
            setToast("Gagal memuat data POP dari server.");
          });
      })
      .finally(() => setLoading(false));
  }, []);


  async function remove(row: any) {
    try {
      try {
        await api.delete(`/location-point/delete/${row.id}`);
      } catch {
        await api.delete(`/pops/${row.id}`);
      }
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
            { key: "popCode", header: "ID POP", render: (row: any) => <Link href={`/users/pop/${row.id}/edit`} className="font-semibold text-indigo-600 hover:underline">{row.popCode || "-"}</Link> },
            { key: "area", header: "Area / Wilayah", render: (row: any) => row.area || "-" },
            { key: "city", header: "Kota", render: (row: any) => row.city || "-" },
            { key: "coordinate", header: "Koordinat", render: (row: any) => row.coordinate || "-" },
            { key: "picName", header: "PIC", render: (row: any) => row.picName || "-" },
            { key: "picPhone", header: "No PIC", render: (row: any) => row.picPhone || "-" },
            { key: "status", header: "Status", render: (row: any) => <Badge value={row.status || "active"} /> },
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
    popCode: "", name: "", area: "", city: "", address: "", coordinate: "", status: "active", notes: "",
    picName: "", picPhone: ""
  });
  const [files, setFiles] = useState<Record<string, File | null>>({
    picKtp: null, locationPermit: null, leaseAgreement: null, locationPhoto: null, contract: null
  });
  const [existingFiles, setExistingFiles] = useState<Record<string, string | null>>({
    picKtp: null, locationPermit: null, leaseAgreement: null, locationPhoto: null, contract: null
  });

  useEffect(() => {
    if (!edit || !id) return;
    
    // Try DEKASIMAL API GET /location-point/report/{mapsId} or GET /location-point/{id}
    api.get("/location-point/report/" + id)
      .then((res) => {
        const data = res.data?.data?.node || res.data?.data || {};
        setForm({
          popCode: data.maps_id || data.code || "",
          name: data.name || "",
          area: data.group || data.area || "",
          city: data.location?.city || data.city || "",
          address: data.address || "",
          coordinate: data.coordinate || "",
          status: data.status || "active",
          notes: data.notes || "",
          picName: data.picName || data.pic_name || data.pic?.name || "",
          picPhone: data.picPhone || data.pic_phone || data.pic_contact || data.pic?.phone || "",
        });
      })
      .catch(() => {
        api.get("/pops/" + id)
          .then((res) => {
            const data = res.data?.data || {};
            setForm({
              popCode: data.popCode || "", name: data.name || "", area: data.area || "", city: data.city || "",
              address: data.address || "", coordinate: data.coordinate || "", status: data.status || "active", notes: data.notes || "",
              picName: data.picName || data.pic_name || data.pic?.name || "", picPhone: data.picPhone || data.pic_phone || data.pic_contact || data.pic?.phone || ""
            });
            setExistingFiles({
              picKtp: data.picKtp || null,
              locationPermit: data.locationPermit || null,
              leaseAgreement: data.leaseAgreement || null,
              locationPhoto: data.locationPhoto || null,
              contract: data.contract || null,
            });
          })
          .catch(() => setError("Gagal memuat data POP."));
      });
  }, [edit, id]);

  async function submit() {
    setError("");

    const dekadataPayload = {
      name: form.name,
      type: "pop",
      group: form.area || "backbone",
      coordinate: form.coordinate || "-6.200000, 106.816666",
      status: form.status,
      address: form.address,
      notes: form.notes,
      pic_name: form.picName,
      pic_phone: form.picPhone,
    };

    try {
      if (edit && id) {
        try {
          await api.put(`/location-point/update/${id}`, dekadataPayload);
        } catch {
          const body = new FormData();
          Object.entries(form).forEach(([k, v]) => body.append(k, v as string));
          Object.entries(files).forEach(([k, v]) => { if (v) body.append(k, v); });
          await api.put("/pops/" + id, body);
        }
      } else {
        try {
          await api.post("/location-point/create", dekadataPayload);
        } catch {
          const body = new FormData();
          Object.entries(form).forEach(([k, v]) => body.append(k, v as string));
          Object.entries(files).forEach(([k, v]) => { if (v) body.append(k, v); });
          await api.post("/pops", body);
        }
      }
      router.push("/users/pop");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan POP.");
    }
  }


  const handleFile = (key: string) => (file: File | null) => {
    setFiles({ ...files, [key]: file });
  };

  const [previewOpen, setPreviewOpen] = useState<Record<string, boolean>>({});

  return (
    <div>
      <PageHeader title={edit ? "Data PIC" : "Tambah POP"} subtitle="Lengkapi data wilayah POP, alamat, koordinat, status jaringan, serta kelengkapan dokumen." />
      <Card className="p-6">
        {error ? <div className="mb-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
        <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <TextInput label="ID POP" value={form.popCode} onChange={(e) => setForm({ ...form, popCode: e.target.value })} placeholder="POP-001" />
            <TextInput label="Nama POP (Internal)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="POP Papringan" required />
            
            <TextInput label="Nama" value={form.picName} onChange={(e) => setForm({ ...form, picName: e.target.value })} placeholder="Nama penanggung jawab" />
            <TextInput label="No Telepon" value={form.picPhone} onChange={(e) => setForm({ ...form, picPhone: e.target.value })} placeholder="081234567890" />
            
            <div className="lg:col-span-2 grid gap-5 md:grid-cols-2 rounded-lg border border-slate-100 bg-slate-50 p-5">
              {[
                { key: 'picKtp', label: 'KTP', accept: '*/*' },
                { key: 'locationPermit', label: 'Ijin Lokasi', accept: '*/*' },
                { key: 'leaseAgreement', label: 'Perjanjian Sewa Menyewa', accept: '*/*' },
                { key: 'locationPhoto', label: 'Foto Lokasi', accept: 'image/*' },
                { key: 'contract', label: 'Kontrak', accept: '*/*' },
              ].map((f) => {
                const existingUrl = existingFiles[f.key];
                return (
                  <div key={f.key} className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">{f.label}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="file"
                          onChange={(e) => handleFile(f.key)(e.target.files?.[0] || null)}
                          className="block w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                          accept={f.accept}
                        />
                      </div>
                      {existingUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewOpen({ ...previewOpen, [f.key]: !previewOpen[f.key] })}
                          className={`inline-flex h-[42px] shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-bold shadow-sm transition ${previewOpen[f.key] ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200' : 'border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <FileText size={16} /> {previewOpen[f.key] ? "Tutup Preview" : "Lihat Dokumen"}
                        </button>
                      ) : null}
                    </div>
                    {existingUrl && previewOpen[f.key] ? (() => {
                      const fileUrl = `${process.env.NEXT_PUBLIC_API?.replace('/api', '')}${existingUrl}`;
                      const isImage = fileUrl.toLowerCase().match(/\.(jpeg|jpg|png)$/);
                      return (
                        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <Eye size={16} className="text-slate-400" />
                              Preview Dokumen
                            </div>
                            <div className="flex gap-2">
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                              >
                                <Eye size={14} /> Buka Tab
                              </a>
                              <a
                                href={fileUrl}
                                download
                                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-600"
                              >
                                <Download size={14} /> Download
                              </a>
                            </div>
                          </div>
                          <div className="bg-slate-100 p-1">
                            {isImage ? (
                              <div className="flex min-h-[300px] items-center justify-center rounded-lg bg-white p-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={fileUrl} alt={f.label} className="max-h-[500px] max-w-full rounded-md object-contain shadow-sm border border-slate-100" />
                              </div>
                            ) : (
                              <iframe
                                src={fileUrl + "#toolbar=1&navpanes=0"}
                                title={"Preview: " + f.label}
                                className="h-[400px] w-full rounded-lg border-0 bg-white"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })() : null}
                  </div>
                );
              })}
            </div>

            <TextInput label="Area / Wilayah" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Papringan" />
            <TextInput label="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Sleman" />
            


            <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ label: "Aktif", value: "active" }, { label: "Nonaktif", value: "nonactive" }, { label: "Maintenance", value: "maintenance" }]} />
            <div className="lg:col-span-2">
              <TextInput label="Alamat POP" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lokasi POP" />
            </div>
            <div className="lg:col-span-2">
              <TextArea label="Catatan Tambahan (Opsional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Informasi tambahan terkait POP" />
            </div>

            <div className="lg:col-span-2 mt-4">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Koordinat Lokasi</span>
              <div className="mb-4">
                <input value={form.coordinate} onChange={(e) => setForm({ ...form, coordinate: e.target.value })} placeholder="-7.77720164, 110.3977788" className="h-11 w-full md:w-1/2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div className="w-full md:w-[500px] overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <CoordinatePicker
                  inline
                  hideSearch={true}
                  readonly={true}
                  value={form.coordinate}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Peta di atas hanya untuk pratinjau lokasi berdasarkan koordinat.</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <button type="button" onClick={() => router.push("/users/pop")} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Batal</button>
            <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Simpan POP</button>
          </div>
        </form>
      </Card>
      
    </div>
  );
}
