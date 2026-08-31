# AKSARA MANAGEMENT SYSTEM

Internal business & employee management system — keuangan, absensi (GPS), produktivitas, design tracker, dan laporan untuk 5 divisi.

## Stack
- Next.js 14 (App Router, TypeScript)
- PostgreSQL (Railway) + Prisma ORM
- NextAuth (role-based: DIRECTOR / ADMIN / EMPLOYEE)
- Tailwind CSS + shadcn/ui, tema biru-putih
- Recharts untuk grafik

## Cara push ke GitHub (dari repo kosong)

```bash
# di folder aksara/ yang sudah di-extract dari zip
git init
git remote add origin https://github.com/rizzkymuhammad19-prog/Aksara-Management-Sistem.git
git add .
git commit -m "chore: initial scaffold - schema, auth foundation, login page"
git branch -M main
git push -u origin main
```

Setelah push, Vercel otomatis build & deploy (kalau Git connection sudah dihubungkan di Vercel dashboard).

## Setup database

1. Copy `.env.example` jadi `.env`, isi `DATABASE_URL` (sudah terisi otomatis dengan connection string Railway Postgres yang baru dibuat)
2. `npm install`
3. `npm run db:push` — push schema Prisma ke database
4. `npm run db:seed` — isi data demo (akan ditambahkan di tahap berikutnya)
5. `npm run dev` — jalankan lokal di http://localhost:3000

## Status pembangunan

- [x] Database schema (semua tabel: users, employees, divisions, attendance, finance, tasks, design tracker, targets, performance, notifications, audit log)
- [x] Project scaffold (Next.js + Tailwind + tema visual)
- [x] Halaman login
- [ ] Auth (NextAuth + role-based access)
- [ ] Dashboard Direktur (KPI cards, grafik)
- [ ] Dashboard per divisi
- [ ] Modul keuangan (pemasukan/pengeluaran)
- [ ] Modul absensi GPS
- [ ] Design tracker
- [ ] Task/Kanban board
- [ ] Laporan (harian/mingguan/bulanan/eksekutif) + export PDF/Excel
- [ ] Notifikasi
- [ ] Seed data demo
