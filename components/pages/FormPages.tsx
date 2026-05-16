"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "@/lib/api";
import { Card, FormShell, SelectInput, TextArea, TextInput } from "@/components/ui/AdminUI";
import CoordinatePicker from "@/components/ui/CoordinatePicker";
import { customerTypeOptions } from "@/lib/customer-options";
import { useAuthStore } from "@/hooks/useAuth";
import * as fallback from "@/lib/fallback-data";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusOptions = [{ label: "Aktif", value: "active" }, { label: "Nonaktif", value: "nonactive" }];

function useSubmit(endpoint: string, redirect: string, method: "post" | "put" = "post") {
  const router = useRouter();
  return async (payload: any) => {
    await api[method](endpoint, payload);
    router.push(redirect);
  };
}

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

export function CustomerForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const [error, setError] = useState("");
  const [packageOptions, setPackageOptions] = useState<{ label: string; value: string }[]>([]);
  const [partnerOptions, setPartnerOptions] = useState<{ label: string; value: string }[]>([]);
  const [ticketOptions, setTicketOptions] = useState<{ label: string; value: string }[]>([]);
  const [adminOptions, setAdminOptions] = useState<{ label: string; value: string }[]>([]);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coordinatePickerOpen, setCoordinatePickerOpen] = useState(false);
  const [form, setForm] = useState({
    ticketId: "",
    name: "",
    username: "",
    password: "",
    phone: "",
    email: "",
    city: "",
    area: "",
    address: "",
    coordinate: "",
    ktp: "",
    npwp: "",
    customerType: "Perumahan / Apartemen / Kos",
    packageName: "Mega 50Mbps",
    supportPayment: "",
    supportTechnical: "",
    partnerId: "",
    profileImage: "",
    status: "active",
    notes: "",
  });

  useEffect(() => {
    const savedUser = typeof window !== "undefined" ? window.localStorage.getItem("ringnet_user") : null;
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    const activeUserName = currentUser?.name || parsedUser?.name || "";
    if (!activeUserName) return;
    setForm((current) => current.username === activeUserName ? current : { ...current, username: activeUserName });
  }, [currentUser?.name]);

  useEffect(() => {
    api.get("/service-packages?limit=100")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const options = data.map((item: any) => ({ label: item.name, value: item.name }));
        setPackageOptions(options);
        setForm((current) => current.packageName || !options[0] ? current : { ...current, packageName: options[0].value });
      })
      .catch(() => {
        setPackageOptions([]);
      });
  }, []);

  useEffect(() => {
    api.get("/partners?limit=500")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setPartnerOptions(data.map((item: any) => ({ label: item.partnerCode ? `${item.partnerCode} - ${item.name}` : item.name, value: item.id })));
      })
      .catch(() => setPartnerOptions([]));
  }, []);

  useEffect(() => {
    api.get("/support-tickets?limit=500")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setTicketOptions(data.map((item: any) => ({ label: `${item.ticketNo} - ${item.title}`, value: item.id })));
      })
      .catch(() => setTicketOptions([]));
  }, []);

  useEffect(() => {
    api.get("/users?limit=500&excludeRole=pelanggan,bisnis,mitra")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const options = data.map((item: any) => ({
          label: item.email ? `${item.name} - ${item.email}` : item.name,
          value: item.name,
        }));
        setAdminOptions(options);
        setForm((current) => {
          if (!options[0]) return current;
          return {
            ...current,
            username: current.username || options[0].value,
            supportPayment: current.supportPayment || options[0].value,
            supportTechnical: current.supportTechnical || options[0].value,
          };
        });
      })
      .catch(() => setAdminOptions([]));
  }, []);

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/customers/" + id)
      .then((res) => setForm((current) => mergeCleanForm(current, res.data.data || {})))
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat data pelanggan dari database."));
  }, [edit, id]);

  async function save() {
    setError("");
    try {
      const payload = new FormData();
      Object.entries({
        ticketId: form.ticketId,
        name: form.name,
        username: form.username,
        phone: form.phone,
        email: form.email,
        city: form.city,
        area: form.area,
        address: form.address,
        coordinate: form.coordinate,
        ktp: form.ktp,
        npwp: form.npwp,
        customerType: form.customerType,
        packageName: form.packageName,
        supportPayment: form.supportPayment,
        supportTechnical: form.supportTechnical,
        partnerId: form.partnerId,
        profileImage: form.profileImage,
        notes: form.notes,
        status: form.status,
      }).forEach(([key, value]) => payload.append(key, value || ""));
      if (profileFile) payload.append("profileImageFile", profileFile);
      if (edit && id) {
        await api.put("/customers/" + id, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/customers", payload, { headers: { "Content-Type": "multipart/form-data" } });
      }
      router.push("/users/pelanggan");
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan pelanggan.");
    }
  }

  return <FormShell title={(edit ? "Edit" : "Tambah") + " Pelanggan"} subtitle="Lengkapi informasi pelanggan dan paket internet." onSubmit={save} backHref="/users/pelanggan">{error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}<div className="grid gap-5 lg:grid-cols-2">
    <div className="lg:col-span-2"><SelectInput label="Tiket" value={form.ticketId} onChange={(e) => setForm({ ...form, ticketId: e.target.value })} options={[{ label: "Pilih Tiket", value: "" }, ...ticketOptions]} /></div>
    <TextInput label="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Masukkan nama lengkap" />
    <TextInput label="Nama Pengguna" value={form.username} readOnly className="bg-slate-50 text-slate-600" placeholder="Otomatis dari user yang login" />
    <TextInput label="Kata Sandi" type="password" value={currentUser ? "************" : ""} readOnly className="bg-slate-50 text-slate-600" placeholder="Otomatis dari user yang login" />
    <TextInput label="No Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0812-xxxx-xxxx" />
    <TextInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@contoh.com" />
    <TextInput label="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Masukkan kota" />
    <TextInput label="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
    <div>
      <span className="mb-2 block text-sm font-semibold text-slate-700">Koordinat</span>
      <div className="flex gap-2">
        <input value={form.coordinate} onChange={(e) => setForm({ ...form, coordinate: e.target.value })} placeholder="-7.77720164, 110.3977788" className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
        <button type="button" onClick={() => setCoordinatePickerOpen(true)} className="h-11 rounded-lg border border-indigo-200 px-4 text-sm font-bold text-indigo-600 hover:bg-indigo-50">Pilih Maps</button>
      </div>
    </div>
    <div className="lg:col-span-2"><TextInput label="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap" /></div>
    <TextInput label="Nomor KTP" value={form.ktp} onChange={(e) => setForm({ ...form, ktp: e.target.value })} placeholder="NIK KTP" />
    <TextInput label="NPWP" value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} placeholder="Nomor NPWP" />
    <SelectInput label="Jenis Pelanggan" value={form.customerType} onChange={(e) => setForm({ ...form, customerType: e.target.value })} options={customerTypeOptions} />
    <SelectInput label="Paket Internet" value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} options={packageOptions.length ? packageOptions : [{ label: "Belum ada paket", value: "" }]} disabled={!packageOptions.length} />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={statusOptions} />
    <SelectInput label="Dukungan Pembayaran" value={form.supportPayment} onChange={(e) => setForm({ ...form, supportPayment: e.target.value })} options={adminOptions.length ? adminOptions : [{ label: "Belum ada admin", value: "" }]} disabled={!adminOptions.length} />
    <SelectInput label="Dukungan Teknis" value={form.supportTechnical} onChange={(e) => setForm({ ...form, supportTechnical: e.target.value })} options={adminOptions.length ? adminOptions : [{ label: "Belum ada admin", value: "" }]} disabled={!adminOptions.length} />
    <SelectInput label="Mitra Bisnis" value={form.partnerId} onChange={(e) => setForm({ ...form, partnerId: e.target.value })} options={[{ label: "Pilih Mitra Bisnis", value: "" }, ...partnerOptions]} searchable searchPlaceholder="Cari ID mitra atau nama..." />
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">Gambar Profil</span>
      <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={(e) => setProfileFile(e.target.files?.[0] || null)} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-indigo-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
      {profileFile || form.profileImage ? <span className="mt-2 block text-xs font-medium text-slate-500">{profileFile?.name || form.profileImage}</span> : null}
    </label>
    <div className="lg:col-span-2"><TextArea label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan tambahan opsional" /></div>
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

export function CompanyForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const [error, setError] = useState("");
  const [form, setForm] = useState({ companyCode: "", name: "", email: "", phone: "", city: "Jakarta", area: "Jakarta", status: "active" });
  const submit = useSubmit(edit ? "/companies/" + id : "/companies", "/users/bisnis", edit ? "put" : "post");

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/companies/" + id)
      .then((res) => setForm((current) => mergeCleanForm(current, res.data.data || {})))
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat data bisnis dari database."));
  }, [edit, id]);

  async function save() {
    setError("");
    try {
      await submit({
        companyCode: form.companyCode,
        name: form.name,
        email: form.email,
        phone: form.phone,
        area: form.area,
        city: form.city,
        status: form.status,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan bisnis.");
    }
  }

  return <FormShell title={(edit ? "Edit" : "Tambah") + " Bisnis / Perusahaan"} subtitle="Data PT, CV, instansi, kantor, atau pelanggan enterprise." onSubmit={save} backHref="/users/bisnis">{error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}<div className="grid gap-5 lg:grid-cols-2">
    <TextInput label="ID Mitra" value={form.companyCode} onChange={(e) => setForm({ ...form, companyCode: e.target.value })} placeholder="Otomatis jika kosong" />
    <TextInput label="Nama Perusahaan / Instansi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
    <TextInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
    <TextInput label="No Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
    <TextInput label="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
    <TextInput label="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={statusOptions} />
  </div></FormShell>;
}

export function PartnerForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const [error, setError] = useState("");
  const [form, setForm] = useState({ partnerCode: "", name: "", phone: "", email: "", city: "Jakarta", area: "Jakarta", status: "active" });
  const submit = useSubmit(edit ? "/partners/" + id : "/partners", "/users/mitra", edit ? "put" : "post");

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/partners/" + id)
      .then((res) => setForm((current) => mergeCleanForm(current, res.data.data || {})))
      .catch((err) => setError(err.response?.data?.message || "Gagal memuat data mitra dari database."));
  }, [edit, id]);

  async function save() {
    setError("");
    try {
      await submit({
        partnerCode: form.partnerCode,
        name: form.name,
        phone: form.phone,
        email: form.email,
        area: form.area,
        city: form.city,
        status: form.status,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan mitra.");
    }
  }

  return <FormShell title={(edit ? "Edit" : "Tambah") + " Mitra"} subtitle="Informasi mitra perseorangan atau individual sebagai channel sales." onSubmit={save} backHref="/users/mitra">{error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}<div className="grid gap-5 lg:grid-cols-2">
    <TextInput label="ID Mitra" value={form.partnerCode} onChange={(e) => setForm({ ...form, partnerCode: e.target.value })} placeholder="Otomatis jika kosong" />
    <TextInput label="Nama Mitra Individual" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
    <TextInput label="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
    <TextInput label="No Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
    <TextInput label="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
    <TextInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={statusOptions} />
  </div></FormShell>;
}

export function LeadForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const [error, setError] = useState("");
  const [partnerOptions, setPartnerOptions] = useState<{ label: string; value: string }[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", status: "prospect", mitraId: "", notes: "" });
  const submit = useSubmit(edit ? "/marketing/" + id : "/marketing", "/marketing/leads", edit ? "put" : "post");

  useEffect(() => {
    api.get("/partners")
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
    api.get("/marketing/" + id).then((res) => {
      const data = res.data.data;
      setForm({
        name: data.customerName || data.name || "",
        phone: data.phone || "",
        status: String(data.status || "prospect").toLowerCase(),
        mitraId: String(data.partnerId || data.mitraId || ""),
        notes: data.notes || "",
      });
    }).catch(() => {
      const data = fallback.leads.find((row) => String(row.id) === String(id));
      if (data) setForm({ name: data.customerName || data.name, phone: data.phone, status: data.status, mitraId: String(data.mitraId), notes: "" });
    });
  }, [edit, id]);

  async function save() {
    setError("");
    try {
      await submit(form);
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

  useEffect(() => {
    api.get("/customers?limit=500")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const options = data.map((item: any) => ({
          label: [item.customerCode, item.name, item.phone].filter(Boolean).join(" - "),
          value: item.id,
          customer: item,
        }));
        setCustomerOptions(options);
      })
      .catch(() => {
        setCustomerOptions([]);
      });
  }, []);

  useEffect(() => {
    api.get("/service-packages?limit=100")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const options = data.map((item: any) => ({ label: item.name, value: item.name, price: Number(item.monthlyPrice || item.price || 0) }));
        setPackageOptions(options);
      })
      .catch(() => {
        setPackageOptions([
          { label: "Mega 20Mbps", value: "Mega 20Mbps", price: 250000 },
          { label: "Mega 50Mbps", value: "Mega 50Mbps", price: 500000 },
          { label: "Ultra 100Mbps", value: "Ultra 100Mbps", price: 850000 },
        ]);
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
    return `${prefix}/${year}/${month}/${Date.now().toString().slice(-6)}`;
  }

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/internet-services/" + id).then((res) => {
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
    }).catch(() => {
      const data = fallback.invoices.find((row) => String(row.id) === String(id));
      if (data) setForm({
        customer_id: "",
        customer_name: data.customerName,
        authentication_id: "",
        invoice_name: "",
        invoice_type: "pelanggan",
        no_faktur: data.noFaktur,
        no_invoice: data.noInvoice,
        service_type: data.serviceType,
        period_month: String(data.periodMonth),
        period_year: String(data.periodYear),
        amount: String(data.amount),
        status: data.status,
        due_date: toInputDate(data.dueDate),
        tax_percent: "0",
        notes: "",
        disable_auth_on_due: false,
      });
    });
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
        ? await api.put("/internet-services/" + id, payload)
        : await api.post("/internet-services", payload);
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
              <SelectInput label="Pelanggan" searchable searchPlaceholder="Cari ID pelanggan atau nama..." value={form.customer_id} onChange={(e) => chooseCustomer(e.target.value)} options={customerOptions.length ? [{ label: "Pilih pelanggan", value: "" }, ...customerOptions.map(({ label, value }) => ({ label, value }))] : [{ label: "Belum ada pelanggan", value: "" }]} disabled={!customerOptions.length} />
              <SelectInput label="Autentikasi" searchable searchPlaceholder="Cari autentikasi..." value={form.authentication_id} onChange={(e) => setForm({ ...form, authentication_id: e.target.value })} options={customerOptions.length ? [{ label: "Pilih autentikasi", value: "" }, ...customerOptions.map(({ label, value }) => ({ label, value }))] : [{ label: "Belum ada autentikasi", value: "" }]} disabled={!customerOptions.length} />
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
