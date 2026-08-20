# DOKUMENTASI LENGKAP MODUL SIDEBAR & INTEGRASI API MYRINGNET

Dokumen ini merangkum seluruh struktur navigasi sidebar, arsitektur modul, fungsionalitas UI, serta pemetaan integrasi endpoint API backend yang telah diterapkan pada **MyRingNet Frontend**.

---

## DAFTAR ISI
1. [Modul Dashboard](#1-modul-dashboard)
2. [Modul Pengguna (User Management)](#2-modul-pengguna-user-management)
3. [Modul Keuangan & Layanan Internet](#3-modul-keuangan--layanan-internet)
4. [Modul Radius & Jaringan (Network AAA)](#4-modul-radius--jaringan-network-aaa)
5. [Modul Data Teknis & Infrastruktur Fiber](#5-modul-data-teknis--infrastruktur-fiber)
6. [Modul Dokumen & Legalitas](#6-modul-dokumen--legalitas)
7. [Modul Tiket & Operasional](#7-modul-tiket--operasional)
8. [Modul Pengaturan Sistem](#8-modul-pengaturan-sistem)
9. [Modul Portal Khusus Mitra & Asisten AI](#9-modul-portal-khusus-mitra--asisten-ai)
10. [Standar UI & Kualitas Sistem](#10-standar-ui--kualitas-sistem)

---

## 1. MODUL DASHBOARD

### 1.1 Dashboard Utama
* **URL Path**: `/dashboard`
* **Peran**: Monitoring performa operasional dan finansial secara read-only.
* **Fitur Utama**:
  * Stat Cards: Total Pelanggan Aktif, Pelanggan Bisnis, Tagihan Berjalan, dan Mitra Reseller.
  * Visualisasi grafik tren transaksi dan sebaran pelanggan.
  * Mode tampilan *Read-only Monitoring* (tanpa form mutasi data langsung).
* **Integrasi API Endpoint**:
  * `POST /api/v1/customer/list` — Mengambil statistik jumlah pelanggan.
  * `POST /api/v1/business-customer/list` — Mengambil data agregasi pelanggan B2B.
  * `POST /api/v1/partner/list` — Mengambil jumlah mitra aktif.
  * `GET /api/v1/finance/summary` — Mengambil metrik performa keuangan.

### 1.2 Radius Dashboard
* **URL Path**: `/dashboards/radius`
* **Peran**: Monitoring server Radius, sesi autentikasi PPPoE/Hotspot, dan log jaringan live.
* **Fitur Utama**:
  * 4 Top Stat Cards: `SESI AKTIF`, `SERVER TERHUBUNG`, `BERHASIL 12J`, `GAGAL 12J`.
  * Grafik timeline 12 jam (Total, Berhasil, Gagal).
  * Status Server Radius & Penggunaan Resource.
  * Live Logs Streaming dengan filter (Berhasil, Gagal, Sesi, Sistem) dan tombol Pause/Clear.
  * Aktivitas Pengguna (Terhubung & Gagal Terhubung).
  * Tabel Sesi Aktif dengan pencarian dan filter status per kolom.
* **Integrasi API Endpoint**:
  * `POST /api/v1/radius/session/list` — Mengambil data sesi pengguna aktif.
  * `GET /api/v1/radius/server/status` — Status koneksi server Radius.
  * `GET /api/v1/radius/logs/live` — Log aktivitas autentikasi realtime.
  * `POST /api/v1/radius/auth/chart` — Data grafik autentikasi 12 jam.

---

## 2. MODUL PENGGUNA (USER MANAGEMENT)

### 2.1 Hak Akses (Privilege)
* **URL Path**: `/users/privilege`
* **Fitur Utama**:
  * Banner informatif hak akses role administrator.
  * Card ringkasan hak akses beserta daftar permission aktif.
  * **Modal Edit Izin & Role Matrix**: Manajemen matrix izin modular (Dashboard, Layanan Broadband, Pengguna, Radius, Keuangan, Tiket, Legal, Pengaturan) dengan tombol *Pilih Semua* dan *Kosongkan*.
  * **Modal Detail Izin**: Inspeksi izin aktif per kategori.
  * **Modal Tambah Hak Akses Baru**: Pembuatan role kustom dengan assigning izin awal.
* **Integrasi API Endpoint**:
  * `GET /api/v1/user-privilege/my-privileges` — Memuat daftar izin user yang sedang login.
  * `GET /api/v1/user-privilege/role-privileges` — Mengambil matrix hak akses berdasarkan role ID.
  * `POST /api/v1/user-privilege/update` — Menyimpan pembaruan matrix izin role.

### 2.2 Karyawan (Employee)
* **URL Path**: `/users/employee`
* **Fitur Utama**:
  * 4 Stat Cards: `Online`, `Hadir`, `Aktif`, `Tidak Aktif`.
  * Live switch toggle status aktif karyawan pada tabel.
  * Avatar warna, badge divisi, role privilege, dan direct WhatsApp button.
  * Filter pencarian spesifik per kolom (Status, Nama, ID Admin, Divisi, Aktivitas, Kehadiran).
* **Integrasi API Endpoint**:
  * `POST /api/v1/admin/list` — Mengambil daftar karyawan dan staff.
  * `POST /api/v1/admin/status/update` — Mengubah status aktif/nonaktif karyawan secara realtime.
  * `POST /api/v1/admin/attendance` — Memuat log presensi dan kehadiran staff.

### 2.3 Master Admin
* **URL Path**: `/users/admin` & `/users/admin/create`
* **Fitur Utama**: Master data akun admin, manajemen peran super admin, PIC, dan registrasi admin baru.
* **Integrasi API Endpoint**:
  * `POST /api/v1/admin/list` — Menampilkan daftar admin.
  * `POST /api/v1/admin/create` — Membuat akun administrator baru.
  * `POST /api/v1/admin/update` — Memperbarui data profil dan hak akses admin.

### 2.4 Pelanggan (Customer)
* **URL Path**: `/users/pelanggan`, `/users/pelanggan/new`, `/users/pelanggan/:id/edit`
* **Fitur Utama**:
  * Layout form presisi 8:4 kolom sesuai standar resmi `apps.ring.net.id/users/customer/create`.
  * **Kolom Kiri (8 Kolom)**: Informasi Umum, Alamat Lengkap, No. HP (+62), Email, NIK KTP 16 digit, NPWP, Catatan, Foto Profil, Berkas Identitas, Dukungan Teknis (PIC), Dukungan Pembayaran (PIC).
  * **Kolom Kanan (4 Kolom)**: Tiket Pemasangan, Mitra/Partner, Kredensial Akun (Username & Password dengan Show/Hide toggle), Status Akun, Jenis Pelanggan, Area Layanan, dan **Peta Titik Koordinat GPS (`CoordinatePicker`)**.
  * **Panel Data Teknis Broadband**: Paket Internet Broadband, Siklus Billing, Username PPPoE, Password PPPoE, Router NAS, POP, ODP, Port, IP Address.
* **Integrasi API Endpoint**:
  * `POST /api/v1/customer/list` — Mengambil daftar seluruh pelanggan broadband.
  * `POST /api/v1/customer/create` — Registrasi data pelanggan baru ke database.
  * `GET /api/v1/customer/read/{id}` — Membaca detail lengkap data pelanggan untuk edit.
  * `POST /api/v1/customer/update` — Menyimpan pembaruan data pelanggan.
  * `POST /api/v1/customer/delete` — Menghapus data pelanggan.
  * `POST /api/v1/product/broadband/select` — Mengambil opsi paket internet dinamis.

### 2.5 Pelanggan Bisnis (B2B)
* **URL Path**: `/users/bisnis` & `/users/bisnis/new`
* **Fitur Utama**: Manajemen pelanggan segmen korporasi, dedicated internet, SLA, dan PIC bisnis.
* **Integrasi API Endpoint**:
  * `POST /api/v1/business-customer/list` — Mengambil daftar pelanggan B2B.
  * `POST /api/v1/business-customer/create` — Input pelanggan bisnis baru.
  * `POST /api/v1/business-customer/update` — Update parameter kontrak & SLA bisnis.

### 2.6 Mitra / Partner Reseller
* **URL Path**: `/users/mitra` & `/users/mitra/create`
* **Fitur Utama**: Master data reseller & sub-branch, tier kemitraan, komisi revenue share, dan profil usaha.
* **Integrasi API Endpoint**:
  * `POST /api/v1/partner/list` — Menampilkan daftar seluruh mitra reseller.
  * `POST /api/v1/partner/create` — Mendaftarkan mitra baru.
  * `POST /api/v1/partner/update` — Mengubah status kemitraan & persentase bagi hasil.

### 2.7 POP (Point of Presence)
* **URL Path**: `/users/pop` & `/users/pop/new`
* **Fitur Utama**: Pendataan titik pusat distribusi jaringan lokal, kapasitas daya, baterai backup, dan PIC lokasi.
* **Integrasi API Endpoint**:
  * `POST /api/v1/pop/list` — Menampilkan daftar seluruh POP aktif.
  * `POST /api/v1/pop/create` — Menambahkan titik POP baru.

---

## 3. MODUL KEUANGAN & LAYANAN INTERNET

### 3.1 Manajemen Keuangan
* **URL Path**: `/keuangan`
* **Fitur Utama**: Laporan arus kas, total pendapatan bulanan, status piutang, dan pencatatan kas masuk/keluar.
* **Integrasi API Endpoint**:
  * `GET /api/v1/finance/summary` — Ringkasan metrik keuangan dan omzet.
  * `POST /api/v1/finance/transactions` — Riwayat mutasi keuangan.

### 3.2 Faktur & Tagihan (Internet Services)
* **URL Path**: `/internet-services`
* **Fitur Utama**:
  * Pembuatan invoice otomatis berdasarkan siklus billing (Bulanan/Tahunan).
  * Status tagihan (Lunas, Belum Lunas, Jatuh Tempo, Dibatalkan).
  * Cetak invoice digital dan konfirmasi pembayaran manual/otomatis.
* **Integrasi API Endpoint**:
  * `POST /api/v1/finance/invoices` — Mengambil daftar invoice pelanggan.
  * `POST /api/v1/finance/invoice/pay` — Memproses pelunasan invoice.
  * `GET /api/v1/finance/invoice/{id}` — Detail rincian tagihan invoice.

---

## 4. MODUL RADIUS & JARINGAN (NETWORK AAA)

### 4.1 NAS Router
* **URL Path**: `/radius/nas-router`
* **Fitur Utama**: Manajemen router gateway/NAS MikroTik, registrasi IP Address, Radius Secret, dan uji konektivitas.
* **Integrasi API Endpoint**:
  * `POST /api/v1/radius/nas/list` — Mengambil daftar router NAS.
  * `POST /api/v1/radius/nas/create` — Mendaftarkan router NAS baru.
  * `POST /api/v1/radius/nas/test-connection` — Menjalankan uji ping & status koneksi NAS.

### 4.2 Grup Profil (Bandwidth Profile)
* **URL Path**: `/radius/grup-profil`
* **Fitur Utama**: Konfigurasi profile rate-limit (Max Upload/Download), Shared Users, Address Pool, Session Timeout.
* **Integrasi API Endpoint**:
  * `POST /api/v1/radius/profile/list` — Mengambil daftar profil kecepatan.
  * `POST /api/v1/radius/profile/create` — Membuat profil bandwidth baru.

### 4.3 Log Autentikasi
* **URL Path**: `/radius/autentikasi`
* **Fitur Utama**: Rekam jejak upaya login pengguna (Access-Accept, Access-Reject, salah password, user expired).
* **Integrasi API Endpoint**:
  * `POST /api/v1/radius/auth/logs` — Riwayat autentikasi login pengguna.

### 4.4 Sesi Pengguna & Disconnect
* **URL Path**: `/radius/sesi-pengguna`
* **Fitur Utama**: Monitoring pelanggan aktif online, IP dinamis, MAC Address, dan tombol kick/disconnect user dari NAS.
* **Integrasi API Endpoint**:
  * `POST /api/v1/radius/session/list` — Sesi pengguna online realtime.
  * `POST /api/v1/radius/session/disconnect` — Mengirim perintah PoD (Packet of Disconnect) ke NAS.

### 4.5 Riwayat Sesi (Usage History)
* **URL Path**: `/radius/riwayat`
* **Fitur Utama**: Rekapitulasi durasi koneksi, total bytes upload, total bytes download, dan waktu session stop.
* **Integrasi API Endpoint**:
  * `POST /api/v1/radius/session/history` — Log riwayat pemakaian kuota dan sesi.

---

## 5. MODUL DATA TEKNIS & INFRASTRUKTUR FIBER

### 5.1 Peta Infrastruktur GIS
* **URL Path**: `/mitra/infrastruktur`
* **Fitur Utama**: Peta interaktif GIS (Leaflet) yang memetakan ODP, ODC, OLT, POP, dan jalur kabel fiber optik.
* **Integrasi API Endpoint**:
  * `POST /api/v1/maps/list` — Mengambil titik koordinat seluruh aset fisik jaringan.
  * `POST /api/v1/maps/create` — Menambahkan titik marker baru pada peta.

### 5.2 Perangkat Aktif (Router, Switch, OLT)
* **URL Path**: `/mitra/router`, `/mitra/switch`, `/mitra/olt`
* **Fitur Utama**: Inventaris hardware aktif, manajemen port, status interface, dan monitoring suhu perangkat.
* **Integrasi API Endpoint**:
  * `POST /api/v1/technical/devices/list` — Daftar perangkat aktif.
  * `POST /api/v1/technical/devices/create` — Input perangkat baru.

### 5.3 Perangkat Pasif (ODP, ODC, OTB)
* **URL Path**: `/mitra/odp`, `/mitra/odc`, `/mitra/otb`
* **Fitur Utama**: Manajemen kapasitas port splitter, redaman optik (dBm), port kosong vs terpakai.
* **Integrasi API Endpoint**:
  * `POST /api/v1/technical/fiber/list` — Daftar ODP/ODC/OTB terpasang.
  * `POST /api/v1/technical/fiber/create` — Registrasi titik pasif baru.

### 5.4 Jalur Kabel Fiber Optic
* **URL Path**: `/mitra/kabel`
* **Fitur Utama**: Tracing rute bentangan kabel fiber (Aerial/Underground), jumlah core, sambungan closure/splicing.
* **Integrasi API Endpoint**:
  * `POST /api/v1/fiber-cables/list` — Data jalur tarikan kabel.
  * `POST /api/v1/fiber-cables/create` — Menambahkan jalur kabel baru.

---

## 6. MODUL DOKUMEN & LEGALITAS

### 6.1 Dokumen Legalitas Perusahaan
* **URL Path**: `/dokumen/legalitas`
* **Fitur Utama**: Penyimpanan dan tracking masa berlaku dokumen izin ISP, Jartaplok, Kominfo, dan Sertifikat Standar.
* **Integrasi API Endpoint**:
  * `POST /api/v1/documents/list` — Menampilkan daftar dokumen izin resmi.
  * `POST /api/v1/documents/upload` — Upload file dokumen legalitas baru.

### 6.2 Verifikasi Legalitas Mitra
* **URL Path**: `/dokumen/legalitas-mitra`
* **Fitur Utama**: Verifikasi dokumen KTP penanggung jawab, NPWP badan usaha, NIB (Nomor Induk Berusaha), dan MoU kemitraan.
* **Integrasi API Endpoint**:
  * `POST /api/v1/partner/documents/list` — Mengambil berkas legalitas mitra yang diajukan.
  * `POST /api/v1/partner/documents/verify` — Menyetujui atau menolak verifikasi dokumen mitra.

---

## 7. MODUL TIKET & OPERASIONAL

### 7.1 Tiket Customer & Gangguan
* **URL Path**: `/mitra/tiket-customer`
* **Fitur Utama**:
  * Pembuatan tiket gangguan (LOS, redaman tinggi, koneksi lambat, kabel putus), komplain, maintenance, dan request survey.
  * Penugasan teknisi (Assign Handler), update status (*Open*, *In Progress*, *Closed*), dan upload foto bukti penanganan.
* **Integrasi API Endpoint**:
  * `POST /api/v1/ticket/list` — Mengambil seluruh tiket operasional.
  * `POST /api/v1/ticket/create` — Membuat tiket laporan gangguan baru.
  * `POST /api/v1/ticket/update-status` — Memperbarui progres penanganan tiket.

### 7.2 Katalog Produk
* **URL Path**: `/mitra/produk`
* **Fitur Utama**: Katalog paket broadband retail & corporate, tarif bulanan, dan batas kecepatan upload/download.
* **Integrasi API Endpoint**:
  * `POST /api/v1/product/broadband/select` — Dropdown pemilihan paket aktif.
  * `POST /api/v1/product/list` — Menampilkan seluruh katalog produk broadband.

---

## 8. MODUL PENGATURAN SISTEM

### 8.1 Pengaturan Umum
* **URL Path**: `/pengaturan`
* **Fitur Utama**: Konfigurasi nama ISP, batas toleransi isolir otomatis, template pesan WhatsApp, dan gateway email.
* **Integrasi API Endpoint**:
  * `GET /api/v1/settings/general` — Mengambil pengaturan sistem umum.
  * `POST /api/v1/settings/update` — Menyimpan konfigurasi sistem.

### 8.2 Profil Perusahaan
* **URL Path**: `/pengaturan/profil-perusahaan`
* **Fitur Utama**: Data legalitas PT/Badan Hukum, logo aplikasi, kontak customer service, nomor helpdesk, dan alamat kantor.
* **Integrasi API Endpoint**:
  * `GET /api/v1/settings/company` — Memuat data profil perusahaan.
  * `POST /api/v1/settings/company/update` — Memperbarui identitas perusahaan.

### 8.3 Paket Layanan
* **URL Path**: `/pengaturan/paket-layanan`
* **Fitur Utama**: Pengaturan master paket internet broadband, IP public gratis, masa aktif, dan kuota FUP.
* **Integrasi API Endpoint**:
  * `POST /api/v1/products/create` — Membuat paket layanan baru.
  * `POST /api/v1/products/update` — Mengubah detail paket layanan.

### 8.4 Metode Pembayaran
* **URL Path**: `/pengaturan/metode-pembayaran`
* **Fitur Utama**: Konfigurasi nomor rekening bank (BCA, Mandiri, BNI, BRI), integrasi QRIS, dan Payment Gateway.
* **Integrasi API Endpoint**:
  * `POST /api/v1/payment-methods/list` — Mengambil daftar channel pembayaran aktif.
  * `POST /api/v1/payment-methods/create` — Menambahkan channel pembayaran baru.

### 8.5 Kategori Dokumen
* **URL Path**: `/pengaturan/kategori-dokumen`
* **Fitur Utama**: Manajemen kategori pengelompokan berkas (Identitas Pribadi, Legalitas Usaha, Bukti Transaksi, SLA).
* **Integrasi API Endpoint**:
  * `POST /api/v1/settings/document-categories` — Mengambil dan mengelola kategori dokumen.

---

## 9. MODUL PORTAL KHUSUS MITRA & ASISTEN AI

### 9.1 Portal Mandiri Mitra
* **URL Path**: `/portal-mitra`
* **Fitur Utama**: Dashboard khusus mitra/reseller untuk mengelola pelanggan binaan, cetak invoice mitra, komisi saldo, dan pembukaan tiket.
* **Integrasi API Endpoint**:
  * `POST /api/v1/mitra-portal/summary` — Ringkasan performa finansial mitra.
  * `POST /api/v1/mitra-portal/customers` — Daftar pelanggan milik mitra tersebut.

### 9.2 Registrasi Calon Mitra
* **URL Path**: `/register-mitra`
* **Fitur Utama**: Wizard pendaftaran mandiri 3 langkah (Persetujuan Komitmen, Entri Data Usaha & PIC, Upload Dokumen & Tanda Tangan Digital).
* **Integrasi API Endpoint**:
  * `POST /api/v1/mitra-portal/register` — Mengirim berkas pengajuan calon reseller.

### 9.3 Assistant AI MyRingNet
* **Akses**: *Floating Widget Chatbot* di pojok kanan bawah antarmuka.
* **Fitur Utama**: Asisten cerdas berbasis AI untuk menjawab pertanyaan operasional, kendala teknis NOC, panduan billing, dan regulasi legalitas.
* **Integrasi API Endpoint**:
  * `POST /api/v1/ai/chat` — Pemrosesan percakapan interaktif AI.
  * `/api/ai/mitra-assistant` — Endpoint backend assistant query.

---

## 10. STANDAR UI & KUALITAS SISTEM

1. **Custom `SelectInput` Terstandar**:
   - Seluruh dropdown di aplikasi menggunakan komponen popover putih bersih (`SelectInput`).
   - Tidak ada lagi menu dropdown native OS yang berwarna hitam pekat.
   - Dilengkapi fitur pencarian (*Searchable*) dan animasi ikon centang (✔).
2. **Standard Validasi & Linting**:
   - `0 errors, 0 warnings` pada `npm run lint`.
3. **Branch & Repository**:
   - Seluruh kode terkini telah di-commit dan tersimpan di remote repository GitHub branch `integrasi-api-ringnet`.
