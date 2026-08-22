"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import { SelectInput } from "@/components/ui/AdminUI";
import { mitraPortalApi } from "@/src/features/mitra-portal/api";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, FileCheck2, Handshake, Info, ShieldCheck, Upload, UserRoundPlus } from "lucide-react";
import { FormEvent, ReactNode, useMemo, useState } from "react";

const statementGroups = [
  {
    title: "Komitmen Calon Mitra",
    tone: "bg-sky-50 text-sky-800 border-sky-200",
    items: [
      "Saya akan mematuhi regulasi telekomunikasi yang berlaku dan ketentuan layanan MyRingNet.",
      "Saya bersedia mengikuti proses verifikasi kelayakan sebelum akun diaktifkan.",
      "Saya akan menjaga kualitas pelayanan dan kerahasiaan data pelanggan.",
    ],
  },
  {
    title: "Kelengkapan dan Legalitas",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
    items: [
      "Data identitas dan dokumen usaha yang saya kirimkan adalah benar dan masih berlaku.",
      "Saya memiliki KTP, NPWP, NIB, dan Sertifikat Standar untuk proses pemeriksaan.",
      "Saya bersedia memperbarui dokumen apabila terdapat perubahan atau masa berlaku berakhir.",
    ],
  },
  {
    title: "Kesepakatan Kerja Sama",
    tone: "bg-rose-50 text-rose-800 border-rose-200",
    items: [
      "Saya akan menggunakan merek, produk, dan harga sesuai pedoman kerja sama yang disetujui.",
      "Saya bersedia melakukan pencatatan pelanggan dan rekonsiliasi pendapatan secara transparan.",
      "Saya tidak akan membuat jaringan penjualan berjenjang tanpa persetujuan tertulis MyRingNet.",
      "Saya menyetujui pemrosesan data pengajuan ini untuk keperluan verifikasi Mitra.",
    ],
  },
];

const statements = statementGroups.flatMap((group) => group.items);
const inputClass = "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

function Field({ label, children, required = false }: { label: string; children: ReactNode; required?: boolean }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}{required ? <b className="ml-1 text-rose-500">*</b> : null}</span>{children}</label>;
}

export default function RegisterMitraPage() {
  const [step, setStep] = useState(1);
  const [accepted, setAccepted] = useState<boolean[]>(() => statements.map(() => false));
  const [form, setForm] = useState({ partnerType: "reseller", name: "", email: "", phone: "", nik: "", occupation: "", address: "", area: "", city: "", picName: "", picPhone: "", companyName: "", companyAddress: "", companyPhone: "", companyEmail: "", npwpNumber: "", nibNumber: "", certificateNumber: "", password: "", passwordConfirmation: "" });
  const [files, setFiles] = useState<Record<string, File | null>>({ ktp: null, npwp: null, nib: null, certificate: null, signature: null });
  const [finalConsent, setFinalConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const allAccepted = accepted.every(Boolean);
  const progress = useMemo(() => `${Math.round(step / 3 * 100)}%`, [step]);

  function update(key: string, value: string) { setForm((current) => ({ ...current, [key]: value })); }
  function nextFromProfile(event: FormEvent) {
    event.preventDefault();
    const required = ["name", "email", "phone", "nik", "address", "companyName", "companyAddress", "password", "passwordConfirmation"];
    if (required.some((key) => !form[key as keyof typeof form].trim())) return setError("Lengkapi seluruh data yang bertanda wajib.");
    if (form.password.length < 8) return setError("Password minimal 8 karakter.");
    if (form.password !== form.passwordConfirmation) return setError("Konfirmasi password tidak sesuai.");
    setError(""); setStep(3);
  }
  async function submit() {
    if (!Object.values(files).every(Boolean)) return setError("KTP, NPWP, NIB, Sertifikat Standar, dan paraf digital wajib diunggah.");
    if (!finalConsent) return setError("Centang persetujuan akhir sebelum mengirim pengajuan.");
    setLoading(true); setError("");
    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    Object.entries(files).forEach(([key, value]) => { if (value) body.append(key, value); });
    body.append("acceptedStatements", "true");
    try { const response = await mitraPortalApi.register(body); setResult(response.data.data); }
    catch (err: any) { setError(err.response?.data?.message || "Pengajuan gagal dikirim. Silakan coba kembali."); }
    finally { setLoading(false); }
  }

  if (result) return <main className="grid min-h-screen place-items-center bg-slate-950 p-6"><div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-2xl"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 size={34} /></span><h1 className="mt-5 text-2xl font-black text-slate-950">Pengajuan Berhasil Dikirim</h1><p className="mt-3 text-sm leading-6 text-slate-600">Tim MyRingNet akan memeriksa identitas dan dokumen Anda. Akun baru dapat digunakan setelah disetujui administrator.</p><div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-sm"><p><span className="text-slate-500">Kode pengajuan:</span> <strong>{result.partnerCode}</strong></p><p className="mt-2"><span className="text-slate-500">Status:</span> <strong className="uppercase text-amber-600">Menunggu verifikasi</strong></p></div><Link href="/" className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-bold text-white">Kembali ke Login</Link></div></main>;

  return <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-5 py-8">
    <div className="mx-auto max-w-6xl">
      <header className="flex items-center justify-between text-white"><div><h1 className="text-2xl font-black">My<span className="text-indigo-300">Ring</span>Net</h1><p className="text-xs text-indigo-200">Program Reseller & Mitra</p></div><Link href="/" className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold hover:bg-white/10"><ArrowLeft size={16} /> Kembali ke Login</Link></header>
      <section className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="pt-5 text-white"><span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-400/10 px-3 py-1 text-xs font-bold text-indigo-200"><Handshake size={14} /> Peluang Kemitraan MyRingNet</span><h2 className="mt-5 text-4xl font-black leading-tight">Tumbuh bersama melalui layanan internet yang terpercaya.</h2><p className="mt-5 text-base leading-8 text-slate-300">Program ini membantu pelaku usaha lokal memasarkan layanan MyRingNet dengan dukungan produk, operasional, pencatatan, dan kanal bantuan yang terintegrasi.</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{[[ShieldCheck, "Proses terverifikasi", "Identitas dan legalitas diperiksa sebelum aktivasi."], [Building2, "Dukungan operasional", "Produk, tiket, pembukuan, dan perangkat dalam satu portal."], [UserRoundPlus, "Pendaftaran mandiri", "Ajukan akun reseller tanpa harus dibuatkan oleh admin."]].map(([Icon, title, text]: any) => <div key={title} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4"><Icon className="shrink-0 text-indigo-300" size={22} /><div><strong>{title}</strong><p className="mt-1 text-xs leading-5 text-slate-400">{text}</p></div></div>)}</div></div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-950 to-indigo-800 px-6 py-5 text-white"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Langkah {step} dari 3</p><h2 className="mt-1 text-xl font-black">{step === 1 ? "Pernyataan Calon Mitra" : step === 2 ? "Data Reseller / Mitra" : "Dokumen & Paraf Digital"}</h2></div><FileCheck2 size={30} className="text-white/40" /></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-indigo-300 transition-all" style={{ width: progress }} /></div></div>
          {error ? <div className="mx-6 mt-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
          {step === 1 ? <div><div className="m-6 flex gap-3 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"><Info size={19} className="mt-0.5 shrink-0" /> Baca setiap pernyataan berikut. Anda dapat melanjutkan setelah seluruh poin disetujui.</div><div className="max-h-[560px] overflow-y-auto px-6 pb-4">{statementGroups.map((group) => { const before = statementGroups.slice(0, statementGroups.indexOf(group)).reduce((sum, item) => sum + item.items.length, 0); return <div key={group.title} className="mb-5"><h3 className={`border px-4 py-3 text-xs font-black uppercase tracking-wider ${group.tone}`}>{group.title}</h3>{group.items.map((item, itemIndex) => { const index = before + itemIndex; return <label key={item} className="flex cursor-pointer items-start justify-between gap-5 border-b border-slate-100 px-4 py-4 text-sm leading-6 text-slate-700 hover:bg-slate-50"><span>{item}</span><input type="checkbox" checked={accepted[index]} onChange={(event) => setAccepted((current) => current.map((value, i) => i === index ? event.target.checked : value))} className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-indigo-600" /></label>; })}</div>; })}</div><div className="flex justify-end border-t border-slate-200 bg-slate-50 p-5"><button disabled={!allAccepted} onClick={() => setStep(2)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-bold text-white disabled:bg-slate-300">Lanjut <ArrowRight size={17} /></button></div></div> : null}
          {step === 2 ? <form onSubmit={nextFromProfile}><div className="grid max-h-[650px] gap-4 overflow-y-auto p-6 md:grid-cols-2"><SelectInput label="Jenis Kemitraan *" value={form.partnerType} onChange={(e: any) => update("partnerType", e.target.value)} options={[{ label: "Reseller", value: "reseller" }, { label: "Mitra", value: "mitra" }]} /><Field required label="Nama Lengkap"><input className={inputClass} value={form.name} onChange={(e) => update("name", e.target.value)} /></Field><Field required label="Email Login"><input type="email" className={inputClass} value={form.email} onChange={(e) => update("email", e.target.value)} /></Field><Field required label="Nomor Telepon"><input className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} /></Field><Field required label="NIK"><input className={inputClass} value={form.nik} onChange={(e) => update("nik", e.target.value)} /></Field><Field label="Jabatan"><input className={inputClass} value={form.occupation} onChange={(e) => update("occupation", e.target.value)} /></Field><Field label="Nama PIC"><input className={inputClass} value={form.picName} onChange={(e) => update("picName", e.target.value)} /></Field><Field required label="Nama Usaha / Perusahaan"><input className={inputClass} value={form.companyName} onChange={(e) => update("companyName", e.target.value)} /></Field><Field label="Telepon Usaha"><input className={inputClass} value={form.companyPhone} onChange={(e) => update("companyPhone", e.target.value)} /></Field><Field required label="Alamat Pribadi"><textarea rows={3} className={`${inputClass} h-auto py-3`} value={form.address} onChange={(e) => update("address", e.target.value)} /></Field><Field required label="Alamat Usaha"><textarea rows={3} className={`${inputClass} h-auto py-3`} value={form.companyAddress} onChange={(e) => update("companyAddress", e.target.value)} /></Field><Field label="Kota"><input className={inputClass} value={form.city} onChange={(e) => update("city", e.target.value)} /></Field><Field label="Area Layanan"><input className={inputClass} value={form.area} onChange={(e) => update("area", e.target.value)} /></Field><Field required label="Password"><input type="password" className={inputClass} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Minimal 8 karakter" /></Field><Field required label="Konfirmasi Password"><input type="password" className={inputClass} value={form.passwordConfirmation} onChange={(e) => update("passwordConfirmation", e.target.value)} /></Field></div><div className="flex justify-between border-t border-slate-200 bg-slate-50 p-5"><button type="button" onClick={() => setStep(1)} className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-600">Kembali</button><button className="inline-flex h-11 items-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-bold text-white">Lanjut <ArrowRight size={17} /></button></div></form> : null}
          {step === 3 ? <div><div className="grid max-h-[650px] gap-4 overflow-y-auto p-6 md:grid-cols-2">{[["ktp", "KTP"], ["npwp", "NPWP"], ["nib", "NIB"], ["certificate", "Sertifikat Standar"], ["signature", "Paraf / Tanda Tangan (PNG)"]].map(([key, label]) => <Field key={key} required label={label}><label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-3 text-center hover:border-indigo-300"><Upload size={20} className="text-indigo-500" /><span className="mt-2 text-xs font-semibold text-slate-600">{files[key]?.name || "Pilih PDF, JPG, atau PNG"}</span><input type="file" accept={key === "signature" ? "image/png" : ".pdf,.jpg,.jpeg,.png"} className="hidden" onChange={(e) => setFiles((current) => ({ ...current, [key]: e.target.files?.[0] || null }))} /></label></Field>)}<label className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm leading-6 text-rose-900 md:col-span-2"><input type="checkbox" checked={finalConsent} onChange={(e) => setFinalConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 rounded border-rose-300 text-rose-600" /><span><strong>Persetujuan akhir.</strong> Saya menyatakan data dan dokumen yang dikirim benar serta memahami bahwa aktivasi akun bergantung pada hasil verifikasi administrator.</span></label></div><div className="flex justify-between border-t border-slate-200 bg-slate-50 p-5"><button type="button" onClick={() => setStep(2)} className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-bold text-slate-600">Kembali</button><button disabled={loading || !finalConsent} onClick={submit} className="inline-flex h-11 items-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-bold text-white disabled:bg-slate-300">{loading ? "Mengirim..." : "Kirim Pengajuan"} <ArrowRight size={17} /></button></div></div> : null}
        </div>
      </section>
    </div>
  </main>;
}
