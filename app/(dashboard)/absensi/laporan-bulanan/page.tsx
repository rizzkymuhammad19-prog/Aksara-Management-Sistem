import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getJakartaParts } from "@/lib/jakarta";
import { ChevronLeft, Lock } from "lucide-react";

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function countWorkingDays(year: number, month: number /* 1-12 */, workDays: string[], holidayDates: Set<string>, capDay?: number) {
  const dayNameMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDay = capDay ? Math.min(capDay, daysInMonth) : daysInMonth;
  let count = 0;
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(Date.UTC(year, month - 1, d));
    const dayName = dayNameMap[date.getUTCDay()];
    if (!workDays.includes(dayName)) continue;
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (holidayDates.has(key)) continue;
    count++;
  }
  return count;
}

export default async function LaporanAbsensiBulananPage({ searchParams }: { searchParams: { year?: string; month?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (session.user.role !== "DIRECTOR") {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="card text-center py-12">
          <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
            <Lock size={22} />
          </div>
          <p className="text-text font-medium mb-1">Halaman ini khusus Direktur</p>
          <p className="text-sm text-text-secondary">Rekap absensi seluruh karyawan hanya bisa dilihat Direktur.</p>
        </div>
      </div>
    );
  }

  const nowParts = getJakartaParts();
  const year = Number(searchParams.year) || nowParts.year;
  const month = Number(searchParams.month) || nowParts.month; // 1-12
  const isCurrentMonth = year === nowParts.year && month === nowParts.month;
  const capDay = isCurrentMonth ? nowParts.day : undefined;

  const [settings, holidays, employees] = await Promise.all([
    prisma.setting.findUnique({ where: { id: "default" } }),
    prisma.holiday.findMany(),
    prisma.employee.findMany({ include: { user: true, division: true }, orderBy: { user: { name: "asc" } } }),
  ]);

  const workDays = (settings?.workDays || "Mon,Tue,Wed,Thu,Fri").split(",");
  const holidayKeys = new Set(
    holidays.map((h) => `${h.date.getUTCFullYear()}-${String(h.date.getUTCMonth() + 1).padStart(2, "0")}-${String(h.date.getUTCDate()).padStart(2, "0")}`)
  );

  const hariKerja = countWorkingDays(year, month, workDays, holidayKeys, capDay);

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));

  const rows = await Promise.all(
    employees.map(async (emp) => {
      const records = await prisma.attendance.findMany({
        where: { employeeId: emp.id, date: { gte: monthStart, lte: monthEnd } },
      });
      const hadir = records.filter((r) => r.status === "HADIR").length;
      const terlambat = records.filter((r) => r.status === "TERLAMBAT").length;
      const izin = records.filter((r) => r.status === "IZIN").length;
      const sakit = records.filter((r) => r.status === "SAKIT").length;
      const tidakHadirManual = records.filter((r) => r.status === "TIDAK_HADIR").length;
      const recorded = hadir + terlambat + izin + sakit + tidakHadirManual;
      const tidakHadir = tidakHadirManual + Math.max(hariKerja - recorded, 0);
      const persentase = hariKerja > 0 ? Math.round(((hadir + terlambat) / hariKerja) * 100) : 0;

      return {
        id: emp.id,
        name: emp.user.name,
        division: emp.division.name,
        hadir, terlambat, izin, sakit, tidakHadir, persentase,
      };
    })
  );

  const prevMonth = month === 1 ? { y: year - 1, m: 12 } : { y: year, m: month - 1 };
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const isFutureNext = nextMonth.y > nowParts.year || (nextMonth.y === nowParts.year && nextMonth.m > nowParts.month);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/absensi" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
          <ChevronLeft size={16} /> Absensi
        </Link>
        <h1 className="font-display text-xl font-medium text-text">Rekap Absensi Bulanan</h1>
        <p className="text-sm text-text-secondary">Hari kerja bulan ini: {hariKerja} hari (sesuai hari kerja & hari libur di Settings)</p>
      </div>

      <div className="flex items-center gap-3">
        <Link href={`/absensi/laporan-bulanan?year=${prevMonth.y}&month=${prevMonth.m}`} className="text-sm font-medium text-text-secondary hover:text-primary">
          ← Bulan sebelumnya
        </Link>
        <span className="text-sm font-medium text-text px-3 py-1.5 rounded-lg bg-slate-100">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        {!isFutureNext && (
          <Link href={`/absensi/laporan-bulanan?year=${nextMonth.y}&month=${nextMonth.m}`} className="text-sm font-medium text-text-secondary hover:text-primary">
            Bulan berikutnya →
          </Link>
        )}
      </div>

      <div className="card">
        {rows.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">Belum ada karyawan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-slate-100">
                  <th className="pb-2 font-medium">Nama</th>
                  <th className="pb-2 font-medium">Divisi</th>
                  <th className="pb-2 font-medium text-center">Hadir</th>
                  <th className="pb-2 font-medium text-center">Terlambat</th>
                  <th className="pb-2 font-medium text-center">Izin</th>
                  <th className="pb-2 font-medium text-center">Sakit</th>
                  <th className="pb-2 font-medium text-center">Tidak Hadir</th>
                  <th className="pb-2 font-medium text-right">% Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 font-medium text-text">{r.name}</td>
                    <td className="py-2.5 text-text-secondary">{r.division}</td>
                    <td className="py-2.5 text-center text-success font-medium">{r.hadir}</td>
                    <td className="py-2.5 text-center text-warning font-medium">{r.terlambat}</td>
                    <td className="py-2.5 text-center text-primary font-medium">{r.izin}</td>
                    <td className="py-2.5 text-center text-text-secondary font-medium">{r.sakit}</td>
                    <td className="py-2.5 text-center text-danger font-medium">{r.tidakHadir}</td>
                    <td className="py-2.5 text-right font-semibold text-text">{r.persentase}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
