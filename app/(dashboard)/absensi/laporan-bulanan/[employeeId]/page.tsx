import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatJakartaTime } from "@/lib/jakarta";
import { ChevronLeft, Lock, CheckCheck } from "lucide-react";

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DAY_NAMES_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const DAY_KEY_MAP = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_LABEL: Record<string, string> = {
  HADIR: "Hadir",
  TERLAMBAT: "Terlambat",
  IZIN: "Izin",
  SAKIT: "Sakit",
  TIDAK_HADIR: "Tidak Hadir",
};

const STATUS_COLOR: Record<string, string> = {
  HADIR: "bg-success/10 text-success",
  TERLAMBAT: "bg-warning/10 text-warning",
  IZIN: "bg-primary-light text-primary",
  SAKIT: "bg-slate-100 text-text-secondary",
  TIDAK_HADIR: "bg-danger/10 text-danger",
};

async function correctDay(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (session?.user.role !== "DIRECTOR") redirect("/absensi?error=forbidden");

  const employeeId = formData.get("employeeId") as string;
  const dateStr = formData.get("date") as string;
  const status = formData.get("status") as string;
  const year = formData.get("year") as string;
  const month = formData.get("month") as string;

  const date = new Date(Date.UTC(Number(dateStr.slice(0, 4)), Number(dateStr.slice(5, 7)) - 1, Number(dateStr.slice(8, 10))));

  await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId, date } },
    update: { status: status as any, note: `Dikoreksi oleh ${session.user.name}` },
    create: { employeeId, date, status: status as any, note: `Dikoreksi oleh ${session.user.name}` },
  });

  redirect(`/absensi/laporan-bulanan/${employeeId}?year=${year}&month=${month}`);
}

async function markAllPresent(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (session?.user.role !== "DIRECTOR") redirect("/absensi?error=forbidden");

  const employeeId = formData.get("employeeId") as string;
  const year = Number(formData.get("year"));
  const month = Number(formData.get("month"));

  const settings = await prisma.setting.findUnique({ where: { id: "default" } });
  const workDays = (settings?.workDays || "Mon,Tue,Wed,Thu,Fri").split(",");
  const holidays = await prisma.holiday.findMany();
  const holidayKeys = new Set(
    holidays.map((h) => `${h.date.getUTCFullYear()}-${String(h.date.getUTCMonth() + 1).padStart(2, "0")}-${String(h.date.getUTCDate()).padStart(2, "0")}`)
  );

  const nowJakarta = new Date();
  const isCurrentMonth = year === nowJakarta.getUTCFullYear() && month === nowJakarta.getUTCMonth() + 1;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lastDay = isCurrentMonth ? Math.min(nowJakarta.getUTCDate(), daysInMonth) : daysInMonth;

  const updates = [];
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(Date.UTC(year, month - 1, d));
    const dayName = DAY_KEY_MAP[date.getUTCDay()];
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (!workDays.includes(dayName)) continue;
    if (holidayKeys.has(key)) continue;

    updates.push(
      prisma.attendance.upsert({
        where: { employeeId_date: { employeeId, date } },
        update: { status: "HADIR", note: `Ditandai hadir penuh oleh ${session.user.name}` },
        create: { employeeId, date, status: "HADIR", note: `Ditandai hadir penuh oleh ${session.user.name}` },
      })
    );
  }

  await prisma.$transaction(updates);

  redirect(`/absensi/laporan-bulanan/${employeeId}?year=${year}&month=${month}`);
}

export default async function EmployeeMonthlyAttendancePage({
  params,
  searchParams,
}: {
  params: { employeeId: string };
  searchParams: { year?: string; month?: string };
}) {
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
        </div>
      </div>
    );
  }

  const employee = await prisma.employee.findUnique({
    where: { id: params.employeeId },
    include: { user: true, division: true },
  });
  if (!employee) notFound();

  const now = new Date();
  const year = Number(searchParams.year) || now.getFullYear();
  const month = Number(searchParams.month) || now.getMonth() + 1;

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const records = await prisma.attendance.findMany({
    where: { employeeId: employee.id, date: { gte: monthStart, lte: monthEnd } },
  });
  const recordMap = new Map(records.map((r) => [r.date.toISOString().split("T")[0], r]));

  const days = Array.from({ length: daysInMonth }).map((_, i) => {
    const dayNum = i + 1;
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const dateObj = new Date(Date.UTC(year, month - 1, dayNum));
    const record = recordMap.get(dateKey);
    return {
      dateKey,
      dayNum,
      dayName: DAY_NAMES_ID[dateObj.getUTCDay()],
      status: record?.status,
      checkInAt: record?.checkInAt,
      checkOutAt: record?.checkOutAt,
      note: record?.note,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <Link href={`/absensi/laporan-bulanan?year=${year}&month=${month}`} className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
            <ChevronLeft size={16} /> Rekap Absensi Bulanan
          </Link>
          <h1 className="font-display text-xl font-medium text-text">{employee.user.name}</h1>
          <p className="text-sm text-text-secondary">{employee.division.name} · {MONTH_NAMES[month - 1]} {year}</p>
        </div>

        <form action={markAllPresent}>
          <input type="hidden" name="employeeId" value={employee.id} />
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="month" value={month} />
          <button type="submit" className="inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-white px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors">
            <CheckCheck size={16} /> Tandai Semua Hadir
          </button>
        </form>
      </div>

      <p className="text-xs text-text-secondary -mt-3">
        Tombol di atas menandai semua hari kerja bulan ini jadi "Hadir" sekaligus — cocok kalau karyawan ini masuk penuh sebulan. Setelah itu kamu tetap bisa koreksi hari tertentu satu-satu di bawah kalau perlu.
      </p>

      <div className="card">
        <div className="space-y-1.5">
          {days.map((d) => (
            <form
              key={d.dateKey}
              action={correctDay}
              className="flex items-center justify-between gap-3 border-b border-slate-50 last:border-0 py-2"
            >
              <input type="hidden" name="employeeId" value={employee.id} />
              <input type="hidden" name="date" value={d.dateKey} />
              <input type="hidden" name="year" value={year} />
              <input type="hidden" name="month" value={month} />

              <div className="w-20 shrink-0 text-sm text-text-secondary">
                {d.dayName}, {d.dayNum}
              </div>

              <div className="flex-1 text-xs text-text-secondary min-w-0 truncate">
                {d.checkInAt ? `Masuk ${formatJakartaTime(d.checkInAt)}` : ""}
                {d.checkOutAt ? ` · Pulang ${formatJakartaTime(d.checkOutAt)}` : ""}
                {d.note ? ` · ${d.note}` : ""}
              </div>

              {d.status && (
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_COLOR[d.status]}`}>
                  {STATUS_LABEL[d.status]}
                </span>
              )}

              <select name="status" defaultValue={d.status || ""} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary shrink-0">
                <option value="" disabled>Set status</option>
                <option value="HADIR">Hadir</option>
                <option value="TERLAMBAT">Terlambat</option>
                <option value="IZIN">Izin</option>
                <option value="SAKIT">Sakit</option>
                <option value="TIDAK_HADIR">Tidak Hadir</option>
              </select>
              <button type="submit" className="text-xs font-medium bg-ink text-white px-2.5 py-1.5 rounded-lg hover:bg-ink-soft transition-colors shrink-0">
                Simpan
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
