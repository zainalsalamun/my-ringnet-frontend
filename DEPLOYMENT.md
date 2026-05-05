# MyRingNet Migration & VPS Deployment Guide

Dokumen ini menjelaskan langkah migrasi database dan deployment fullstack MyRingNet ke VPS Linux. Contoh di bawah memakai Ubuntu, PostgreSQL, Node.js, PM2, Nginx, dan domain dengan HTTPS.

## 1. Arsitektur Production

Rekomendasi layout production:

```text
Internet
  |
Nginx :80/:443
  |-- https://app.domain.com       -> Next.js frontend :3001
  |-- https://api.domain.com/api   -> Express backend :3000
  |
PostgreSQL local VPS :5432
```

Port internal:

- Backend Express: `3000`
- Frontend Next.js: `3001`
- PostgreSQL: `5432`
- Public access: hanya `80` dan `443`

## 2. Prasyarat VPS

Login ke VPS:

```bash
ssh root@YOUR_VPS_IP
```

Update server:

```bash
apt update
apt upgrade -y
apt install -y git curl build-essential nginx ufw
```

Install Node.js LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```

Install PM2:

```bash
npm install -g pm2
pm2 -v
```

Install PostgreSQL:

```bash
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
```

Firewall dasar:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

## 3. Setup Database Production

Masuk sebagai user postgres:

```bash
sudo -u postgres psql
```

Buat database dan user:

```sql
CREATE DATABASE ringnet_isp;
CREATE USER ringnet_user WITH ENCRYPTED PASSWORD 'CHANGE_THIS_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE ringnet_isp TO ringnet_user;
\q
```

Aktifkan permission schema public:

```bash
sudo -u postgres psql -d ringnet_isp
```

```sql
GRANT ALL ON SCHEMA public TO ringnet_user;
ALTER SCHEMA public OWNER TO ringnet_user;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
\q
```

Connection string production:

```env
DATABASE_URL="postgresql://ringnet_user:CHANGE_THIS_STRONG_PASSWORD@localhost:5432/ringnet_isp?schema=public"
```

## 4. Upload Source Code

Rekomendasi folder:

```bash
mkdir -p /var/www/ringnet
cd /var/www/ringnet
```

Jika memakai Git:

```bash
git clone YOUR_REPOSITORY_URL .
```

Pastikan struktur menjadi:

```text
/var/www/ringnet/
├── my-ringnet-backend/
└── my-ringnet-frontend/
```

Jika belum memakai Git, upload folder project dengan `rsync` dari lokal:

```bash
rsync -avz --exclude node_modules --exclude .next --exclude .git \
  /Users/macbookpro/development/ringnet/my-ringnet-backend \
  /Users/macbookpro/development/ringnet/my-ringnet-frontend \
  root@YOUR_VPS_IP:/var/www/ringnet/
```

## 5. Environment Production

Backend `.env`:

```bash
cd /var/www/ringnet/my-ringnet-backend
nano .env
```

Isi:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL="postgresql://ringnet_user:CHANGE_THIS_STRONG_PASSWORD@localhost:5432/ringnet_isp?schema=public"
JWT_SECRET="CHANGE_THIS_LONG_RANDOM_SECRET"
CLIENT_URL="https://app.domain.com"
```

Frontend `.env.local`:

```bash
cd /var/www/ringnet/my-ringnet-frontend
nano .env.local
```

Isi:

```env
NEXT_PUBLIC_API=https://api.domain.com/api
```

Jika frontend dan API memakai satu domain, contoh:

```env
NEXT_PUBLIC_API=https://domain.com/api
```

## 6. Install Dependencies

Backend:

```bash
cd /var/www/ringnet/my-ringnet-backend
npm install
npx prisma generate
```

Frontend:

```bash
cd /var/www/ringnet/my-ringnet-frontend
npm install
```

## 7. Migrasi Database

Untuk production, gunakan `prisma migrate deploy`, bukan `prisma migrate dev`.

```bash
cd /var/www/ringnet/my-ringnet-backend
npx prisma validate
npx prisma migrate deploy
```

Seed data awal hanya dijalankan jika database masih kosong atau memang ingin menambahkan data contoh:

```bash
node prisma/seed.js
```

Catatan penting:

- Jangan gunakan `prisma migrate reset` di production.
- Jangan hapus folder `prisma/migrations`.
- Semua tabel aplikasi sudah memakai UUID dan snake_case, termasuk `service_packages`.
- Migration production akan mengikuti riwayat yang ada di folder `prisma/migrations`.

## 8. Build Aplikasi

Build frontend:

```bash
cd /var/www/ringnet/my-ringnet-frontend
npm run build
```

Backend Express tidak perlu build karena berjalan langsung dari `src/server.js`.

## 9. Jalankan Dengan PM2

Buat file ecosystem:

```bash
cd /var/www/ringnet
nano ecosystem.config.js
```

Isi:

```js
module.exports = {
  apps: [
    {
      name: "my-ringnet-backend",
      cwd: "/var/www/ringnet/my-ringnet-backend",
      script: "src/server.js",
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "my-ringnet-frontend",
      cwd: "/var/www/ringnet/my-ringnet-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3001",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

Start:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Jalankan perintah yang ditampilkan oleh `pm2 startup`, lalu:

```bash
pm2 save
pm2 status
pm2 logs
```

## 10. Nginx Reverse Proxy

Contoh memakai dua subdomain:

- Frontend: `app.domain.com`
- API: `api.domain.com`

Buat config:

```bash
nano /etc/nginx/sites-available/ringnet
```

Isi:

```nginx
server {
    listen 80;
    server_name app.domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name api.domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan:

```bash
ln -s /etc/nginx/sites-available/ringnet /etc/nginx/sites-enabled/ringnet
nginx -t
systemctl reload nginx
```

## 11. HTTPS Dengan Certbot

Install Certbot:

```bash
apt install -y certbot python3-certbot-nginx
```

Generate SSL:

```bash
certbot --nginx -d app.domain.com -d api.domain.com
```

Test auto-renew:

```bash
certbot renew --dry-run
```

## 12. Deploy Update Berikutnya

Flow deploy update:

```bash
cd /var/www/ringnet
git pull
```

Backend:

```bash
cd /var/www/ringnet/my-ringnet-backend
npm install
npx prisma generate
npx prisma migrate deploy
pm2 restart my-ringnet-backend
```

Frontend:

```bash
cd /var/www/ringnet/my-ringnet-frontend
npm install
npm run build
pm2 restart my-ringnet-frontend
```

Cek:

```bash
pm2 status
pm2 logs --lines 100
```

## 13. Backup dan Restore Database

Backup sebelum migrasi:

```bash
mkdir -p /var/backups/ringnet
pg_dump -U ringnet_user -h localhost ringnet_isp > /var/backups/ringnet/ringnet_isp_$(date +%F_%H%M).sql
```

Restore:

```bash
psql -U ringnet_user -h localhost ringnet_isp < /var/backups/ringnet/FILE_BACKUP.sql
```

Jika memakai password PostgreSQL:

```bash
PGPASSWORD='CHANGE_THIS_STRONG_PASSWORD' pg_dump -U ringnet_user -h localhost ringnet_isp > backup.sql
```

## 14. Checklist Setelah Deploy

- Login ke frontend berhasil.
- `GET https://api.domain.com/api/dashboard/summary` mengembalikan response API.
- Sidebar `Pengaturan > Paket Layanan` bisa list, tambah, edit, hapus.
- Form pelanggan mengambil paket dari database.
- Form layanan internet mengambil pelanggan dan paket dari database.
- Nominal tagihan dan pembayaran tampil format Rupiah.
- Notifikasi dashboard muncul dari data invoice/payment/lead.
- PM2 status `online`.
- Nginx `nginx -t` sukses.
- SSL aktif dan auto-renew berhasil.

## 15. Troubleshooting

Prisma gagal connect:

```bash
npx prisma db pull
```

Jika gagal, cek `DATABASE_URL`, user PostgreSQL, password, dan permission schema public.

Port sudah dipakai:

```bash
lsof -iTCP:3000 -sTCP:LISTEN -n -P
lsof -iTCP:3001 -sTCP:LISTEN -n -P
```

Restart PM2:

```bash
pm2 restart my-ringnet-backend
pm2 restart my-ringnet-frontend
```

Log backend/frontend:

```bash
pm2 logs my-ringnet-backend
pm2 logs my-ringnet-frontend
```

Nginx error:

```bash
nginx -t
tail -f /var/log/nginx/error.log
```

Hydration warning karena browser extension:

- Jika terlihat atribut seperti `data-new-gr-c-s-check-loaded` atau `data-gr-ext-installed`, biasanya berasal dari extension seperti Grammarly.
- Root layout frontend sudah memakai `suppressHydrationWarning` untuk menghindari warning atribut extension.
