# AKSARA — Paket Lengkap Final (v2)

Ini gabungan SEMUA fitur dari awal sampai sekarang jadi 1 project utuh:
auth, dashboard, divisi (+ tambah/hapus, tab periode, export), karyawan
(+ tambah/hapus/nonaktifkan), keuangan (+ input per divisi), absensi GPS,
task Kanban, **design tracker**, **performance**, **laporan eksekutif**,
settings (+ hari kerja & hari libur), tema warna sesuai logo, menu mobile.

## Cara pasang (PALING AMAN: mulai dari folder kosong)

1. Buka folder project kamu (GitHub Desktop → Repository → Show in Finder).
2. Select SEMUA isi folder itu (Cmd+A), **Delete semua**.
3. Extract `aksara-COMPLETE-v2.zip`. Buka folder hasil extract (`aksara-COMPLETE-v2`), copy **SEMUA ISINYA** (bukan folder itu sendiri — app, components, lib, prisma, public, package.json, dst).
4. Paste ke folder project yang tadi sudah dikosongkan.
5. Buka GitHub Desktop — pastikan banyak file muncul di tab Changes (harusnya 90-an file).
6. Isi commit message (misal "complete v2 - semua fitur"), **Commit to main**, lalu **Push origin**.
7. Tunggu Vercel Ready — build kali ini agak lama (ada library baru: xlsx, jspdf) dan ada perubahan skema database (tabel Holiday baru), wajar.

## Setelah deploy sukses

Kalau kamu sebelumnya pernah full-reset, langsung lanjut isi data dari:
**Divisi → Tambah Divisi**, lalu **Karyawan → Tambah Karyawan**.

Kalau mau reset ulang dulu (opsional): buka
`https://aksara-management-sistem-final.vercel.app/api/full-reset?key=aksara-seed-2026`

## Menu baru yang bisa langsung dicoba

- **Design Tracker** (`/design`) — catat pekerjaan design per designer, dengan link hasil
- **Performance** (`/performance`) — ranking produktivitas karyawan (kehadiran, task selesai, jumlah design)
- **Laporan** (`/laporan`) — ringkasan eksekutif seluruh divisi, tab Harian/Mingguan/Bulanan, export PDF/Excel
- **Settings** (`/settings`) — jam kerja, **hari kerja** (centang Senin-Minggu), **hari libur** (tambah tanggal + keterangan)
- **Export PDF/Excel** — tombol di halaman Keuangan, tiap Divisi, dan Laporan

## Yang masih belum ada (untuk tahap berikutnya kalau dibutuhkan)

- Notifikasi otomatis (belum absen, deadline task, dst)
- Target karyawan per periode (field database sudah ada, UI belum)
- Audit log (pencatatan siapa mengubah apa — field database sudah ada, UI belum)
- Portfolio gallery design dengan thumbnail gambar (sekarang baru link URL)
