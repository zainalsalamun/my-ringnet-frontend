"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, FormShell, SelectInput, TextArea, TextInput } from "@/components/ui/AdminUI";
import { customerTypeOptions } from "@/lib/customer-options";
import CoordinatePicker from "@/components/ui/CoordinatePicker";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { businessCustomersApi } from "@/src/features/business-customers/api";
import { customersApi } from "@/src/features/customers/api";
import { financeApi } from "@/src/features/finance/api";
import { marketingApi } from "@/src/features/marketing/api";
import { partnersApi } from "@/src/features/partners/api";
import { productsApi } from "@/src/features/products/api";
import { usersApi } from "@/src/features/users/api";

const statusOptions = [{ label: "Aktif", value: "active" }, { label: "Nonaktif", value: "nonactive" }];

function toInputDate(value?: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function parseRupiah(value: string) {
  return value.replace(/\D/g, "");
}

function formatRupiahInput(value: string) {
  const raw = parseRupiah(value);
  if (!raw) return "";
  return new Intl.NumberFormat("id-ID").format(Number(raw));
}

function formatCurrency(value: number) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(value || 0);
}

function cleanFormValue(value: unknown) {
  return value == null ? "" : String(value);
}

function mergeCleanForm<T extends Record<string, string>>(current: T, data: Record<string, unknown>) {
  const next = { ...current };
  (Object.keys(next) as Array<keyof T>).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      next[key] = cleanFormValue(data[key as string]) as T[keyof T];
    }
  });
  return next;
}

function documentMetadata(files: Record<string, File | null>) {
  return Object.entries(files)
    .filter(([, file]) => Boolean(file))
    .map(([type, file]) => ({
      type,
      name: file?.name || "",
      fileName: file?.name || "",
      mimeType: file?.type || "application/octet-stream",
      size: file?.size || 0,
    }));
}

export function CustomerForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [packageOptions, setPackageOptions] = useState<{ label: string; value: string }[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<{ label: string; value: string }[]>([]);
  const [adminOptions, setAdminOptions] = useState<{ label: string; value: string }[]>([]);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({ ktp: null, npwp: null, doc: null });
  const [coordinatePickerOpen, setCoordinatePickerOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTechnicalSection, setShowTechnicalSection] = useState(false);

  const [form, setForm] = useState({
    ticketId: "",
    customerCode: "",
    name: "",
    username: "",
    password: "",
    serviceUsername: "",
    servicePassword: "",
    phone: "",
    dialCode: "+62",
    whatsapp: "",
    email: "",
    city: "",
    area: "",
    address: "",
    coordinate: "",
    ktp: "",
    npwp: "",
    customerType: "Perumahan / Apartemen / Kos",
    packageName: "Mega 50Mbps",
    billingCycle: "monthly",
    installationDate: "",
    activationDate: "",
    popName: "",
    odpName: "",
    port: "",
    ipAddress: "",
    routerNas: "",
    supportPayment: "",
    supportTechnical: "",
    partnerId: "",
    profileImage: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    // 1. Paket Layanan: POST /api/v1/product/broadband/select or fallback
    productsApi.broadbandSelect("")
      .then((res) => {
        const raw = res.data?.data || [];
        const options = raw.map((item: any) => ({
          label: item.name || item.code || item.label || String(item),
          value: item.name || item.code || String(item),
        }));
        if (options.length > 0) {
          setPackageOptions(options);
          setForm((current) => current.packageName || !options[0] ? current : { ...current, packageName: options[0].value });
        }
      })
      .catch(() => {
        const defaultPkgs = [
          { label: "Broadband 25 Mbps", value: "Broadband 25 Mbps" },
          { label: "Broadband 50 Mbps", value: "Broadband 50 Mbps" },
          { label: "Broadband 100 Mbps", value: "Broadband 100 Mbps" },
        ];
        setPackageOptions(defaultPkgs);
      });
  }, []);

  useEffect(() => {
    // 2. Mitra: POST /api/v1/partner/list or fallback
    partnersApi.rawList({ pageSize: 100, pageIndex: 0, sorting: [], columnFilters: [], globalFilter: "" })
      .then((res) => {
        const raw = res.data?.data?.data || res.data?.data || [];
        setPartnerOptions(raw.map((item: any) => ({
          label: item.name || item.partner_id || item.username,
          value: item.id || item.partner_id || item._id,
        })));
      })
      .catch(() => setPartnerOptions([]));
  }, []);

  useEffect(() => {
    // 3. Admin / Staff Support: POST /api/v1/admin/list or fallback
    usersApi.listAdmins({ pageSize: 100, pageIndex: 0, sorting: [], columnFilters: [], globalFilter: "" })
      .then((res) => {
        const raw = res.data?.data?.data || res.data?.data || [];
        const options = raw.map((item: any) => ({
          label: item.name || item.username,
          value: item.name || item.username,
        }));
        if (options.length > 0) {
          setAdminOptions(options);
          setForm((current) => ({
            ...current,
            username: current.username || (current.name ? current.name.toLowerCase().replace(/\s+/g, "") : ""),
            supportPayment: current.supportPayment || options[0].value,
            supportTechnical: current.supportTechnical || options[0].value,
          }));
        }
      })
      .catch(() => setAdminOptions([]));
  }, []);

  useEffect(() => {
    if (!edit || !id) return;
    
    customersApi.rawRead(id)
      .then((res) => {
        const raw = res.data?.data || {};
        setForm((current) => ({
          ...current,
          ticketId: raw.ticket || current.ticketId,
          customerCode: raw.customer_id || raw.customerCode || current.customerCode,
          name: raw.name || current.name,
          username: raw.username || current.username,
          serviceUsername: raw.pppoe_username || raw.serviceUsername || raw.username || current.serviceUsername,
          servicePassword: raw.pppoe_password || raw.servicePassword || current.servicePassword,
          phone: raw.phone ? String(raw.phone).replace(/^\+62/, "0") : current.phone,
          whatsapp: raw.whatsapp || raw.phone || current.whatsapp,
          email: raw.email || current.email,
          city: raw.city || current.city,
          area: raw.area || current.area,
          address: raw.address || current.address,
          coordinate: raw.coordinate || current.coordinate,
          ktp: String(raw.ktp || current.ktp),
          npwp: String(raw.npwp || current.npwp),
          customerType: raw.type || current.customerType,
          packageName: raw.package_name || raw.packageName || current.packageName,
          billingCycle: raw.billing_cycle || raw.billingCycle || current.billingCycle,
          installationDate: toInputDate(raw.installation_date || raw.installationDate) || current.installationDate,
          activationDate: toInputDate(raw.activation_date || raw.activationDate) || current.activationDate,
          popName: raw.pop_name || raw.popName || current.popName,
          odpName: raw.odp_name || raw.odpName || current.odpName,
          port: raw.port || current.port,
          ipAddress: raw.ip_address || raw.ipAddress || current.ipAddress,
          routerNas: raw.router_nas || raw.routerNas || current.routerNas,
          supportPayment: raw.pay_support || current.supportPayment,
          supportTechnical: raw.tech_support || current.supportTechnical,
          notes: raw.notes || current.notes,
          status: raw.status === false ? "nonactive" : "active",
        }));
      })
      .catch(() => {
        customersApi.detail(id)
          .then((res) => setForm((current) => mergeCleanForm(current, res.data.data || {})))
          .catch((err) => setError(err.response?.data?.message || "Gagal memuat data pelanggan dari database."));
      });
  }, [edit, id]);

  async function save(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError("");
    setSaving(true);

    const formattedPhone = form.phone ? (form.phone.startsWith("0") ? "+62" + form.phone.slice(1) : form.phone.startsWith("+") ? form.phone : "+62" + form.phone) : "";

    const dekadataPayload = {
      ticket: form.ticketId || "TICKET-AUTO",
      type: form.customerType === "Perumahan / Apartemen / Kos" ? "home" : (form.customerType.toLowerCase().includes("bisnis") ? "business" : form.customerType.toLowerCase()),
      username: form.username || form.serviceUsername || (form.name ? form.name.toLowerCase().replace(/\s+/g, "") : "user"),
      password: form.password || form.servicePassword || "RingNet123!",
      name: form.name,
      email: form.email,
      phone: formattedPhone || form.phone,
      whatsapp: form.whatsapp || formattedPhone || form.phone,
      address: form.address,
      coordinate: form.coordinate || "-7.77720164, 110.3977788",
      ktp: Number(form.ktp.replace(/\D/g, "")) || 1234567890,
      npwp: Number(form.npwp.replace(/\D/g, "")) || 0,
      area: form.area || form.city || "Pusat",
      status: form.status === "active",
      notes: form.notes || "",
      package_name: form.packageName,
      billing_cycle: form.billingCycle,
      installation_date: form.installationDate || null,
      activation_date: form.activationDate || null,
      pppoe_username: form.serviceUsername || form.username,
      pppoe_password: form.servicePassword || form.password,
      pop_name: form.popName,
      odp_name: form.odpName,
      port: form.port,
      ip_address: form.ipAddress,
      router_nas: form.routerNas,
      partner_id: form.partnerId || null,
      tech_support: form.supportTechnical || "",
      pay_support: form.supportPayment || "",
      documents: documentMetadata(documentFiles),
    };

    try {
      if (edit && id) {
        try {
          await customersApi.rawUpdate({ ...dekadataPayload, selectedCustomerId: id });
        } catch {
          try {
            await customersApi.rawPartnerUpdate({
              ...dekadataPayload,
              selectedCustomerId: id,
            });
          } catch {
            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => payload.append(key, value || ""));
            if (profileFile) payload.append("profileImageFile", profileFile);
            await customersApi.update(id, payload);
          }
        }
      } else {
        try {
          await customersApi.rawCreate(dekadataPayload);
        } catch {
          const payload = new FormData();
          Object.entries(form).forEach(([key, value]) => payload.append(key, value || ""));
          if (profileFile) payload.append("profileImageFile", profileFile);
          await customersApi.create(payload);
        }
      }
      router.push("/users/pelanggan");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan data pelanggan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar matching apps.ring.net.id */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
            <Link href="/users/pelanggan" className="hover:text-blue-600">Pelanggan</Link>
            <span>/</span>
            <span className="text-slate-700">{edit ? "Edit Pelanggan" : "Tambah Pelanggan"}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {edit ? "Edit Pelanggan" : "Tambah Pelanggan"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/users/pelanggan"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Batal
          </Link>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Pelanggan"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700">
          {error}
        </div>
      ) : null}

      {/* Main Form Grid: 8 Cols Left + 4 Cols Right matching apps.ring.net.id/users/customer/create */}
      <form onSubmit={save} className="grid grid-cols-12 gap-6 place-content-start">
        {/* ===================================================================
            LEFT COLUMN (8 COLUMNS) - Informasi Umum & Berkas
        =================================================================== */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Informasi Umum
            </h2>

            {/* Nama Lengkap */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Masukkan nama lengkap pelanggan"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Alamat Lengkap *</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Grid 2 Cols: Telepon, Email, KTP, NPWP */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Telepon */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">No. Telepon / WhatsApp *</label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-600">
                    +62
                  </span>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value, whatsapp: form.whatsapp || e.target.value })}
                    placeholder="81234567890"
                    className="w-full rounded-r-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Alamat Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="pelanggan@domain.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* No. KTP / NIK */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Nomor KTP / NIK *</label>
                <input
                  type="text"
                  required
                  value={form.ktp}
                  onChange={(e) => setForm({ ...form, ktp: e.target.value })}
                  placeholder="3304xxxxxxxxxxxx (16 digit)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* No. NPWP */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Nomor NPWP</label>
                <input
                  type="text"
                  value={form.npwp}
                  onChange={(e) => setForm({ ...form, npwp: e.target.value })}
                  placeholder="xx.xxx.xxx.x-xxx.xxx (opsional)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Catatan Tambahan</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Catatan teknis atau preferensi pelanggan..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Upload Foto & Dokumen */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 border-t border-slate-100 pt-4">
              {/* Foto Profil */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Foto Profil Pelanggan</label>
                <FileInput
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  fileName={profileFile?.name || form.profileImage}
                  onChange={setProfileFile}
                />
              </div>

              {/* Upload Berkas KTP / NPWP */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Dokumen KTP / Identitas</label>
                <FileInput
                  accept=".pdf,.jpg,.jpeg,.png"
                  fileName={documentFiles.ktp?.name}
                  onChange={(file) => setDocumentFiles((curr) => ({ ...curr, ktp: file }))}
                />
              </div>
            </div>

            {/* Dukungan Teknis & Pembayaran (PIC Support) */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 border-t border-slate-100 pt-4">
              <SelectInput
                label="Dukungan Teknis (Technical Support)"
                value={form.supportTechnical}
                onChange={(e) => setForm({ ...form, supportTechnical: e.target.value })}
                options={[{ label: "Pilih Petugas Teknis", value: "" }, ...adminOptions]}
              />

              <SelectInput
                label="Dukungan Pembayaran (Billing Support)"
                value={form.supportPayment}
                onChange={(e) => setForm({ ...form, supportPayment: e.target.value })}
                options={[{ label: "Pilih Petugas Billing", value: "" }, ...adminOptions]}
              />
            </div>
          </Card>
        </div>

        {/* ===================================================================
            RIGHT COLUMN (4 COLUMNS) - Tiket, Kredensial, Lokasi, Teknis
        =================================================================== */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Card 1: Tiket & Mitra */}
          <Card className="p-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Tiket Pemasangan</label>
              <input
                type="text"
                value={form.ticketId}
                onChange={(e) => setForm({ ...form, ticketId: e.target.value })}
                placeholder="ID Tiket (contoh: TIKET-1002)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <SelectInput
              label="Mitra / Partner Reseller"
              value={form.partnerId}
              onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
              options={[{ label: "Tanpa Mitra (Direct RingNet)", value: "" }, ...partnerOptions]}
              searchable
              searchPlaceholder="Cari ID mitra atau nama..."
            />
          </Card>

          {/* Card 2: Kredensial Akun & Status */}
          <Card className="p-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Username Aplikasi *</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Username login pelanggan"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Password Aplikasi *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required={!edit}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={edit ? "Kosongkan jika tidak diubah" : "Password pelanggan"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs font-bold text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <SelectInput
              label="Status Akun"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={statusOptions}
            />
          </Card>

          {/* Card 3: Tipe & Lokasi Pelanggan */}
          <Card className="p-5 space-y-4">
            <SelectInput
              label="Jenis Pelanggan *"
              value={form.customerType}
              onChange={(e) => setForm({ ...form, customerType: e.target.value })}
              options={customerTypeOptions}
            />

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Area Layanan / Kota *</label>
              <input
                type="text"
                required
                value={form.area || form.city}
                onChange={(e) => setForm({ ...form, area: e.target.value, city: e.target.value })}
                placeholder="Contoh: Sleman / Papringan / Kota"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Koordinat Titik Lokasi *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={form.coordinate}
                  onChange={(e) => setForm({ ...form, coordinate: e.target.value })}
                  placeholder="-7.77720164, 110.3977788"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setCoordinatePickerOpen(true)}
                  className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-bold text-blue-600 hover:bg-blue-100"
                >
                  Peta
                </button>
              </div>
            </div>
          </Card>

          {/* Card 4: Konfigurasi Layanan Teknis & Broadband */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Data Teknis Broadband</h3>
              <button
                type="button"
                onClick={() => setShowTechnicalSection(!showTechnicalSection)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                {showTechnicalSection ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>

            {showTechnicalSection ? (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <SelectInput
                  label="Paket Internet"
                  value={form.packageName}
                  onChange={(e) => setForm({ ...form, packageName: e.target.value })}
                  options={packageOptions.length ? packageOptions : [{ label: "Belum ada paket", value: "" }]}
                />

                <SelectInput
                  label="Siklus Billing"
                  value={form.billingCycle}
                  onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                  options={[
                    { label: "Bulanan", value: "monthly" },
                    { label: "Tahunan", value: "yearly" },
                    { label: "Sekali Bayar", value: "one_time" },
                  ]}
                />

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Username PPPoE</label>
                  <input
                    type="text"
                    value={form.serviceUsername}
                    onChange={(e) => setForm({ ...form, serviceUsername: e.target.value })}
                    placeholder="user@ring.net.id"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">Password PPPoE</label>
                  <input
                    type="password"
                    value={form.servicePassword}
                    onChange={(e) => setForm({ ...form, servicePassword: e.target.value })}
                    placeholder="Password PPPoE"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">Router NAS</label>
                    <input
                      type="text"
                      value={form.routerNas}
                      onChange={(e) => setForm({ ...form, routerNas: e.target.value })}
                      placeholder="RO-RINGNET"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">POP</label>
                    <input
                      type="text"
                      value={form.popName}
                      onChange={(e) => setForm({ ...form, popName: e.target.value })}
                      placeholder="POP Papringan"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">ODP</label>
                    <input
                      type="text"
                      value={form.odpName}
                      onChange={(e) => setForm({ ...form, odpName: e.target.value })}
                      placeholder="ODP-PPR-01"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">Port</label>
                    <input
                      type="text"
                      value={form.port}
                      onChange={(e) => setForm({ ...form, port: e.target.value })}
                      placeholder="Port 08"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </form>

      {/* Coordinate Picker Modal */}
      <CoordinatePicker
        open={coordinatePickerOpen}
        value={form.coordinate}
        onClose={() => setCoordinatePickerOpen(false)}
        onSave={(coordinate) => {
          setForm({ ...form, coordinate });
          setCoordinatePickerOpen(false);
        }}
      />
    </div>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="mb-4">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm shadow-slate-200/60">
        {children}
      </div>
    </section>
  );
}

function FileInput({ label, accept, fileName, onChange }: { label: string; accept: string; fileName?: string; onChange: (file: File | null) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] || null)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
      {fileName ? <span className="mt-2 block text-xs font-medium text-slate-500">{fileName}</span> : null}
    </label>
  );
}

export function CompanyForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [coordinatePickerOpen, setCoordinatePickerOpen] = useState(false);
  const [packageOptions, setPackageOptions] = useState<{ label: string; value: string }[]>([]);
  const [adminOptions, setAdminOptions] = useState<{ label: string; value: string }[]>([]);
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({ ktp: null, npwp: null, nib: null, legal: null });
  const [form, setForm] = useState({
    companyCode: "",
    name: "",
    businessEntity: "PT",
    nib: "",
    npwp: "",
    picName: "",
    picPosition: "",
    picPhone: "",
    picEmail: "",
    ktp: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    serviceUsername: "",
    servicePassword: "",
    city: "Jakarta",
    area: "Jakarta",
    address: "",
    coordinate: "",
    packageName: "",
    billingCycle: "monthly",
    installationDate: "",
    activationDate: "",
    popName: "",
    odpName: "",
    port: "",
    ipAddress: "",
    routerNas: "",
    supportPayment: "",
    supportTechnical: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    productsApi.broadbandSelect("")
      .then((res) => {
        const raw = res.data?.data || [];
        const options = raw.map((item: any) => ({
          label: item.name || item.code || item.label || String(item),
          value: item.name || item.code || String(item),
        }));
        if (options.length > 0) {
          setPackageOptions(options);
          setForm((current) => current.packageName ? current : { ...current, packageName: options[0].value });
        }
      })
      .catch(() => {
        setPackageOptions([
          { label: "Dedicated Internet", value: "Dedicated Internet" },
          { label: "Data Access", value: "Data Access" },
          { label: "Broadband Business", value: "Broadband Business" },
        ]);
      });
  }, []);

  useEffect(() => {
    usersApi.listAdmins({ pageSize: 100, pageIndex: 0, sorting: [], columnFilters: [], globalFilter: "" })
      .then((res) => {
        const raw = res.data?.data?.data || res.data?.data || [];
        const options = raw.map((item: any) => ({
          label: item.name || item.username,
          value: item.name || item.username,
        }));
        setAdminOptions(options);
        if (options.length > 0) {
          setForm((current) => ({
            ...current,
            supportPayment: current.supportPayment || options[0].value,
            supportTechnical: current.supportTechnical || options[0].value,
          }));
        }
      })
      .catch(() => setAdminOptions([]));
  }, []);

  useEffect(() => {
    if (!edit || !id) return;
    businessCustomersApi.detail(id)
      .then((res) => {
        const raw = res.data.data || {};
        setForm((current) => ({
          ...current,
          companyCode: raw.partner_id || raw.companyCode || raw.company_code || current.companyCode,
          name: raw.name || current.name,
          businessEntity: raw.business_entity || raw.businessEntity || current.businessEntity,
          nib: String(raw.nib || current.nib),
          npwp: String(raw.npwp || current.npwp),
          picName: raw.pic_name || raw.picName || raw.contact_person || current.picName,
          picPosition: raw.pic_position || raw.picPosition || current.picPosition,
          picPhone: raw.pic_phone || raw.picPhone || raw.phone || current.picPhone,
          picEmail: raw.pic_email || raw.picEmail || raw.email || current.picEmail,
          ktp: String(raw.ktp || current.ktp),
          email: raw.email || current.email,
          phone: raw.phone || current.phone,
          username: raw.username || current.username,
          serviceUsername: raw.pppoe_username || raw.serviceUsername || current.serviceUsername,
          servicePassword: raw.pppoe_password || raw.servicePassword || current.servicePassword,
          city: raw.city || current.city,
          area: raw.area || current.area,
          address: raw.address || current.address,
          coordinate: raw.coordinate || current.coordinate,
          packageName: raw.package_name || raw.packageName || current.packageName,
          billingCycle: raw.billing_cycle || raw.billingCycle || current.billingCycle,
          installationDate: toInputDate(raw.installation_date || raw.installationDate) || current.installationDate,
          activationDate: toInputDate(raw.activation_date || raw.activationDate) || current.activationDate,
          popName: raw.pop_name || raw.popName || current.popName,
          odpName: raw.odp_name || raw.odpName || current.odpName,
          port: raw.port || current.port,
          ipAddress: raw.ip_address || raw.ipAddress || current.ipAddress,
          routerNas: raw.router_nas || raw.routerNas || current.routerNas,
          supportPayment: raw.pay_support || raw.supportPayment || current.supportPayment,
          supportTechnical: raw.tech_support || raw.supportTechnical || current.supportTechnical,
          status: raw.status === false ? "nonactive" : "active",
          notes: raw.notes || current.notes,
        }));
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat data bisnis dari database."));
  }, [edit, id]);

  async function save() {
    setError("");
    if (!form.name || !form.picName || !form.picPhone) {
      setError("Nama perusahaan, nama PIC, dan telepon PIC wajib diisi.");
      return;
    }
    try {
      const payload = {
        ticket: form.companyCode || "TICKET-AUTO",
        type: "business",
        username: form.username || form.email?.split("@")[0] || form.name.toLowerCase().replace(/\s+/g, ""),
        password: form.password || form.servicePassword || "RingNet123!",
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address || form.city,
        coordinate: form.coordinate || "-6.200000, 106.816666",
        ktp: Number(form.ktp.replace(/\D/g, "")) || 1234567890,
        npwp: Number(form.npwp.replace(/\D/g, "")) || 0,
        area: form.area,
        status: form.status === "active",
        notes: form.notes || "",
        business_entity: form.businessEntity,
        nib: form.nib,
        pic_name: form.picName,
        pic_position: form.picPosition,
        pic_phone: form.picPhone,
        pic_email: form.picEmail,
        package_name: form.packageName,
        billing_cycle: form.billingCycle,
        installation_date: form.installationDate || null,
        activation_date: form.activationDate || null,
        pppoe_username: form.serviceUsername || form.username,
        pppoe_password: form.servicePassword || form.password,
        pop_name: form.popName,
        odp_name: form.odpName,
        port: form.port,
        ip_address: form.ipAddress,
        router_nas: form.routerNas,
        tech_support: form.supportTechnical || "",
        pay_support: form.supportPayment || "",
        documents: documentMetadata(documentFiles),
      };
      if (edit && id) {
        await partnersApi.rawUpdate({ ...payload, selectedCustomerId: id });
      } else {
        await partnersApi.rawCreate(payload);
      }
      router.push("/users/bisnis");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan bisnis.");
    }
  }

  return <FormShell title={(edit ? "Edit" : "Tambah") + " Pelanggan Bisnis"} subtitle="Lengkapi data perusahaan, PIC, legalitas, akun layanan, lokasi, produk, dan billing." onSubmit={save} backHref="/users/bisnis">
    {error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
    <div className="space-y-6">
      <FormSection title="Informasi Perusahaan" description="Identitas master pelanggan bisnis/perusahaan.">
        <div className="grid gap-5 lg:grid-cols-2">
          <TextInput label="ID Bisnis" value={form.companyCode} onChange={(e) => setForm({ ...form, companyCode: e.target.value })} placeholder="Otomatis jika kosong" />
          <SelectInput label="Bentuk Badan Usaha" value={form.businessEntity} onChange={(e) => setForm({ ...form, businessEntity: e.target.value })} options={[{ label: "PT", value: "PT" }, { label: "CV", value: "CV" }, { label: "Yayasan", value: "Yayasan" }, { label: "Instansi", value: "Instansi" }, { label: "Koperasi", value: "Koperasi" }, { label: "Lainnya", value: "Lainnya" }]} />
          <TextInput label="Nama Perusahaan / Instansi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama bisnis/perusahaan" />
          <TextInput label="Email Perusahaan" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value, username: form.username || e.target.value.split("@")[0] })} placeholder="email@perusahaan.com" />
          <TextInput label="No Telepon Perusahaan" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="021/08xx" />
          <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={statusOptions} />
        </div>
      </FormSection>

      <FormSection title="Data PIC" description="Penanggung jawab pelanggan bisnis untuk koordinasi administrasi dan teknis.">
        <div className="grid gap-5 lg:grid-cols-2">
          <TextInput label="Nama PIC" value={form.picName} onChange={(e) => setForm({ ...form, picName: e.target.value })} placeholder="Nama PIC" />
          <TextInput label="Jabatan PIC" value={form.picPosition} onChange={(e) => setForm({ ...form, picPosition: e.target.value })} placeholder="Contoh: IT Manager" />
          <TextInput label="No Telepon / WhatsApp PIC" value={form.picPhone} onChange={(e) => setForm({ ...form, picPhone: e.target.value })} placeholder="08xxxxxxxxxx" />
          <TextInput label="Email PIC" value={form.picEmail} onChange={(e) => setForm({ ...form, picEmail: e.target.value })} placeholder="pic@perusahaan.com" />
          <TextInput label="Nomor KTP / NIK PIC" value={form.ktp} onChange={(e) => setForm({ ...form, ktp: e.target.value })} placeholder="NIK PIC" />
        </div>
      </FormSection>

      <FormSection title="Legalitas Bisnis" description="Dokumen legal perusahaan untuk kebutuhan registrasi layanan.">
        <div className="grid gap-5 lg:grid-cols-2">
          <TextInput label="NPWP Perusahaan" value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} placeholder="Nomor NPWP" />
          <TextInput label="NIB / Nomor Legalitas" value={form.nib} onChange={(e) => setForm({ ...form, nib: e.target.value })} placeholder="Nomor NIB/legalitas" />
          <FileInput label="Upload KTP / NIK PIC" accept=".pdf,.jpg,.jpeg,.png" fileName={documentFiles.ktp?.name} onChange={(file) => setDocumentFiles((current) => ({ ...current, ktp: file }))} />
          <FileInput label="Upload NPWP" accept=".pdf,.jpg,.jpeg,.png" fileName={documentFiles.npwp?.name} onChange={(file) => setDocumentFiles((current) => ({ ...current, npwp: file }))} />
          <FileInput label="Upload NIB" accept=".pdf,.jpg,.jpeg,.png" fileName={documentFiles.nib?.name} onChange={(file) => setDocumentFiles((current) => ({ ...current, nib: file }))} />
          <FileInput label="Upload Dokumen Legal Lainnya" accept=".pdf,.jpg,.jpeg,.png" fileName={documentFiles.legal?.name} onChange={(file) => setDocumentFiles((current) => ({ ...current, legal: file }))} />
        </div>
      </FormSection>

      <FormSection title="Akun Layanan Internet" description="Akun aplikasi, PPPoE, dan data teknis jaringan pelanggan bisnis.">
        <div className="grid gap-5 lg:grid-cols-2">
          <TextInput label="Username Aplikasi" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username customer bisnis" />
          <TextInput label="Password Aplikasi" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={edit ? "Kosongkan jika tidak diubah" : "Password customer bisnis"} />
          <TextInput label="Username PPPoE" value={form.serviceUsername} onChange={(e) => setForm({ ...form, serviceUsername: e.target.value })} placeholder="username@ring.net.id" />
          <TextInput label="Password PPPoE" type="password" value={form.servicePassword} onChange={(e) => setForm({ ...form, servicePassword: e.target.value })} placeholder="Password PPPoE" />
          <TextInput label="IP Address" value={form.ipAddress} onChange={(e) => setForm({ ...form, ipAddress: e.target.value })} placeholder="Opsional" />
          <TextInput label="Router NAS" value={form.routerNas} onChange={(e) => setForm({ ...form, routerNas: e.target.value })} placeholder="Router/NAS" />
          <TextInput label="POP" value={form.popName} onChange={(e) => setForm({ ...form, popName: e.target.value })} placeholder="Nama POP" />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput label="ODP" value={form.odpName} onChange={(e) => setForm({ ...form, odpName: e.target.value })} placeholder="ODP" />
            <TextInput label="Port" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} placeholder="Port" />
          </div>
        </div>
      </FormSection>

      <FormSection title="Lokasi Pemasangan" description="Alamat kantor/site, area layanan, kota, dan koordinat pemasangan.">
        <div className="grid gap-5 lg:grid-cols-2">
          <TextInput label="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} placeholder="Area layanan" />
          <TextInput label="Kota/Kabupaten" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Kota/Kabupaten" />
          <div className="lg:col-span-2"><TextInput label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat bisnis/perusahaan" /></div>
          <div className="lg:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Koordinat</span>
            <div className="flex gap-2">
              <input value={form.coordinate} onChange={(e) => setForm({ ...form, coordinate: e.target.value })} placeholder="-7.77720164, 110.3977788" className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              <button type="button" onClick={() => setCoordinatePickerOpen(true)} className="h-11 rounded-lg border border-indigo-200 px-4 text-sm font-bold text-indigo-600 hover:bg-indigo-50">Pilih Maps</button>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Produk, Billing, dan Support" description="Paket layanan bisnis, siklus billing, jadwal aktivasi, dan PIC support internal.">
        <div className="grid gap-5 lg:grid-cols-2">
          <SelectInput label="Paket Layanan" value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} options={packageOptions.length ? packageOptions : [{ label: "Belum ada paket", value: "" }]} disabled={!packageOptions.length} />
          <SelectInput label="Siklus Billing" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })} options={[{ label: "Bulanan", value: "monthly" }, { label: "Tahunan", value: "yearly" }, { label: "Sekali Bayar", value: "one_time" }]} />
          <TextInput label="Tanggal Instalasi" type="date" value={form.installationDate} onChange={(e) => setForm({ ...form, installationDate: e.target.value })} />
          <TextInput label="Tanggal Aktivasi" type="date" value={form.activationDate} onChange={(e) => setForm({ ...form, activationDate: e.target.value })} />
          <SelectInput label="Dukungan Pembayaran" value={form.supportPayment} onChange={(e) => setForm({ ...form, supportPayment: e.target.value })} options={adminOptions.length ? adminOptions : [{ label: "Belum ada admin", value: "" }]} disabled={!adminOptions.length} />
          <SelectInput label="Dukungan Teknis" value={form.supportTechnical} onChange={(e) => setForm({ ...form, supportTechnical: e.target.value })} options={adminOptions.length ? adminOptions : [{ label: "Belum ada admin", value: "" }]} disabled={!adminOptions.length} />
          <div className="lg:col-span-2"><TextArea label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan tambahan opsional" /></div>
        </div>
      </FormSection>
    </div>
    <CoordinatePicker
      open={coordinatePickerOpen}
      value={form.coordinate}
      onClose={() => setCoordinatePickerOpen(false)}
      onSave={(coordinate) => {
        setForm({ ...form, coordinate });
        setCoordinatePickerOpen(false);
      }}
    />
  </FormShell>;
}

export function PartnerForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const [error, setError] = useState("");
  const [coordinatePickerOpen, setCoordinatePickerOpen] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({ ktp: null, npwp: null });
  const [form, setForm] = useState({ partnerCode: "", partnerType: "mitra", name: "", phone: "", email: "", loginEmail: "", accountPassword: "", address: "", city: "Jakarta", area: "Jakarta", coordinate: "", picName: "", picPhone: "", ktpNumber: "", npwpNumber: "", nibNumber: "", certificateNumber: "", agreementNumber: "", agreementStart: "", agreementEnd: "", bandwidthFee: "0", profitSharePercent: "20", bhpUsoPercent: "1.75", ksoPercent: "3", status: "active" });
  const router = useRouter();

  useEffect(() => {
    if (!edit || !id) return;
    partnersApi.detail(id)
      .then((res) => {
        const data = res.data.data || {};
        setForm((current) => mergeCleanForm(current, { ...data, loginEmail: data.user?.email || data.email || "", agreementStart: data.agreementStart ? String(data.agreementStart).slice(0, 10) : "", agreementEnd: data.agreementEnd ? String(data.agreementEnd).slice(0, 10) : "", accountPassword: "" }));
      })
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat data mitra dari database."));
  }, [edit, id]);

  async function save() {
    setError("");
    if (!form.name || !form.loginEmail || (!edit && !form.accountPassword)) {
      setError("Nama, email login, dan password portal wajib diisi untuk mitra baru.");
      return;
    }
    try {
      const payload = {
        ticket: form.partnerCode || "TICKET-AUTO",
        type: form.partnerType,
        username: form.loginEmail.split("@")[0] || form.name.toLowerCase().replace(/\s+/g, ""),
        password: form.accountPassword || undefined,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        coordinate: form.coordinate || "-6.200000, 106.816666",
        ktp: Number(form.ktpNumber.replace(/\D/g, "")) || 1234567890,
        npwp: Number(form.npwpNumber.replace(/\D/g, "")) || 0,
        area: form.area,
        status: form.status === "active",
        notes: [
          form.picName ? `PIC: ${form.picName}` : "",
          form.picPhone ? `Telepon PIC: ${form.picPhone}` : "",
          form.nibNumber ? `NIB: ${form.nibNumber}` : "",
          form.certificateNumber ? `Sertifikat: ${form.certificateNumber}` : "",
          form.agreementNumber ? `PKS: ${form.agreementNumber}` : "",
        ].filter(Boolean).join("\n"),
        tech_support: "",
        pay_support: "",
        documents: documentMetadata(documentFiles),
      };
      if (edit && id) {
        await partnersApi.rawUpdate({ ...payload, selectedCustomerId: id });
      } else {
        await partnersApi.rawCreate(payload);
      }
      router.push("/users/mitra");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan mitra.");
    }
  }

  return <FormShell title={(edit ? "Edit" : "Tambah") + " Reseller / Mitra"} subtitle="Buat profil, akun login, legalitas, dan skema pembukuan reseller/mitra." onSubmit={save} backHref="/users/mitra">{error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}<div className="grid gap-5 lg:grid-cols-2">
    <TextInput label="ID Mitra" value={form.partnerCode} onChange={(e) => setForm({ ...form, partnerCode: e.target.value })} placeholder="Otomatis jika kosong" />
    <SelectInput label="Jenis Akun" value={form.partnerType} onChange={(e) => setForm({ ...form, partnerType: e.target.value })} options={[{ label: "Mitra", value: "mitra" }, { label: "Reseller", value: "reseller" }]} />
    <TextInput label="Nama Mitra Individual" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
    <TextInput label="No Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
    <TextInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
    <TextInput label="Email Login Portal" type="email" value={form.loginEmail} onChange={(e) => setForm({ ...form, loginEmail: e.target.value })} placeholder="mitra@ringnet.com" />
    <TextInput label={edit ? "Password Baru (opsional)" : "Password Portal"} type="password" value={form.accountPassword} onChange={(e) => setForm({ ...form, accountPassword: e.target.value })} placeholder={edit ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"} />
    <TextInput label="Nama PIC" value={form.picName} onChange={(e) => setForm({ ...form, picName: e.target.value })} />
    <TextInput label="Telepon PIC" value={form.picPhone} onChange={(e) => setForm({ ...form, picPhone: e.target.value })} />
    <TextInput label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
    <TextInput label="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
    <TextInput label="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
    <div>
      <span className="mb-2 block text-sm font-semibold text-slate-700">Koordinat</span>
      <div className="flex gap-2">
        <input value={form.coordinate} onChange={(e) => setForm({ ...form, coordinate: e.target.value })} placeholder="-7.7956, 110.3695" className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        <button type="button" onClick={() => setCoordinatePickerOpen(true)} className="h-11 rounded-lg border border-indigo-200 px-4 text-sm font-bold text-indigo-600 hover:bg-indigo-50">Pilih Maps</button>
      </div>
    </div>
    <TextInput label="Nomor KTP / NIK PIC" value={form.ktpNumber} onChange={(e) => setForm({ ...form, ktpNumber: e.target.value })} />
    <TextInput label="Nomor NPWP" value={form.npwpNumber} onChange={(e) => setForm({ ...form, npwpNumber: e.target.value })} />
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">Upload KTP / NIK PIC</span>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocumentFiles((current) => ({ ...current, ktp: e.target.files?.[0] || null }))} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
      {documentFiles.ktp ? <span className="mt-2 block text-xs font-medium text-slate-500">{documentFiles.ktp.name}</span> : null}
    </label>
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">Upload NPWP</span>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setDocumentFiles((current) => ({ ...current, npwp: e.target.files?.[0] || null }))} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
      {documentFiles.npwp ? <span className="mt-2 block text-xs font-medium text-slate-500">{documentFiles.npwp.name}</span> : null}
    </label>
    <TextInput label="Nomor NIB" value={form.nibNumber} onChange={(e) => setForm({ ...form, nibNumber: e.target.value })} />
    <TextInput label="Nomor Sertifikat Standar" value={form.certificateNumber} onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })} />
    <TextInput label="Nomor PKS" value={form.agreementNumber} onChange={(e) => setForm({ ...form, agreementNumber: e.target.value })} />
    <TextInput label="Tanggal Mulai PKS" type="date" value={form.agreementStart} onChange={(e) => setForm({ ...form, agreementStart: e.target.value })} />
    <TextInput label="Tanggal Berakhir PKS" type="date" value={form.agreementEnd} onChange={(e) => setForm({ ...form, agreementEnd: e.target.value })} />
    <TextInput label="Biaya Supply Bandwidth" type="number" value={form.bandwidthFee} onChange={(e) => setForm({ ...form, bandwidthFee: e.target.value })} />
    <TextInput label="Sharing Profit (%)" type="number" step="0.01" value={form.profitSharePercent} onChange={(e) => setForm({ ...form, profitSharePercent: e.target.value })} />
    <TextInput label="BHP USO (%)" type="number" step="0.01" value={form.bhpUsoPercent} onChange={(e) => setForm({ ...form, bhpUsoPercent: e.target.value })} />
    <TextInput label="KSO (%)" type="number" step="0.01" value={form.ksoPercent} onChange={(e) => setForm({ ...form, ksoPercent: e.target.value })} />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={statusOptions} />
    <CoordinatePicker
      open={coordinatePickerOpen}
      value={form.coordinate}
      onClose={() => setCoordinatePickerOpen(false)}
      onSave={(coordinate) => {
        setForm({ ...form, coordinate });
        setCoordinatePickerOpen(false);
      }}
    />
  </div></FormShell>;
}

export function LeadForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const [error, setError] = useState("");
  const [partnerOptions, setPartnerOptions] = useState<{ label: string; value: string }[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", status: "prospect", mitraId: "", notes: "" });
  const router = useRouter();

  useEffect(() => {
    partnersApi.list({ limit: 5000 })
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const options = data.map((item: any) => ({ label: item.name, value: item.id }));
        setPartnerOptions(options);
        setForm((current) => current.mitraId || !options[0] ? current : { ...current, mitraId: options[0].value });
      })
      .catch(() => {
        setPartnerOptions([]);
      });
  }, []);

  useEffect(() => {
    if (!edit || !id) return;
    marketingApi.detail(id).then((res) => {
      const data = res.data.data;
      setForm({
        name: data.customerName || data.name || "",
        phone: data.phone || "",
        status: String(data.status || "prospect").toLowerCase(),
        mitraId: String(data.partnerId || data.mitraId || ""),
        notes: data.notes || "",
      });
    }).catch((err) => setError(err.response?.data?.message || "Gagal memuat data lead dari database."));
  }, [edit, id]);

  async function save() {
    setError("");
    try {
      if (edit && id) await marketingApi.update(id, form);
      else await marketingApi.create(form);
      router.push("/marketing/leads");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan lead.");
    }
  }

  return <FormShell title={(edit ? "Edit" : "Tambah") + " Lead"} subtitle="Kelola lead marketing dan assignment ke mitra." onSubmit={save} backHref="/marketing/leads">{error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}<div className="grid gap-5 lg:grid-cols-2">
    <TextInput label="Nama Lead" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ label: "Prospect", value: "prospect" }, { label: "Deal", value: "deal" }, { label: "Lost", value: "lost" }]} />
    <SelectInput label="Mitra" value={form.mitraId} onChange={(e) => setForm({ ...form, mitraId: e.target.value })} options={partnerOptions.length ? partnerOptions : [{ label: "Belum ada mitra", value: "" }]} disabled={!partnerOptions.length} />
    <TextInput label="No Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
    <div className="lg:col-span-2"><TextArea label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
  </div></FormShell>;
}

export function InvoiceForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [customerOptions, setCustomerOptions] = useState<{ label: string; value: string; customer: any }[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [packageOptions, setPackageOptions] = useState<{ label: string; value: string; price: number }[]>([]);
  const [items, setItems] = useState<{ name: string; quantity: number; discount: number; unitPrice: number; total: number }[]>([]);
  const [itemDraft, setItemDraft] = useState({ name: "", quantity: "1", discount: "", unitPrice: "" });
  const [form, setForm] = useState({
    customer_id: "",
    customer_name: "",
    authentication_id: "",
    invoice_name: "",
    invoice_type: "pelanggan",
    no_faktur: "",
    no_invoice: "",
    service_type: "",
    period_month: String(new Date().getMonth() + 1),
    period_year: String(new Date().getFullYear()),
    amount: "",
    status: "UNPAID",
    due_date: "",
    tax_percent: "0",
    notes: "",
    disable_auth_on_due: false,
  });
  const subtotal = useMemo(() => items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0), [items]);
  const discountTotal = useMemo(() => items.reduce((total, item) => total + item.discount, 0), [items]);
  const taxBase = Math.max(0, subtotal - discountTotal);
  const taxAmount = Math.round(taxBase * (Number(form.tax_percent || 0) / 100));
  const grandTotal = taxBase + taxAmount;

  function mapCustomerOptions(data: any[]) {
    return data.map((item: any) => ({
      label: [item.customerCode, item.name, item.phone].filter(Boolean).join(" - "),
      value: item.id,
      customer: item,
    }));
  }

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ limit: customerSearch.trim() ? "50" : "100" });
      if (customerSearch.trim()) params.set("search", customerSearch.trim());
      setCustomerLoading(true);
      customersApi.list(params, { signal: controller.signal })
        .then((res) => {
          const data = Array.isArray(res.data.data) ? res.data.data : [];
          setCustomerOptions(mapCustomerOptions(data));
        })
        .catch((err) => {
          if (err?.code !== "ERR_CANCELED" && err?.name !== "CanceledError") setCustomerOptions([]);
        })
        .finally(() => setCustomerLoading(false));
    }, customerSearch.trim() ? 250 : 0);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [customerSearch]);

  useEffect(() => {
    productsApi.servicePackages({ limit: 100 })
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const options = data.map((item: any) => ({ label: item.name, value: item.name, price: Number(item.monthlyPrice || item.price || 0) }));
        setPackageOptions(options);
      })
      .catch(() => {
        setPackageOptions([]);
      });
  }, []);

  function chooseCustomer(customerId: string) {
    const selected = customerOptions.find((item) => item.value === customerId)?.customer;
    setForm((current) => ({
      ...current,
      customer_id: customerId,
      customer_name: selected?.name || current.customer_name,
      authentication_id: customerId || current.authentication_id,
      service_type: selected?.packageName || current.service_type,
    }));
  }

  function chooseProduct(productName: string) {
    const selected = packageOptions.find((item) => item.value === productName);
    setItemDraft((current) => ({
      ...current,
      name: productName,
      unitPrice: selected?.price ? String(selected.price) : current.unitPrice,
    }));
  }

  function addItem() {
    const name = itemDraft.name.trim();
    const quantity = Number(itemDraft.quantity) || 1;
    const unitPrice = Number(parseRupiah(itemDraft.unitPrice));
    const discount = Number(parseRupiah(itemDraft.discount));
    if (!name || unitPrice <= 0) {
      setError("Nama produk dan harga satuan wajib diisi.");
      return;
    }
    const total = Math.max(0, unitPrice * quantity - discount);
    setItems((current) => [...current, { name, quantity, unitPrice, discount, total }]);
    setForm((current) => ({ ...current, service_type: current.service_type || name }));
    setItemDraft({ name: "", quantity: "1", discount: "", unitPrice: "" });
    setError("");
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function invoiceCode(prefix: string) {
    const month = String(form.period_month || new Date().getMonth() + 1).padStart(2, "0");
    const year = form.period_year || String(new Date().getFullYear());
    return `${prefix}/${year}/${month}/AUTO`;
  }

  useEffect(() => {
    if (!edit || !id) return;
    financeApi.invoiceDetail(id).then((res) => {
      const data = res.data.data;
      setForm({
        customer_id: data.customerId || "",
        customer_name: data.customerName || "",
        authentication_id: data.authenticationId || "",
        invoice_name: data.invoiceName || "",
        invoice_type: data.invoiceType || "pelanggan",
        no_faktur: data.noFaktur || "",
        no_invoice: data.noInvoice || "",
        service_type: data.serviceType || "Mega 50Mbps",
        period_month: String(data.periodMonth || "5"),
        period_year: String(data.periodYear || "2026"),
        amount: String(data.amount || ""),
        status: data.status || "UNPAID",
        due_date: toInputDate(data.dueDate),
        tax_percent: String(data.taxPercent || "0"),
        notes: data.notes || "",
        disable_auth_on_due: Boolean(data.disableAuthOnDue),
      });
      if (data.customer?.id) {
        setCustomerOptions((current) => {
          if (current.some((item) => item.value === data.customer.id)) return current;
          return [...mapCustomerOptions([data.customer]), ...current];
        });
      }
      if (Array.isArray(data.items)) {
        setItems(data.items.map((item: any) => ({
          name: item.name || "",
          quantity: Number(item.quantity || 1),
          discount: Number(item.discount || 0),
          unitPrice: Number(item.unitPrice || 0),
          total: Number(item.total || 0),
        })));
      } else if (data.serviceType || data.amount) {
        const amount = Number(data.amount || 0);
        setItems([{
          name: data.serviceType || "Layanan Internet",
          quantity: 1,
          discount: 0,
          unitPrice: amount,
          total: amount,
        }]);
      }
    }).catch((err) => setError(err.response?.data?.message || "Gagal memuat faktur dari database."));
  }, [edit, id]);

  async function save() {
    setError("");
    if (!form.invoice_name.trim()) {
      setError("Nama tagihan wajib diisi.");
      return;
    }
    if (form.invoice_type === "pelanggan" && !form.customer_id) {
      setError("Pelanggan wajib dipilih dari data pelanggan.");
      return;
    }
    if (!items.length) {
      setError("Minimal tambahkan satu produk atau jasa.");
      return;
    }
    try {
      const payload = {
        ...form,
        customer_id: form.customer_id || null,
        authentication_id: form.authentication_id || null,
        customer_name: form.customer_name || "Faktur Umum",
        no_faktur: form.no_faktur || invoiceCode("FTR"),
        no_invoice: form.no_invoice || invoiceCode("INV"),
        service_type: items.map((item) => item.name).join(", "),
        period_month: Number(form.period_month),
        period_year: Number(form.period_year),
        tax_percent: Number(form.tax_percent || 0),
        subtotal,
        discount_total: discountTotal,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        amount: grandTotal,
        items,
      };
      const response = edit && id
        ? await financeApi.updateInvoice(id, payload)
        : await financeApi.createInvoice(payload);
      const saved = response.data?.data;
      router.push(saved?.id ? `/internet-services/${saved.id}` : "/internet-services");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan faktur.");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="text-xs font-medium text-slate-500">Dashboard / Keuangan / Faktur & Tagihan / {edit ? "Edit" : "Tambah"}</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{edit ? "Edit Faktur" : "Tambah Faktur"}</h1>
        <p className="mt-1 text-sm text-slate-500">Buat faktur pelanggan, umum, atau mitra bisnis dengan item produk dan jasa.</p>
      </div>
      <Card className="overflow-hidden">
        <form onSubmit={(event) => { event.preventDefault(); save(); }}>
          <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-4 text-base font-bold text-white">Informasi Tagihan</div>
          <div className="space-y-6 p-5">
            {error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="lg:col-span-2"><TextInput label="Nama Tagihan" value={form.invoice_name} onChange={(e) => setForm({ ...form, invoice_name: e.target.value })} placeholder="Contoh: Periode Mei 2026" /></div>
              <SelectInput label="Jenis Faktur" value={form.invoice_type} onChange={(e) => setForm({ ...form, invoice_type: e.target.value })} options={[{ label: "Faktur Pelanggan", value: "pelanggan" }, { label: "Faktur Umum", value: "umum" }, { label: "Faktur Mitra & Bisnis", value: "mitra_bisnis" }]} />
              <SelectInput label="Pelanggan" searchable searchPlaceholder="Cari ID pelanggan atau nama..." onSearchChange={setCustomerSearch} searching={customerLoading} value={form.customer_id} onChange={(e) => chooseCustomer(e.target.value)} options={customerOptions.length ? [{ label: "Pilih pelanggan", value: "" }, ...customerOptions.map(({ label, value }) => ({ label, value }))] : [{ label: customerLoading ? "Memuat pelanggan..." : "Belum ada pelanggan", value: "" }]} disabled={!customerOptions.length && !customerLoading} />
              <SelectInput label="Autentikasi" searchable searchPlaceholder="Cari ID pelanggan atau autentikasi..." onSearchChange={setCustomerSearch} searching={customerLoading} value={form.authentication_id} onChange={(e) => setForm({ ...form, authentication_id: e.target.value })} options={customerOptions.length ? [{ label: "Pilih autentikasi", value: "" }, ...customerOptions.map(({ label, value }) => ({ label, value }))] : [{ label: customerLoading ? "Memuat autentikasi..." : "Belum ada autentikasi", value: "" }]} disabled={!customerOptions.length && !customerLoading} />
              <TextInput label="Tanggal Jatuh Tempo" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <TextInput label="Pajak (%)" inputMode="decimal" value={form.tax_percent} onChange={(e) => setForm({ ...form, tax_percent: e.target.value })} placeholder="0" />
              <TextInput label="No Invoice" value={form.no_invoice} onChange={(e) => setForm({ ...form, no_invoice: e.target.value })} placeholder="Otomatis jika kosong" />
              <TextInput label="No Faktur" value={form.no_faktur} onChange={(e) => setForm({ ...form, no_faktur: e.target.value })} placeholder="Otomatis jika kosong" />
            </div>
            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700">Catatan</span>
              <div className="rounded-lg border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2 text-sm font-semibold text-slate-500">
                  <span>B</span><span>I</span><span>U</span><span>• List</span><span>Link</span><span>Quote</span>
                </div>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Masukkan catatan" className="min-h-36 w-full resize-y rounded-b-lg px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              </div>
            </div>
            <div className="rounded-lg bg-slate-100 py-3 text-center text-sm font-bold text-slate-700">Produk & Jasa</div>
            <div className="grid gap-5 lg:grid-cols-2">
              <SelectInput label="Nama Produk" searchable searchPlaceholder="Cari paket atau jasa..." value={itemDraft.name} onChange={(e) => chooseProduct(e.target.value)} options={packageOptions.length ? [{ label: "Pilih Nama Produk", value: "" }, ...packageOptions.map(({ label, value }) => ({ label, value }))] : [{ label: "Belum ada produk", value: "" }]} disabled={!packageOptions.length} />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Harga Satuan</span>
                <div className="flex h-11 w-full items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                  <span className="mr-2 shrink-0 font-semibold text-slate-500">Rp</span>
                  <input inputMode="numeric" value={formatRupiahInput(itemDraft.unitPrice)} onChange={(e) => setItemDraft({ ...itemDraft, unitPrice: parseRupiah(e.target.value) })} placeholder="0" className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400" />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Potongan Harga</span>
                <div className="flex h-11 w-full items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus:ring-indigo-100">
                  <span className="mr-2 shrink-0 font-semibold text-slate-500">Rp</span>
                  <input inputMode="numeric" value={formatRupiahInput(itemDraft.discount)} onChange={(e) => setItemDraft({ ...itemDraft, discount: parseRupiah(e.target.value) })} placeholder="0" className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400" />
                </div>
              </label>
              <TextInput label="Jumlah" inputMode="numeric" value={itemDraft.quantity} onChange={(e) => setItemDraft({ ...itemDraft, quantity: e.target.value })} placeholder="1" />
              <div className="lg:col-span-2 flex justify-end">
                <button type="button" onClick={addItem} className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">Tambahkan Produk</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border border-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr><th className="w-10 border-b border-slate-200 px-3 py-3"></th><th className="border-b border-slate-200 px-3 py-3">Nama Produk</th><th className="border-b border-slate-200 px-3 py-3">Jumlah</th><th className="border-b border-slate-200 px-3 py-3">Potongan Harga</th><th className="border-b border-slate-200 px-3 py-3">Harga Satuan</th><th className="border-b border-slate-200 px-3 py-3">Total Harga</th></tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={`${item.name}-${index}`} className="border-b border-slate-100">
                      <td className="px-3 py-3"><button type="button" onClick={() => removeItem(index)} className="font-bold text-rose-500">x</button></td>
                      <td className="px-3 py-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="px-3 py-3">{item.quantity}</td>
                      <td className="px-3 py-3">{formatCurrency(item.discount)}</td>
                      <td className="px-3 py-3">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-3 font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  {!items.length ? <tr><td colSpan={6} className="px-3 py-8 text-center text-sm font-semibold text-slate-400">Belum ada produk ditambahkan.</td></tr> : null}
                  <tr className="bg-slate-50"><td colSpan={5} className="px-3 py-3 text-right font-bold">Subtotal</td><td className="px-3 py-3 font-bold">{formatCurrency(subtotal)}</td></tr>
                  <tr className="bg-slate-50"><td colSpan={5} className="px-3 py-3 text-right font-bold">Potongan Harga</td><td className="px-3 py-3 font-bold">{formatCurrency(discountTotal)}</td></tr>
                  <tr className="bg-slate-50"><td colSpan={5} className="px-3 py-3 text-right font-bold">Pajak</td><td className="px-3 py-3 font-bold">{formatCurrency(taxAmount)}</td></tr>
                  <tr className="bg-slate-900 text-white"><td colSpan={5} className="px-3 py-4 text-right font-bold">Grand Total</td><td className="px-3 py-4 font-bold">{formatCurrency(grandTotal)}</td></tr>
                </tbody>
              </table>
            </div>
            <label className="flex items-center gap-3 border-t border-slate-100 pt-5 text-sm font-semibold text-slate-600">
              <input type="checkbox" checked={form.disable_auth_on_due} onChange={(e) => setForm({ ...form, disable_auth_on_due: e.target.checked })} className="h-5 w-5 rounded border-slate-300 text-indigo-600" />
              Nonaktifkan autentikasi saat tagihan jatuh tempo
            </label>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button type="button" onClick={() => router.push("/internet-services")} className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">Batal</button>
              <button className="h-10 rounded-lg bg-[#6366F1] px-8 text-sm font-semibold text-white shadow-sm shadow-indigo-200">Simpan Faktur</button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
