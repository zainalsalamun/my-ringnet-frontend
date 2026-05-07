"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "@/lib/api";
import { FormShell, SelectInput, TextArea, TextInput } from "@/components/ui/AdminUI";
import * as fallback from "@/lib/fallback-data";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export function CustomerForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const [error, setError] = useState("");
  const [packageOptions, setPackageOptions] = useState<{ label: string; value: string }[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "Jakarta", area: "Jakarta", customerType: "Individu", packageName: "Mega 50Mbps", status: "active", notes: "" });
  const submit = useSubmit(edit ? "/customers/" + id : "/customers", "/users/pelanggan", edit ? "put" : "post");

  useEffect(() => {
    api.get("/service-packages?limit=100")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const options = data.map((item: any) => ({ label: item.name, value: item.name }));
        setPackageOptions(options);
        setForm((current) => current.packageName || !options[0] ? current : { ...current, packageName: options[0].value });
      })
      .catch(() => {
        const options = [
          { label: "Mega 20Mbps", value: "Mega 20Mbps" },
          { label: "Mega 50Mbps", value: "Mega 50Mbps" },
          { label: "Ultra 100Mbps", value: "Ultra 100Mbps" },
        ];
        setPackageOptions(options);
      });
  }, []);

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/customers/" + id).then((res) => setForm((current) => ({ ...current, ...res.data.data }))).catch(() => {
      const data = fallback.customers.find((row) => String(row.id) === String(id));
      if (data) setForm((current) => ({ ...current, ...data }));
    });
  }, [edit, id]);

  async function save() {
    setError("");
    try {
      await submit({
        name: form.name,
        phone: form.phone,
        city: form.city,
        area: form.area,
        customerType: form.customerType,
        packageName: form.packageName,
        status: form.status,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan pelanggan.");
    }
  }

  return <FormShell title={(edit ? "Edit" : "Tambah") + " Pelanggan"} subtitle="Lengkapi informasi pelanggan dan paket internet." onSubmit={save} backHref="/users/pelanggan">{error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}<div className="grid gap-5 lg:grid-cols-2">
    <TextInput label="Nama Lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Masukkan nama lengkap" />
    <TextInput label="No Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0812-xxxx-xxxx" />
    <TextInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@contoh.com" />
    <SelectInput label="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} options={[{ label: "Jakarta", value: "Jakarta" }, { label: "Bekasi", value: "Bekasi" }, { label: "Depok", value: "Depok" }, { label: "Tangerang", value: "Tangerang" }]} />
    <TextInput label="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
    <SelectInput label="Tipe Pelanggan" value={form.customerType} onChange={(e) => setForm({ ...form, customerType: e.target.value })} options={[{ label: "Individu", value: "Individu" }, { label: "Rumahan", value: "Rumahan" }]} />
    <SelectInput label="Paket Internet" value={form.packageName} onChange={(e) => setForm({ ...form, packageName: e.target.value })} options={packageOptions.length ? packageOptions : [{ label: "Belum ada paket", value: "" }]} disabled={!packageOptions.length} />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={statusOptions} />
    <div className="lg:col-span-2"><TextArea label="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Catatan tambahan opsional" /></div>
  </div></FormShell>;
}

export function CompanyForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "Jakarta", area: "Jakarta", status: "active" });
  const submit = useSubmit(edit ? "/companies/" + id : "/companies", "/users/bisnis", edit ? "put" : "post");

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/companies/" + id).then((res) => setForm((current) => ({ ...current, ...res.data.data }))).catch(() => {
      const data = fallback.companies.find((row) => String(row.id) === String(id));
      if (data) setForm((current) => ({ ...current, ...data }));
    });
  }, [edit, id]);

  async function save() {
    setError("");
    try {
      await submit(form);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan bisnis.");
    }
  }

  return <FormShell title={(edit ? "Edit" : "Tambah") + " Bisnis"} subtitle="Data perusahaan atau pelanggan enterprise." onSubmit={save} backHref="/users/bisnis">{error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}<div className="grid gap-5 lg:grid-cols-2">
    <TextInput label="Nama Bisnis" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
    <TextInput label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
    <TextInput label="No Telepon" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
    <TextInput label="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
    <TextInput label="Kota" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={statusOptions} />
  </div></FormShell>;
}

export function PartnerForm({ edit = false, id }: { edit?: boolean; id?: string }) {
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "Jakarta", area: "Jakarta", status: "active" });
  const submit = useSubmit(edit ? "/partners/" + id : "/partners", "/users/mitra", edit ? "put" : "post");

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/partners/" + id).then((res) => setForm((current) => ({ ...current, ...res.data.data }))).catch(() => {
      const data = fallback.partners.find((row) => String(row.id) === String(id));
      if (data) setForm((current) => ({ ...current, ...data }));
    });
  }, [edit, id]);

  async function save() {
    setError("");
    try {
      await submit(form);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan mitra.");
    }
  }

  return <FormShell title={(edit ? "Edit" : "Tambah") + " Mitra"} subtitle="Informasi mitra bisnis dan channel sales." onSubmit={save} backHref="/users/mitra">{error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}<div className="grid gap-5 lg:grid-cols-2">
    <TextInput label="Nama Mitra" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
        const options = fallback.partners.map((item) => ({ label: item.name, value: item.id }));
        setPartnerOptions(options);
        setForm((current) => current.mitraId || !options[0] ? current : { ...current, mitraId: options[0].value });
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
  const [error, setError] = useState("");
  const [customerOptions, setCustomerOptions] = useState<{ label: string; value: string; customer: any }[]>([]);
  const [packageOptions, setPackageOptions] = useState<{ label: string; value: string }[]>([]);
  const [form, setForm] = useState({ customer_id: "", customer_name: "", no_faktur: "", no_invoice: "", service_type: "Mega 50Mbps", period_month: "5", period_year: "2026", amount: "", status: "UNPAID", due_date: "" });
  const submit = useSubmit(edit ? "/internet-services/" + id : "/internet-services", "/internet-services", edit ? "put" : "post");

  useEffect(() => {
    api.get("/customers?limit=100")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const options = data.map((item: any) => ({
          label: [item.name, item.phone, item.packageName].filter(Boolean).join(" - "),
          value: item.id,
          customer: item,
        }));
        setCustomerOptions(options);
      })
      .catch(() => {
        const options = fallback.customers.map((item) => ({
          label: [item.name, item.phone, item.packageName].filter(Boolean).join(" - "),
          value: item.id,
          customer: item,
        }));
        setCustomerOptions(options);
      });
  }, []);

  useEffect(() => {
    api.get("/service-packages?limit=100")
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        const options = data.map((item: any) => ({ label: item.name, value: item.name }));
        setPackageOptions(options);
      })
      .catch(() => {
        setPackageOptions([
          { label: "Mega 20Mbps", value: "Mega 20Mbps" },
          { label: "Mega 50Mbps", value: "Mega 50Mbps" },
          { label: "Ultra 100Mbps", value: "Ultra 100Mbps" },
        ]);
      });
  }, []);

  function chooseCustomer(customerId: string) {
    const selected = customerOptions.find((item) => item.value === customerId)?.customer;
    setForm((current) => ({
      ...current,
      customer_id: customerId,
      customer_name: selected?.name || current.customer_name,
      service_type: selected?.packageName || current.service_type,
    }));
  }

  function changeAmount(value: string) {
    setForm((current) => ({ ...current, amount: parseRupiah(value) }));
  }

  useEffect(() => {
    if (!edit || !id) return;
    api.get("/internet-services/" + id).then((res) => {
      const data = res.data.data;
      setForm({
        customer_id: data.customerId || "",
        customer_name: data.customerName || "",
        no_faktur: data.noFaktur || "",
        no_invoice: data.noInvoice || "",
        service_type: data.serviceType || "Mega 50Mbps",
        period_month: String(data.periodMonth || "5"),
        period_year: String(data.periodYear || "2026"),
        amount: String(data.amount || ""),
        status: data.status || "UNPAID",
        due_date: toInputDate(data.dueDate),
      });
    }).catch(() => {
      const data = fallback.invoices.find((row) => String(row.id) === String(id));
      if (data) setForm({
        customer_id: "",
        customer_name: data.customerName,
        no_faktur: data.noFaktur,
        no_invoice: data.noInvoice,
        service_type: data.serviceType,
        period_month: String(data.periodMonth),
        period_year: String(data.periodYear),
        amount: String(data.amount),
        status: data.status,
        due_date: toInputDate(data.dueDate),
      });
    });
  }, [edit, id]);

  async function save() {
    setError("");
    if (!form.customer_id) {
      setError("Pelanggan wajib dipilih dari data pelanggan.");
      return;
    }
    try {
      await submit({ ...form, period_month: Number(form.period_month), period_year: Number(form.period_year), amount: Number(parseRupiah(form.amount)) });
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan layanan internet.");
    }
  }

  return <FormShell title={(edit ? "Edit" : "Tambah") + " Layanan Internet"} subtitle="Buat atau ubah tagihan bulanan pelanggan." onSubmit={save} backHref="/internet-services">{error ? <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div> : null}<div className="grid gap-5 lg:grid-cols-2">
    <SelectInput label="Pelanggan" value={form.customer_id} onChange={(e) => chooseCustomer(e.target.value)} options={customerOptions.length ? [{ label: "Pilih pelanggan", value: "" }, ...customerOptions.map(({ label, value }) => ({ label, value }))] : [{ label: "Belum ada pelanggan", value: "" }]} disabled={!customerOptions.length} />
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">Tagihan</span>
      <div className="flex h-11 w-full items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <span className="mr-2 shrink-0 font-semibold text-slate-500">Rp</span>
        <input inputMode="numeric" value={formatRupiahInput(form.amount)} onChange={(e) => changeAmount(e.target.value)} placeholder="0" className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400" />
      </div>
    </label>
    <TextInput label="No Invoice" value={form.no_invoice} onChange={(e) => setForm({ ...form, no_invoice: e.target.value })} />
    <TextInput label="Tanggal Jatuh Tempo" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
    <TextInput label="No Faktur" value={form.no_faktur} onChange={(e) => setForm({ ...form, no_faktur: e.target.value })} />
    <SelectInput label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ label: "Belum Lunas", value: "UNPAID" }, { label: "Lunas", value: "PAID" }]} />
    <SelectInput label="Paket / Layanan" value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} options={packageOptions.length ? packageOptions : [{ label: "Belum ada paket", value: "" }]} disabled={!packageOptions.length} />
    <div className="grid grid-cols-2 gap-3"><SelectInput label="Periode" value={form.period_month} onChange={(e) => setForm({ ...form, period_month: e.target.value })} options={[{ label: "Mei", value: "5" }, { label: "Juni", value: "6" }, { label: "Juli", value: "7" }]} /><SelectInput label="Tahun" value={form.period_year} onChange={(e) => setForm({ ...form, period_year: e.target.value })} options={[{ label: "2026", value: "2026" }, { label: "2027", value: "2027" }]} /></div>
  </div></FormShell>;
}
