# Stage 2b — Setup Tanpa Terminal

Ini mengganti cara setup database. Sekarang SEMUA proses (push schema + isi data demo)
jalan otomatis dari server Vercel — kamu tidak perlu buka Terminal / jalankan npm sama sekali.

## Cara pasang

1. Extract `aksara-stage2b.zip`.
2. Copy 2 file ini ke folder project kamu (folder yang sama yang di-clone GitHub Desktop), timpa yang lama:
   - `package.json`
   - `app/api/seed/route.ts` (folder `api/seed` baru, biarkan saja kalau belum ada)
3. Buka GitHub Desktop → akan muncul 2 file berubah/baru di tab Changes.
4. Isi commit message (misal "auto db push + one-click seed"), klik **Commit to main**, lalu **Push origin**.
5. Tunggu Vercel selesai build (otomatis jalan setelah push) — sekarang proses build JUGA otomatis push schema Prisma ke database Railway, jadi tidak perlu `npm run db:push` manual lagi.
6. Setelah status deployment **Ready**, buka browser dan kunjungi:

   **https://aksara-management-sistem-final.vercel.app/api/seed?key=aksara-seed-2026**

   Kalau berhasil, akan muncul teks JSON seperti:
   `{"success":true,"message":"Seed selesai. Login: direktur@aksara.com / password123", ...}`

7. Buka `/login`, masuk dengan:
   - Email: `direktur@aksara.com`
   - Password: `password123`

Selesai — tidak ada Terminal, tidak ada `npm install` di komputer kamu sama sekali.

## Catatan

- Link `/api/seed?key=...` ini aman dijalankan berkali-kali (tidak akan duplikat data).
- Ke depannya, kalau ada perubahan schema database, itu juga otomatis ter-apply tiap kali kamu push ke GitHub (karena sudah masuk proses build).
