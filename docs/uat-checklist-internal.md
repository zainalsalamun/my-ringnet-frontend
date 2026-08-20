# Checklist UAT Internal MyRingNet Frontend

Dokumen checklist ini digunakan untuk pelacakan pengujian manual per menu sebelum rilis production.

---

## Tabel Checklist UAT Per Menu

| No | Modul / Halaman | URL Frontend | Endpoint Backend Utama | Status UI | Status API | Catatan Bug / Temuan | Prioritas | PIC |
|:--:|:---|:---|:---|:---:|:---:|:---|:---:|:---:|
| 1 | **Login & Sesi** | `/` | `POST /admin/login`<br>`GET /admin/me` | Siap | Siap | Pastikan token tersimpan & redirect otomatis jika belum login. | P0 | Tim Frontend |
| 2 | **Dashboard Utama** | `/dashboard` | `GET /dashboard/notifications`<br>`POST /customer/list`<br>`GET /finance` | Siap | Sebagian | Periksa fallback card jika salah satu service lambat/down. | P0 | Tim Frontend |
| 3 | **User Admin & Pegawai** | `/users/admin`<br>`/users/employee` | `POST /admin/list`<br>`POST /admin/create`<br>`PATCH /admin/change-status` | Siap | Siap | Filter role super admin vs admin vs employee berjalan normal. | P1 | Tim Frontend |
| 4 | **Hak Akses (Privilege)** | `/users/privilege` | *Belum ada endpoint dedicated* | Mock | Placeholder | Menunggu API granular permission per role dari backend. | P2 | Tim Backend |
| 5 | **Pelanggan Residensial** | `/users/pelanggan`<br>`/users/pelanggan/[id]` | `POST /customer/list`<br>`GET /customer/read/:id`<br>`PATCH /customer/update` | Siap | Siap | Search, filter pagination, detail paket, dan peta marker pelanggan. | P0 | Tim Frontend |
| 6 | **Pelanggan Bisnis** | `/users/bisnis`<br>`/users/bisnis/[id]` | `GET /companies`<br>`GET /companies/:id`<br>`PUT /companies/:id` | Siap | Siap | Formulir penambahan bisnis, PIC kontak, paket enterprise. | P1 | Tim Frontend |
| 7 | **Reseller / Mitra** | `/users/mitra`<br>`/users/mitra/[id]` | `GET /partners`<br>`POST /partner/create`<br>`POST /partners/:id/customers` | Siap | Siap | Verifikasi pendaftaran mitra baru & assignment pelanggan. | P0 | Tim Frontend |
| 8 | **Point of Presence (POP)** | `/users/pop` | `POST /location-point/list`<br>`POST /location-point/create` | Siap | Siap | Peta modal picker koordinat POP dan status titik jaringan. | P1 | Tim Frontend |
| 9 | **Data Teknis & Topologi** | `/mitra/infrastruktur`<br>`/mitra/olt`<br>`/mitra/router` | `POST /location-point/list`<br>`GET /location-point/map-markers` | Siap | Siap | Filter kategori perangkat aktif (OLT/RO/SW) & pasif (ODP/ODC/OTB). | P1 | Tim Frontend |
| 10 | **Radius NAS & Profil** | `/radius/nas-router`<br>`/radius/autentikasi` | *Mock data lokal* | Siap | Mock | Perlu integrasi API FreeRADIUS / Mikrotik API backend. | P2 | Tim Backend |
| 11 | **Faktur & Tagihan** | `/internet-services`<br>`/internet-services/[id]` | `GET /internet-services`<br>`POST /internet-services`<br>`GET /settings` | Siap | Siap | Cetak PDF faktur, generate tagihan bulanan pelanggan. | P0 | Tim Frontend |
| 12 | **Keuangan & Pembayaran** | `/keuangan` | `GET /finance`<br>`POST /finance`<br>`GET /payment-methods` | Siap | Siap | Input transaksi bayar, pilihan rekening bank, status lunas. | P0 | Tim Frontend |
| 13 | **Laporan Keuangan** | `/laporan` | `GET /reports` | Siap | Dasar | Export Excel/PDF laporan menunggu integrasi generator backend. | P2 | Tim Frontend |
| 14 | **Dokumen Legalitas** | `/dokumen/legalitas`<br>`/dokumen/pks` | `GET /documents`<br>`POST /documents` | Siap | Siap | Upload file berkas MoU/PKS dan filter per kategori dokumen. | P1 | Tim Frontend |
| 15 | **Portal Mitra (Reseller)** | `/mitra/produk`<br>`/mitra/tiket`<br>`/mitra/settings` | `GET /mitra-portal/summary`<br>`GET /mitra-portal/tickets`<br>`PUT /mitra-portal/profile` | Siap | Siap | Portal mandiri reseller: tiket gangguan, komisi, dan paraf digital. | P0 | Tim Frontend |
| 16 | **Global Search Header** | Header Bar | *Client filter UI* | Siap | Client | Pencarian cepat menu/halaman (akan diperluas ke data entity). | P2 | Tim Frontend |
| 17 | **AI Assistant Chat** | Widget AI Chat | `GET /mitra-portal/ai-chat/history`<br>`POST /mitra-portal/ai-chat` | Siap | Siap | Tanya jawab teknis & operasional bantuan mitra. | P1 | Tim Frontend |
