"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { date } from "@/lib/format";
import { Card, ShimmerBlock, TextInput } from "@/components/ui/AdminUI";
import { formatErrorMessage } from "@/lib/error";
import { mitraPortalService } from "@/services";
import { Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const API_ORIGIN = (process.env.NEXT_PUBLIC_API || "").replace(/\/api\/?$/, "");
const fileUrl = (path?: string) => (path ? `${API_ORIGIN}${path}` : "#");

const docCategory: Record<string, string> = {
  pic: "pic-mitra",
  ktp: "ktp-mitra",
  npwp: "npwp-mitra",
  nib: "nib-mitra",
  sertifikat: "sertifikat-mitra",
  pks: "pks-mitra",
};

const docLabels: Record<string, string> = {
  pic: "Data PIC Mitra",
  ktp: "Data KTP",
  npwp: "Data NPWP",
  nib: "Data NIB",
  sertifikat: "Data Sertifikat Standar",
  pks: "Data PKS Jasa Jual Kembali",
};

function Info({ rows }: { rows: any[][] }) {
  return (
    <div className="mt-4 space-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-slate-100 pb-2 text-sm">
          <span className="text-slate-500">{label}</span>
          <strong className="text-right text-slate-900">{value || "-"}</strong>
        </div>
      ))}
    </div>
  );
}

export function MitraProfilePage({ settings = false }: { settings?: boolean }) {
  const [form, setForm] = useState<any>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState<File | null>(null);

  useEffect(() => {
    mitraPortalService
      .getProfile()
      .then((r) => setForm(r))
      .catch((e) => setError(formatErrorMessage(e, "Gagal memuat profil mitra.")));
  }, []);

  if (!form) {
    return error ? (
      <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>
    ) : (
      <ShimmerBlock className="h-96" />
    );
  }

  if (!settings) {
    return (
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Identitas Mitra</h2>
          <Info
            rows={[
              ["ID Mitra", form.partnerCode],
              ["Nama", form.name],
              ["Perusahaan", form.companyName],
              ["Email akun", form.user?.email],
              ["Status", form.status],
              ["Area", form.area],
              ["Kota", form.city],
            ]}
          />
        </Card>
        <Card className="p-5">
          <h2 className="font-black text-slate-950">Perjanjian Kerja Sama</h2>
          <Info
            rows={[
              ["Nomor PKS", form.agreementNumber],
              ["Mulai", date(form.agreementStart)],
              ["Berakhir", date(form.agreementEnd)],
              ["Bagi hasil", `${Number(form.profitSharePercent || 0)}%`],
            ]}
          />
        </Card>
      </div>
    );
  }

  const groups = [
    {
      title: "Data PIC",
      fields: [
        ["picName", "Nama PIC"],
        ["nik", "NIK"],
        ["occupation", "Jabatan"],
        ["picPhone", "Nomor Telepon PIC"],
        ["email", "Email PIC"],
        ["address", "Alamat PIC"],
      ],
    },
    {
      title: "Data Perusahaan",
      fields: [
        ["companyName", "Nama Perusahaan"],
        ["companyAddress", "Alamat Perusahaan"],
        ["companyPhone", "Telepon Perusahaan"],
        ["companyEmail", "Email Perusahaan"],
        ["npwpNumber", "NPWP"],
        ["nibNumber", "NIB"],
      ],
    },
    {
      title: "Data Rekening",
      fields: [
        ["bankName", "Nama Bank"],
        ["bankAccountNo", "Nomor Rekening"],
        ["bankAccountHolder", "Nama Pemilik Rekening"],
      ],
    },
  ];

  async function save(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const updated = await mitraPortalService.updateProfile(form);
      setForm({ ...form, ...updated });
      setMessage("Profil berhasil diperbarui.");
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal memperbarui profil."));
    }
  }

  async function uploadSignature() {
    if (!signature) return setError("Pilih gambar paraf terlebih dahulu.");
    setError("");
    setMessage("");
    try {
      const r = await mitraPortalService.uploadSignature(signature);
      setForm({ ...form, signaturePath: r?.signaturePath });
      setMessage("Paraf digital berhasil diperbarui.");
    } catch (err: any) {
      setError(formatErrorMessage(err, "Gagal mengunggah paraf."));
    }
  }

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
      {message ? <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</div> : null}

      <form onSubmit={save} className="space-y-6">
        {groups.map((group) => (
          <Card key={group.title} className="p-5">
            <h2 className="mb-4 font-black text-slate-950">{group.title}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {group.fields.map(([key, label]) => (
                <TextInput
                  key={key}
                  label={label}
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              ))}
            </div>
          </Card>
        ))}
        <div className="flex justify-end">
          <button type="submit" className="h-10 rounded-lg bg-indigo-600 px-5 text-sm font-bold text-white transition hover:bg-indigo-500">
            Simpan Pengaturan
          </button>
        </div>
      </form>

      <Card className="p-5">
        <h2 className="font-black text-slate-950">Manajemen Dokumen</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(docCategory).map((key) => (
            <Link
              key={key}
              href={`/mitra/${key}`}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-indigo-600 hover:bg-indigo-50"
            >
              {docLabels[key] || key}
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-black text-slate-950">Paraf Digital</h2>
        <p className="mt-1 text-sm text-slate-500">Gunakan gambar PNG transparan.</p>
        {form.signaturePath ? (
          <div className="relative my-4 h-24 w-64">
            <Image
              src={fileUrl(form.signaturePath)}
              alt="Paraf digital"
              fill
              unoptimized
              className="object-contain object-left"
            />
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/png"
            onChange={(e) => setSignature(e.target.files?.[0] || null)}
            className="rounded-lg border border-slate-200 bg-white p-2 text-sm"
          />
          <button
            type="button"
            onClick={uploadSignature}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-bold text-white transition hover:bg-indigo-500"
          >
            <Upload size={16} /> Unggah Paraf
          </button>
        </div>
      </Card>
    </div>
  );
}
export default MitraProfilePage;
