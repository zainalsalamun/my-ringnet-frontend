"use client";

import { Badge, Card, ShimmerBlock } from "@/components/ui/AdminUI";
import InfrastructureMap from "@/components/ui/InfrastructureMap";
import { formatErrorMessage } from "@/lib/error";
import { technicalService, TechnicalItem } from "@/services";
import { Cable, RadioTower, Router, Server } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function MitraTechnicalPage({ section }: { section: string }) {
  const [rows, setRows] = useState<TechnicalItem[] | null>(null);
  const [error, setError] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    technicalService
      .getTechnicalData()
      .then((data) => setRows(data))
      .catch((err) => {
        setRows([]);
        setError(formatErrorMessage(err, "Gagal memuat data teknis dari API location-point."));
      });
  }, []);

  const filtered = useMemo(() => {
    const all = rows || [];
    const aliases: Record<string, string[]> = {
      router: ["router"],
      switch: ["switch"],
      olt: ["olt"],
      cpe: ["olt"],
      otb: ["otb"],
      odc: ["odc"],
      odp: ["odp"],
      kabel: ["kabel"],
      sla: ["sla"],
    };
    return all.filter(
      (row) =>
        section === "infrastruktur" ||
        (section === "perangkat-aktif" && row.category === "active") ||
        (section === "perangkat-pasif" && row.category === "passive") ||
        aliases[section]?.includes(row.typeKey)
    );
  }, [rows, section]);

  const counts = useMemo(() => {
    const source = section === "infrastruktur" ? rows || [] : filtered;
    return {
      total: source.length,
      active: source.filter((row) => row.category === "active").length,
      passive: source.filter((row) => row.category === "passive").length,
      mapped: source.filter((row) => row.coordinate && row.coordinate !== "-").length,
    };
  }, [filtered, rows, section]);

  const mapPoints = filtered.filter((row) => row.coordinate && row.coordinate !== "-");
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(pageIndex, totalPages - 1);
  const paginatedRows = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      {rows === null ? (
        <ShimmerBlock className="h-72" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Total Data", value: counts.total, icon: <Server size={20} />, color: "bg-indigo-500" },
              { label: "Perangkat Aktif", value: counts.active, icon: <Router size={20} />, color: "bg-emerald-500" },
              { label: "Perangkat Pasif", value: counts.passive, icon: <Cable size={20} />, color: "bg-amber-500" },
            ].map((item) => (
              <Card key={item.label} className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl text-white ${item.color}`}>{item.icon}</div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-950">{item.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {section === "infrastruktur" ? <InfrastructureMap points={mapPoints} /> : null}

          <Card className="p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-black text-slate-950">Daftar Data Teknis</h2>
                <p className="text-sm text-slate-500">{counts.mapped} data memiliki koordinat.</p>
              </div>
            </div>
            {!paginatedRows.length ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
                Belum ada data teknis untuk kategori ini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-bold">Jenis</th>
                      <th className="px-4 py-3 font-bold">Nama</th>
                      <th className="px-4 py-3 font-bold">Kode / Serial</th>
                      <th className="px-4 py-3 font-bold">IP</th>
                      <th className="px-4 py-3 font-bold">Lokasi</th>
                      <th className="px-4 py-3 font-bold">Koordinat</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedRows.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-black uppercase text-indigo-700">
                            {r.category === "passive" ? (
                              <Cable size={13} />
                            ) : r.category === "active" ? (
                              <Router size={13} />
                            ) : (
                              <RadioTower size={13} />
                            )}
                            {r.assetType}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">{r.name}</td>
                        <td className="px-4 py-3 text-slate-600">{r.serialNo || "-"}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.ipAddress || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{r.location || "-"}</td>
                        <td className="px-4 py-3 text-slate-600">{r.coordinate || "-"}</td>
                        <td className="px-4 py-3">
                          <Badge value={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > pageSize ? (
              <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold text-slate-500">
                  Menampilkan {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, filtered.length)} dari {filtered.length} data
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 0}
                    onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span className="rounded-lg bg-slate-50 px-3 py-1.5 font-black text-slate-700">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setPageIndex((value) => Math.min(totalPages - 1, value + 1))}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            ) : null}
          </Card>
        </>
      )}
    </div>
  );
}
export default MitraTechnicalPage;
