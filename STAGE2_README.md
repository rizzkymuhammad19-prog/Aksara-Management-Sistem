# Stage 2 — Auth + Dashboard Direktur + Seed Data

## Cara pasang

1. Extract `aksara-stage2.zip` ini.
2. Copy-paste SEMUA folder/file di dalamnya ke folder project AKSARA kamu yang sudah ada di GitHub (timpa/replace kalau ada file dengan nama sama, terutama `package.json`, `app/layout.tsx`, dan `app/login/page.tsx`).
3. Upload ulang ke GitHub (drag & drop semua file yang berubah + yang baru lewat "Add files via upload", sama seperti sebelumnya). Commit.
4. Vercel otomatis build & deploy lagi.

## Setelah deploy berhasil — jalankan seed data (1x saja)

Karena seed perlu koneksi langsung ke database, jalankan ini dari komputer kamu (bukan dari Vercel):

```bash
# di folder project, dengan .env berisi DATABASE_URL yang sudah benar
npm install
npm run db:push      # push schema Prisma ke Postgres Railway
npm run db:seed       # isi data demo (5 divisi, 15 karyawan, keuangan, absensi, design)
```

Setelah itu, login ke aplikasi pakai:

**Email**: `direktur@aksara.com`
**Password**: `password123`

## Yang baru di stage ini

- NextAuth aktif — login sungguhan mengecek email/password ke database, session berisi role & divisi
- Middleware melindungi semua route dashboard (`/dashboard`, `/divisi`, `/keuangan`, dll) — otomatis redirect ke `/login` kalau belum login
- Sidebar navigation lengkap sesuai struktur menu di spec
- **Dashboard Direktur** hidup — KPI cards (pendapatan, pengeluaran, laba, karyawan, kehadiran, design) dan grafik (revenue trend, laba per divisi, donut kehadiran) diambil langsung dari database, bukan data statis
- Ringkasan per divisi
- Seed script data demo

## Belum dikerjakan (stage berikutnya)

- Dashboard per divisi individual
- Modul input keuangan (form pemasukan/pengeluaran)
- Absensi GPS check-in/check-out
- Design tracker (form input + gallery)
- Task/Kanban board
- Laporan harian/mingguan/bulanan/eksekutif + export PDF/Excel
- Notifikasi
- Halaman karyawan, performance, settings
