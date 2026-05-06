# MyRingNet Frontend

Frontend admin dashboard untuk sistem manajemen ISP **MyRingNet**. Aplikasi ini dibangun dengan Next.js App Router, Tailwind CSS, Axios, Zustand, dan Recharts. UI memakai sidebar gelap, area konten terang, tabel operasional, form CRUD, dropdown custom, shimmer loading, dan panel notifikasi.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Axios
- Zustand
- Recharts
- Lucide React

## Menjalankan Project

Pastikan backend berjalan di `http://localhost:3000`.

```bash
npm install
npm run dev -- -p 3001
```

Buka aplikasi di:

```text
http://localhost:3001
```

Panduan migrasi dan deployment VPS dikelola di repository backend: `my-ringnet-backend/DEPLOYMENT.md`.

Credential seed yang tersedia:

```text
Email: superadmin@ringnet.com
Password: password123
```

## Environment

Buat atau sesuaikan `.env.local`:

```env
NEXT_PUBLIC_API=http://localhost:3000/api
```

## Fitur Yang Sudah Ada

- Login JWT dan protected dashboard layout.
- Header dengan pencarian global visual, tombol logout, dropdown profil, dan panel notifikasi.
- Notifikasi real dari backend untuk invoice jatuh tempo, pembayaran diterima, dan lead baru.
- Sidebar dengan menu turunan `Pengguna` dan `Pengaturan`.
- Dashboard ringkasan real dari backend: pelanggan, invoice, pendapatan, tunggakan, chart revenue, chart status invoice, aktivitas terbaru.
- User Management dengan filter role/status dan default menyembunyikan role `pelanggan` dari daftar akun akses panel.
- Proteksi super admin agar tidak bisa dihapus.
- CRUD Admin, Pelanggan, Bisnis/Perusahaan, Mitra Bisnis.
- CRUD Marketing Leads dengan dropdown mitra dari database.
- CRUD List Tagihan/Layanan Internet dengan dropdown pelanggan dari data pelanggan.
- Input nominal Rupiah untuk tagihan dan pembayaran.
- CRUD Keuangan/Pembayaran.
- CRUD Laporan.
- Pengaturan umum termasuk panel pajak inline edit.
- CRUD Paket Layanan di menu `Pengaturan > Paket Layanan`.
- Dropdown paket di form pelanggan dan invoice mengambil data dari tabel `service_packages`.
- Shimmer loading dan empty state tabel.
- Favicon/browser icon memakai logo RingNet.
- Pagination, pencarian data lokal (client-side search), dan state management pada tabel.
- Custom UI modal dialog untuk konfirmasi penghapusan data, menggantikan fungsi alert() bawaan browser.
- Integrasi penanganan error server-side validation yang ditampilkan secara inline pada form dan melalui toast notification.
- Fallback data otomatis untuk mencegah blank screen/crash ketika request API backend gagal.
- Custom dropdown (`SelectInput`) UI yang elegan dan interaktif sebagai pengganti select native.
- Konfigurasi Docker (`Dockerfile`, `.dockerignore`) siap pakai untuk kontainerisasi dan deployment frontend.
- Redirect otomatis ke halaman login apabila session (token) telah habis atau tidak valid.

## Struktur Penting

```text
app/
├── (dashboard)/
│   ├── dashboard/
│   ├── internet-services/
│   ├── keuangan/
│   ├── laporan/
│   ├── marketing/
│   ├── pengaturan/
│   │   └── paket-layanan/
│   └── users/
├── layout.tsx
└── page.tsx

components/
├── layout/
│   ├── Header.tsx
│   └── Sidebar.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── FormPages.tsx
│   ├── ListPages.tsx
│   ├── MenuCrudPages.tsx
│   └── UserManagementPage.tsx
└── ui/
    └── AdminUI.tsx
```

## Integrasi API

Axios instance berada di `lib/api.ts` dan otomatis menambahkan token dari `localStorage`:

```text
ringnet_token
ringnet_user
```

Endpoint utama yang dipakai frontend:

- `/auth/login`
- `/dashboard/summary`
- `/dashboard/notifications`
- `/users`
- `/customers`
- `/companies`
- `/partners`
- `/marketing`
- `/internet-services`
- `/finance`
- `/reports`
- `/settings`
- `/service-packages`

## Validasi

```bash
npm run lint
npm run build
```

Catatan: Next.js dapat menampilkan warning multiple lockfile jika ada `package-lock.json` di parent directory. Warning ini tidak menghalangi build.
