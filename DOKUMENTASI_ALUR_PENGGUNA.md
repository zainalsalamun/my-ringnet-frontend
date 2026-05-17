# Dokumentasi Alur Pengguna MyRingNet

Dokumen ini menjelaskan alur penggunaan aplikasi admin **MyRingNet** dari sudut pandang pengguna panel, seperti Super Admin, Admin, Finance, NOC/Support, dan tim operasional ISP.

## 1. Masuk Aplikasi

1. Buka aplikasi MyRingNet.
2. Sistem otomatis menampilkan halaman login jika belum ada sesi aktif.
3. Masukkan email dan kata sandi.
4. Jika login berhasil, pengguna diarahkan ke Dashboard.
5. Jika login gagal, aplikasi menampilkan pesan error spesifik, misalnya email tidak ditemukan, password salah, atau server tidak merespons.

Catatan:

- Akun `super_admin` adalah role tertinggi.
- Super Admin tidak dapat dihapus dari User Management.
- Jika token/session habis, pengguna otomatis diarahkan kembali ke login.

## 2. Dashboard

Dashboard adalah halaman ringkasan utama untuk melihat kondisi bisnis dan operasional ISP.

Informasi yang tersedia:

- Total pelanggan.
- Total invoice/faktur.
- Pendapatan.
- Tunggakan.
- Grafik pendapatan bulanan.
- Grafik status invoice.
- Grafik trafik internet harian.
- Aktivitas terbaru.
- Notifikasi invoice jatuh tempo, pembayaran, dan lead terbaru.

Alur penggunaan:

1. Buka menu `Dashboard`.
2. Pantau ringkasan operasional harian.
3. Klik notifikasi untuk melihat informasi yang perlu ditindaklanjuti.
4. Jika data belum tersedia, aplikasi menampilkan empty state.
5. Jika API gagal, aplikasi menampilkan shimmer lalu error state, bukan data dummy.

## 3. Pengguna

Menu `Pengguna` berisi data akun panel, pelanggan, bisnis/perusahaan, marketing/mitra individual, dan POP.

### User Management

Digunakan untuk mengatur akun yang bisa masuk ke panel admin.

Alur:

1. Buka `Pengguna > User Management`.
2. Gunakan filter role/status jika data user banyak.
3. Klik `Tambah User` untuk membuat akun baru.
4. Isi nama, email, password, role, dan status.
5. Simpan data.
6. Gunakan tombol edit untuk mengubah data.
7. Gunakan tombol hapus untuk menghapus user, kecuali Super Admin.

Role yang umum dipakai:

- `super_admin`
- `admin`
- role operasional lain sesuai kebutuhan sistem

Catatan:

- Data pelanggan tidak perlu ditampilkan sebagai akun panel kecuali pelanggan tersebut memang harus login ke sistem.
- User Management fokus untuk akun akses panel admin.

### Pelanggan

Digunakan untuk mengelola pelanggan individu.

Alur tambah pelanggan:

1. Buka `Pengguna > Pelanggan`.
2. Klik `Tambah Pelanggan`.
3. Isi data utama pelanggan:
   - Nama lengkap
   - Nomor telepon
   - Email pengguna
   - Kota
   - Area
   - Alamat
   - Koordinat
   - Nomor KTP
   - NPWP
   - Jenis pelanggan
   - Paket internet
   - Status
4. Isi data operasional:
   - Nama pengguna
   - Kata sandi
   - Dukungan pembayaran
   - Dukungan teknis
   - Marketing/Mitra terkait jika ada
   - Catatan
   - Gambar profil jika tersedia
5. Untuk koordinat, pengguna dapat mengetik manual atau memilih dari peta.
6. Simpan data.

Alur detail pelanggan:

1. Klik nama/ID pelanggan pada tabel.
2. Sistem menampilkan detail pelanggan, peta lokasi OpenStreetMap, profil layanan, faktur/tagihan, tiket, dan data pendukung lain.
3. Klik edit untuk memperbarui data pelanggan.

Catatan:

- ID Pelanggan berbeda dari UUID database.
- Data pelanggan yang terhubung ke bisnis/perusahaan atau marketing tetap tampil di halaman Pelanggan.

### Bisnis / Perusahaan

Digunakan untuk mengelola mitra berbentuk PT, CV, instansi, kampus, kantor, atau pelanggan enterprise.

Alur:

1. Buka `Pengguna > Bisnis / Perusahaan`.
2. Klik `Tambah Bisnis`.
3. Isi nama perusahaan/instansi, kontak, email, area, kota, alamat, koordinat, dan status.
4. Simpan data.
5. Klik ID Mitra untuk membuka detail.

Detail Bisnis/Perusahaan menampilkan:

- Informasi perusahaan.
- Peta lokasi.
- Pelanggan terdaftar di bawah perusahaan tersebut.
- Produk.
- Faktur & tagihan.
- Tiket.

Catatan:

- ID Mitra berbeda dari UUID database.
- Bisnis/Perusahaan dipisahkan dari Marketing/Mitra individual.

### Marketing

Menu Marketing digunakan untuk mengelola mitra individual atau perorangan sebagai channel penjualan.

Alur:

1. Buka `Pengguna > Marketing`.
2. Klik `Tambah Marketing`.
3. Isi nama, nomor telepon, email, area, kota, alamat, dan status.
4. Simpan data.
5. Klik ID Mitra untuk membuka detail.

Detail Marketing menampilkan:

- Informasi mitra individual.
- Pelanggan yang terdaftar melalui marketing tersebut.
- Faktur & tagihan pelanggan terkait.
- Tiket terkait.

Catatan:

- Marketing dulu disebut Mitra Bisnis pada beberapa referensi lama.
- Di aplikasi terbaru, istilah yang digunakan adalah Marketing.

### POP

POP adalah lokasi/wilayah titik jaringan tempat perangkat ISP berada atau area layanan dikonsentrasikan.

Alur:

1. Buka `Pengguna > POP`.
2. Klik `Tambah POP`.
3. Isi nama POP, area/wilayah, alamat, koordinat, dan status.
4. Simpan data.
5. Gunakan edit/hapus untuk memperbarui master POP.

## 4. Keuangan

Menu `Keuangan` berisi pembayaran dan faktur/tagihan.

### Pembayaran

Digunakan untuk mencatat pembayaran pelanggan dan rekonsiliasi.

Alur:

1. Buka `Keuangan > Keuangan`.
2. Klik `Tambah Pembayaran`.
3. Isi nomor referensi, nama pelanggan, nomor invoice, nominal Rupiah, metode pembayaran, status, tanggal bayar, dan catatan.
4. Simpan pembayaran.

Catatan:

- Metode pembayaran diambil dari database.
- Admin dapat menambah metode pembayaran dari menu Pengaturan.

### Faktur & Tagihan

Digunakan untuk membuat dan memantau invoice.

Jenis faktur:

- Faktur Pelanggan
- Faktur Umum
- Faktur Mitra & Bisnis

Alur membuat faktur:

1. Buka `Keuangan > Faktur & Tagihan`.
2. Klik `Tambah`.
3. Pilih jenis faktur.
4. Isi informasi tagihan:
   - Nama tagihan
   - Pelanggan/autentikasi jika faktur pelanggan
   - Jatuh tempo
   - Pajak
   - Catatan
5. Tambahkan produk & jasa:
   - Nama produk
   - Harga satuan
   - Potongan harga
   - Jumlah
6. Klik `Tambahkan Produk`.
7. Pastikan subtotal, diskon, pajak, dan grand total sudah sesuai.
8. Pilih opsi nonaktifkan autentikasi saat jatuh tempo jika dibutuhkan.
9. Klik `Simpan`.

Alur melihat detail faktur:

1. Klik nomor faktur pada tabel.
2. Sistem membuka detail invoice.
3. Pengguna dapat melihat rincian produk, total pembayaran, link pembayaran, status jatuh tempo, dan informasi pelanggan.
4. Gunakan tombol aksi seperti tambah pembayaran, ubah tagihan, batalkan tagihan, atau kirim pesan jika tersedia.

Alur status faktur:

1. Klik status faktur pada tabel.
2. Sistem menampilkan detail status seperti autentikasi, tanggal, jatuh tempo, dan pengingat.

## 5. Marketing Leads

Menu ini digunakan untuk mencatat calon pelanggan atau peluang penjualan.

Alur:

1. Buka menu Marketing Leads jika tersedia.
2. Klik tambah lead.
3. Isi nama lead, nomor telepon, status, mitra/marketing terkait, dan catatan.
4. Simpan data.
5. Update status lead menjadi prospect, deal, atau lost sesuai perkembangan.

Catatan:

- Jika modul lead disederhanakan di versi tertentu, data marketing utama tetap dikelola dari menu `Pengguna > Marketing`.

## 6. Radius Server

Menu Radius Server digunakan oleh tim teknis/NOC untuk memantau dan mengelola data radius.

Submenu:

- NAS / Router
- Autentikasi
- Grup Profil
- Sesi Pengguna
- Riwayat

Alur umum:

1. Buka `Radius Server`.
2. Pilih submenu yang dibutuhkan.
3. Gunakan pencarian/pagination untuk menemukan data.
4. Tambahkan, edit, atau hapus data sesuai kebutuhan.

Fungsi setiap submenu:

- NAS / Router: data router atau NAS radius.
- Autentikasi: data autentikasi pelanggan.
- Grup Profil: profil layanan dan limit kecepatan.
- Sesi Pengguna: sesi aktif pelanggan.
- Riwayat: log koneksi, gagal autentikasi, atau aktivitas radius.

## 7. Pengaturan

Menu `Pengaturan` berisi konfigurasi sistem.

### Pengaturan Umum

Digunakan untuk konfigurasi aplikasi dan nilai pajak.

Alur:

1. Buka `Pengaturan > Pengaturan Umum`.
2. Klik ikon edit pada field yang ingin diubah.
3. Ubah nilai.
4. Simpan perubahan.

Contoh pengaturan:

- PPN
- PPH23
- BHP
- USO
- KSO

### Profil Perusahaan

Digunakan untuk menyimpan identitas perusahaan yang dipakai di invoice dan tampilan aplikasi.

Data yang dikelola:

- Logo perusahaan
- Nama perusahaan
- Nomor telepon
- Email
- Kode pos
- Alamat
- Kelurahan
- Kecamatan
- Kabupaten/Kota
- Provinsi

### Paket Layanan

Digunakan untuk mengelola paket internet.

Alur:

1. Buka `Pengaturan > Paket Layanan`.
2. Klik `Tambah Paket`.
3. Isi nama paket, speed, harga, deskripsi, dan status.
4. Simpan data.

Paket ini akan muncul di form pelanggan dan invoice.

### Metode Pembayaran

Digunakan untuk mengatur pilihan metode pembayaran.

Alur:

1. Buka `Pengaturan > Metode Pembayaran`.
2. Klik `Tambah Metode`.
3. Isi nama, kode, deskripsi, dan status.
4. Simpan data.

Metode aktif akan muncul pada form tambah pembayaran.

### Kategori Dokumen

Digunakan untuk mengelola kategori dokumen legal/kontrak.

## 8. Dokumen

Menu Dokumen digunakan untuk menyimpan dokumen legal dan administratif.

Alur:

1. Buka menu Dokumen.
2. Pilih kategori dokumen.
3. Klik tambah dokumen.
4. Isi metadata dokumen seperti nomor, tanggal expired, dan catatan.
5. Upload file dokumen.
6. Simpan data.

Catatan:

- File tersimpan di backend pada folder upload.
- Kategori dokumen dapat dikonfigurasi dari Pengaturan.

## 9. Laporan

Menu laporan digunakan untuk mengelola template atau data laporan.

Alur:

1. Buka `Laporan`.
2. Klik `Tambah Laporan`.
3. Isi judul, kategori, periode, status publikasi, tanggal generate, dan catatan.
4. Simpan data.

## 10. Pola Loading, Error, dan Empty State

Aplikasi menggunakan pola berikut:

1. Saat data sedang dimuat, tampil shimmer.
2. Jika API berhasil dan data ada, tampilkan data dari database.
3. Jika API berhasil tetapi data kosong, tampilkan empty state.
4. Jika API gagal, tampilkan pesan error.
5. Aplikasi tidak menampilkan data dummy/fallback di production.

## 11. Rekomendasi Role Pengguna

Super Admin:

- Mengelola semua menu.
- Membuat dan mengatur user admin.
- Tidak bisa dihapus.

Admin Operasional:

- Mengelola pelanggan, bisnis/perusahaan, marketing, POP, dan dokumen.

Finance:

- Mengelola pembayaran, faktur/tagihan, metode pembayaran, dan laporan keuangan.

NOC / Support:

- Mengelola Radius Server, tiket, koordinat pelanggan, dan status layanan.

Marketing:

- Mengelola lead, mitra individual, dan pelanggan yang masuk melalui channel marketing.

## 12. Alur Kerja Harian Yang Disarankan

1. Login ke aplikasi.
2. Cek Dashboard dan notifikasi.
3. Tindak lanjuti invoice jatuh tempo atau pembayaran terbaru.
4. Tambahkan pelanggan baru jika ada pemasangan baru.
5. Hubungkan pelanggan ke Marketing atau Bisnis/Perusahaan jika relevan.
6. Buat faktur/tagihan dari menu Keuangan.
7. Catat pembayaran ketika pelanggan membayar.
8. Pantau Radius Server untuk sesi dan autentikasi pelanggan.
9. Upload atau perbarui dokumen jika ada kontrak/legalitas baru.
10. Buat laporan sesuai periode operasional.
