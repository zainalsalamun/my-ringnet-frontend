# Standar Struktur Project MyRingNet Frontend

Dokumen ini menjadi patokan umum agar pengembangan UI MyRingNet rapi, konsisten, dan mudah dirawat.

## Prinsip Utama

1. `app/` hanya untuk route Next.js.
2. `src/config/` untuk konfigurasi route, sidebar, permission, dan theme.
3. `src/lib/` untuk helper umum seperti API client, error handling, formatter, dan session.
4. `src/features/` untuk logic per modul bisnis.
5. `components/` untuk komponen UI yang masih dipakai lintas halaman.
6. Jangan hardcode endpoint backend langsung di halaman. Gunakan API client/proxy.

## Struktur Folder Target

```txt
app/
├─ (auth)/
├─ (dashboard)/
└─ api/
   ├─ [...path]/route.ts
   └─ _lib/

src/
├─ config/
│  ├─ routes.ts
│  ├─ sidebar.ts
│  └─ theme.ts
├─ lib/
│  └─ api/
│     ├─ client.ts
│     ├─ endpoints.ts
│     ├─ errors.ts
│     └─ index.ts
├─ features/
├─ types/
└─ styles/

components/
├─ layout/
├─ pages/
├─ ui/
├─ forms/
├─ tables/
├─ maps/
└─ feedback/
```

## Standar Routes

Semua path halaman utama disimpan di:

```txt
src/config/routes.ts
```

Contoh pemakaian:

```ts
import { ROUTES } from "@/src/config/routes";

href={ROUTES.users.customer}
```

Tujuannya supaya perubahan URL cukup dilakukan di satu tempat.

## Standar Sidebar

Konfigurasi menu sidebar admin disimpan di:

```txt
src/config/sidebar.ts
```

Sidebar utama sebaiknya hanya bertugas render UI, bukan menyimpan struktur menu bisnis.

## Standar API Path

Frontend memakai path internal yang konsisten:

```txt
/api/v1/customers
/api/v1/companies
/api/v1/partners
/api/v1/pops
/api/v1/finance
/api/v1/internet-services
```

Mapping ke endpoint backend Dekadata dilakukan di:

```txt
app/api/_lib/compatibility.ts
```

Jadi halaman tidak perlu tahu endpoint asli backend seperti `customer/list`, `partner/list`, atau `broadband/list`.

## Standar API Client

API client utama ada di:

```txt
src/lib/api/client.ts
```

Import lama tetap didukung lewat:

```txt
lib/api.ts
```

Contoh:

```ts
import api from "@/lib/api";
```

atau untuk fitur baru:

```ts
import api, { API_ENDPOINTS } from "@/src/lib/api";
```

## Standar Feature API

Untuk modul baru, jangan panggil endpoint langsung dari halaman jika logic-nya mulai banyak. Buat wrapper di:

```txt
src/features/<nama-modul>/api.ts
```

Contoh:

```ts
import { customersApi } from "@/src/features/customers/api";

const response = await customersApi.list({ limit: 100 });
```

Feature API yang sudah disiapkan:

```txt
src/features/dashboard/api.ts
src/features/users/api.ts
src/features/customers/api.ts
src/features/business-customers/api.ts
src/features/partners/api.ts
src/features/pops/api.ts
src/features/technical-data/api.ts
src/features/finance/api.ts
```

Halaman lama boleh tetap memakai `@/lib/api` sementara. Saat ada maintenance di halaman tersebut, endpoint mentah sebaiknya dipindahkan ke feature API.

## Standar Handle Error

Error API dinormalisasi di:

```txt
src/lib/api/errors.ts
```

Standar pesan:

| Status | Makna | Tampilan UI |
| --- | --- | --- |
| 401 | Token expired | Arahkan login ulang |
| 403 | Akses ditolak | Tampilkan akses tidak tersedia |
| 404 | Data/endpoint tidak ditemukan | Tampilkan empty/error state |
| 422 | Validasi gagal | Tampilkan error form |
| 500 | Server error | Tampilkan pesan server bermasalah |
| 502 | Proxy/backend gagal | Tampilkan backend tidak merespons |

Halaman tidak boleh menampilkan error mentah seperti `AxiosError` ke user.

## Standar Theme

Token theme disimpan di:

```txt
src/config/theme.ts
```

Untuk komponen baru, pakai warna dan radius yang konsisten dari token tersebut. Hindari menambah warna acak jika tidak diperlukan.

## Urutan Refactor Bertahap

1. API route/proxy dipisah ke helper.
2. Sidebar dipindahkan ke config.
3. API client dipusatkan di `src/lib/api`.
4. Modul baru dibuat di `src/features/<nama-fitur>`.
5. Komponen berulang dipindah ke `components/ui`, `components/forms`, atau `components/tables`.

## Checklist Saat Menambah Fitur Baru

1. Tambahkan path halaman di `src/config/routes.ts`.
2. Tambahkan menu sidebar di `src/config/sidebar.ts` jika fitur perlu muncul di sidebar.
3. Tambahkan endpoint di `src/lib/api/endpoints.ts`.
4. Buat wrapper API di `src/features/<nama-fitur>/api.ts`.
5. Buat atau update halaman di `app/(dashboard)/.../page.tsx`.
6. Simpan komponen feature-specific di `src/features/<nama-fitur>/components/` jika mulai besar.
7. Simpan komponen reusable di `components/ui`, `components/forms`, `components/tables`, atau `components/maps`.
8. Gunakan `toAppApiError()` atau `getApiErrorMessage()` untuk pesan error.
9. Jalankan validasi:

```bash
npm run lint
npm run build
```

## Aturan Singkat

- `app/` untuk routing.
- `src/config/` untuk path/menu/theme.
- `src/lib/api/` untuk client, endpoint, error.
- `src/features/` untuk logic per modul.
- `components/` untuk UI yang dipakai ulang.
- Hindari endpoint string mentah di halaman baru.
- Hindari menampilkan error mentah dari Axios ke user.
