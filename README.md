# MyRingNet Frontend

Frontend admin dashboard untuk sistem manajemen ISP **MyRingNet**. Aplikasi ini dibangun dengan Next.js App Router, Tailwind CSS, Axios, Zustand, dan Recharts. UI memakai sidebar gelap, area konten terang, tabel operasional, form CRUD, dropdown custom, shimmer loading, panel notifikasi, peta OpenStreetMap, dan invoice builder.

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
- Sidebar dengan menu turunan `Pengguna`, `Keuangan`, `Pengaturan`, `Radius Server`, dan `Dokumen`.
- Dashboard ringkasan real dari backend: pelanggan, invoice, pendapatan, tunggakan, chart revenue, chart status invoice, grafik trafik internet harian (download/upload), aktivitas terbaru.
- Aplikasi production tidak memakai dummy/fallback data. Jika API gagal, halaman menampilkan shimmer lalu error/empty state.
- User Management dengan filter role/status dan default menyembunyikan role `pelanggan` dari daftar akun akses panel.
- Proteksi super admin agar tidak bisa dihapus.
- CRUD Admin, Pelanggan, Bisnis/Perusahaan, Marketing/Mitra individual, dan POP.
- Detail pelanggan dengan data real, peta OpenStreetMap, koordinat, profil layanan, faktur/tagihan, tiket, dan riwayat operasional.
- Form pelanggan dengan field operasional: username, password, email pengguna, KTP, NPWP, jenis pelanggan, koordinat, dukungan pembayaran, dukungan teknis, mitra bisnis, catatan, dan upload gambar profil.
- Picker koordinat berbasis peta dengan zoom, input koordinat manual, dan pencarian wilayah/alamat.
- Detail Bisnis/Perusahaan dan Marketing menampilkan informasi lengkap, pelanggan terdaftar, produk, faktur/tagihan, dan tiket.
- Modul Marketing memakai data mitra individual dari database, termasuk ID Mitra terpisah dari UUID internal.
- Menu `Keuangan > Faktur & Tagihan` untuk invoice pelanggan, invoice umum, dan invoice mitra/bisnis.
- Invoice builder dengan produk & jasa, harga satuan Rupiah, diskon, pajak, quantity, grand total, opsi nonaktifkan autentikasi saat jatuh tempo, dan detail invoice siap cetak.
- Nomor faktur dapat diklik menuju detail invoice.
- Status faktur dapat dibuka untuk melihat informasi autentikasi, tanggal, jatuh tempo, dan pengingat.
- CRUD Layanan Internet/Faktur dengan dropdown pelanggan dari data pelanggan.
- Input nominal Rupiah untuk tagihan dan pembayaran.
- CRUD Keuangan/Pembayaran dengan metode pembayaran dinamis dari database.
- CRUD Laporan.
- Pengaturan umum termasuk panel pajak inline edit.
- CRUD Paket Layanan di menu `Pengaturan > Paket Layanan`.
- CRUD Metode Pembayaran di menu `Pengaturan > Metode Pembayaran`.
- Profil Perusahaan di menu `Pengaturan > Profil Perusahaan`, termasuk logo dan data perusahaan.
- CRUD Kategori Dokumen di menu `Pengaturan > Kategori Dokumen`.
- Manajemen Dokumen (Legal/Kontrak) dengan menu `Dokumen`, mendukung upload file dan custom metadata (Nomor, Expired Date).
- Modul Radius Server: NAS/Router, Autentikasi, Grup Profil, Sesi Pengguna, dan Riwayat.
- Modul POP sebagai master lokasi/wilayah titik jaringan.
- Dropdown paket di form pelanggan dan invoice mengambil data dari tabel `service_packages`.
- Shimmer loading dan empty state tabel.
- Favicon/browser icon memakai logo RingNet.
- Pagination, pencarian data lokal (client-side search), dan state management pada tabel.
- Custom UI modal dialog untuk konfirmasi penghapusan data, menggantikan fungsi alert() bawaan browser.
- Integrasi penanganan error server-side validation yang ditampilkan secara inline pada form dan melalui toast notification.
- Custom dropdown (`SelectInput`) UI yang elegan dan interaktif sebagai pengganti select native.
- Konfigurasi Docker (`Dockerfile`, `.dockerignore`) siap pakai untuk kontainerisasi dan deployment frontend.
- Redirect otomatis ke halaman login apabila session (token) telah habis atau tidak valid.

## Struktur Penting

```text
app/
├── (dashboard)/
│   ├── dashboard/
│   ├── dokumen/
│   ├── internet-services/
│   ├── keuangan/
│   ├── laporan/
│   ├── marketing/
│   ├── pengaturan/
│   │   ├── kategori-dokumen/
│   │   ├── metode-pembayaran/
│   │   └── paket-layanan/
│   ├── radius/
│   └── users/
│       └── pop/
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
- `/pops`
- `/marketing`
- `/internet-services`
- `/finance`
- `/reports`
- `/settings`
- `/service-packages`
- `/payment-methods`
- `/documents`
- `/document-categories`
- `/radius/*`
- `/support-tickets`

## Catatan Data Production

- Halaman production wajib memakai data dari API backend.
- File `lib/fallback-data.ts` sudah dihapus dan tidak boleh dipakai ulang untuk mencegah data dummy tampil di production.
- Jika backend tidak merespons, UI menampilkan shimmer selama loading, lalu error state atau empty state.
- Data master seperti paket layanan, metode pembayaran, pelanggan, mitra, POP, radius, invoice, dan dokumen harus berasal dari database.

## Validasi

```bash
npm run lint
npm run build
```

Catatan: Next.js dapat menampilkan warning multiple lockfile jika ada `package-lock.json` di parent directory. Warning ini tidak menghalangi build.
