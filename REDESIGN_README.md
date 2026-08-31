# Redesign — Startup-Grade Visual Identity

## Yang berubah

- Warna: sidebar & hero login sekarang gelap navy (bukan putih polos), dengan aksen electric blue + cyan
- Font: heading pakai Space Grotesk (kesan tech/startup), body tetap Inter
- Halaman login: split-screen dengan panel gelap (bukan card gradient di tengah)
- Kartu "Laba Bersih" di dashboard dapat treatment signature (gradient gelap + glow) — beda dari kartu lain
- Semua warna chart disesuaikan dengan palet baru

## Cara pasang

1. Extract zip ini.
2. Copy semua isinya ke folder project kamu, **timpa** file yang sama:
   - `tailwind.config.ts`
   - `app/layout.tsx`
   - `app/globals.css`
   - `app/login/page.tsx`
   - `app/(dashboard)/layout.tsx`
   - `app/(dashboard)/dashboard/page.tsx`
   - `components/LoginForm.tsx`
   - `components/Sidebar.tsx`
   - `components/KpiCard.tsx`
   - `components/charts/RevenueChart.tsx`
   - `components/charts/ProfitByDivisionChart.tsx`
   - `components/charts/AttendanceDonut.tsx`
3. GitHub Desktop: Commit → Push origin.
4. Tunggu Vercel Ready, refresh halaman.
